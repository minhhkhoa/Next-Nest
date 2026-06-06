import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { DetailProfileService } from 'src/modules/detail-profile/detail-profile.service';
import { UserResumeService } from 'src/modules/user-resume/user-resume.service';
import { JobsService } from 'src/modules/jobs/jobs.service';
import { SkillService } from 'src/modules/skill/skill.service';
import { IndustryService } from 'src/modules/industry/industry.service';
import { GEMINI_CHAT_MODEL } from '../provider/gemini-chat.provider';
import { jobRecommendationPromptTemplate } from '../prompts/job-recommendation.prompt';
import { jobMatchingExplanationPromptTemplate } from '../prompts/job-matching-explanation.prompt';
import { z } from 'zod';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { RedisService } from 'src/common/redis/redis.service';
import { OnEvent } from '@nestjs/event-emitter';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { ElasticsearchService } from 'src/modules/elasticsearch/elasticsearch.service';

//- schema trích xuất tiêu chí tìm kiếm từ gemini
const JobSearchCriteriaSchema = z.object({
  titleKeywords: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  level: z.string().optional().default(''),
  location: z.string().optional().default(''),
});

type JobSearchCriteria = z.infer<typeof JobSearchCriteriaSchema>;

@Injectable()
export class JobRecommendationService {
  private readonly logger = new Logger(JobRecommendationService.name);

  constructor(
    @Inject(GEMINI_CHAT_MODEL) private readonly llm: BaseChatModel,
    private readonly detailProfileService: DetailProfileService,
    private readonly userResumeService: UserResumeService,
    private readonly jobsService: JobsService,
    private readonly skillService: SkillService,
    private readonly redisService: RedisService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly industryService: IndustryService,
  ) {}

  //- hàm chính xử lý lấy gợi ý việc làm từ Redis (trả về lập tức)
  async recommendJobs(
    user: UserDecoratorType | undefined,
    force = false,
  ): Promise<any> {
    if (!user) {
      throw new BadRequestCustom(
        'Vui lòng đăng nhập để sử dụng tính năng AI gợi ý công việc.',
      );
    }

    //- tạo key để lưu và lấy cache từ redis
    const cacheKey = `recommendations:${user.id}`;
    if (!force) {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    //- fallback: nếu chưa có cache hoặc buộc làm mới, tính toán đồng bộ lập tức và lưu cache
    const computedData = await this.computeAndCacheRecommendations(
      user.id,
      user,
    );
    return computedData;
  }

  //- thực hiện thu thập dữ liệu, phân tích AI và lưu vào cache Redis
  async computeAndCacheRecommendations(
    userId: string,
    user: UserDecoratorType,
  ): Promise<any> {
    try {
      //- lấy thông tin hồ sơ chi tiết (detail-profile)
      let profile: any = null;
      try {
        profile = await this.detailProfileService.findOne(userId);
      } catch (e) {
        //- nếu chưa có profile thì coi như chưa điền hồ sơ
      }

      //- lấy tất cả cv của người dùng
      const resumes = await this.userResumeService.findAllByUser(user);

      //- kiểm tra xem người dùng đã điền thông tin hay chưa
      const hasDetailedProfile =
        profile &&
        (profile.sumary ||
          (profile.skillID && profile.skillID.length > 0) ||
          (profile.industryID && profile.industryID.length > 0) ||
          (profile.education && profile.education.length > 0) ||
          profile.level ||
          profile.address);

      const hasResumes = resumes && resumes.length > 0;

      //- nếu hồ sơ trống hoàn toàn và chưa viết cv
      if (!hasDetailedProfile && !hasResumes) {
        const defaultJobs = await this.jobsService.findHotOrAppliedJobs(15);
        const data = {
          hasProfile: false,
          message:
            'Hồ sơ của bạn hiện chưa đầy đủ thông tin và chưa có CV. AI đang gợi ý các công việc nổi bật. Bạn hãy cập nhật hồ sơ cá nhân hoặc viết CV để AI có thể hiểu rõ nhu cầu của bạn hơn.',
          recommendations: defaultJobs.map((job) => ({
            ...job,
            aiExplanation:
              'Công việc đang được tuyển dụng nhiều hoặc nổi bật trên hệ thống.',
          })),
        };
        //- lưu cache 1 tiếng đối với hồ sơ trống
        await this.redisService.set(
          `recommendations:${userId}`,
          data,
          1 * 60 * 60 * 1000,
        );
        return data;
      }

      //- xây dựng ngữ cảnh ứng viên để gửi tới gemini
      const profileContext = this.buildProfileContext(profile, resumes);

      //- gửi ngữ cảnh cho gemini trích xuất tiêu chí tìm kiếm dạng json
      const criteria = await this.extractSearchCriteria(profileContext);

      //- trích xuất thủ công các kỹ năng từ hồ sơ và cv nếu ai không trả về kết quả
      if (!criteria.skills || criteria.skills.length === 0) {
        criteria.skills = [];
        if (profile && profile.skillID && Array.isArray(profile.skillID)) {
          profile.skillID.forEach((s: any) => {
            const name = s.name?.vi || s.name?.en || s.name;
            if (name && !criteria.skills.includes(name)) {
              criteria.skills.push(name);
            }
          });
        }
        if (resumes && Array.isArray(resumes)) {
          resumes.forEach((resume) => {
            if (resume.content && Array.isArray(resume.content.skills)) {
              resume.content.skills.forEach((s: any) => {
                const name = s.value || s;
                if (typeof name === 'string' && !criteria.skills.includes(name)) {
                  criteria.skills.push(name);
                }
              });
            }
          });
        }
      }

      //- trích xuất thủ công các từ khóa chức danh từ kinh nghiệm làm việc
      if (!criteria.titleKeywords || criteria.titleKeywords.length === 0) {
        criteria.titleKeywords = [];
        if (profile && profile.level) {
          criteria.titleKeywords.push(profile.level);
        }
        if (resumes && Array.isArray(resumes)) {
          resumes.forEach((resume) => {
            if (resume.content && Array.isArray(resume.content.experience)) {
              resume.content.experience.forEach((exp: any) => {
                if (exp.position && !criteria.titleKeywords.includes(exp.position)) {
                  criteria.titleKeywords.push(exp.position);
                }
              });
            }
          });
        }
      }

      //- trích xuất cấp bậc từ thông tin hồ sơ
      if (!criteria.level && profile && profile.level) {
        criteria.level = profile.level;
      }

      //- trích xuất địa điểm từ thông tin hồ sơ
      if (!criteria.location && profile && profile.address) {
        criteria.location = profile.address;
      }

      //- ánh xạ tên kỹ năng dạng chữ sang skill object ids trong database
      const skillIDs = await this.mapSkillNamesToIds(criteria.skills);

      //- ánh xạ industry IDs từ profile của ứng viên
      const industryIDs: string[] = [];
      if (profile && profile.industryID && profile.industryID.length > 0) {
        profile.industryID.forEach((ind: any) => {
          const idStr = ind._id?.toString() || ind.toString();
          if (idStr) {
            industryIDs.push(idStr);
          }
        });
      }

      //- ánh xạ tên ngành nghề dạng chữ do AI trích xuất sang industry IDs trong database
      if (criteria.industries && criteria.industries.length > 0) {
        const aiIndustryIDs = await this.mapIndustryNamesToIds(criteria.industries);
        aiIndustryIDs.forEach((id) => {
          if (!industryIDs.includes(id)) {
            industryIDs.push(id);
          }
        });
      }

      //- tìm kiếm nhanh các jobs phù hợp trên elasticsearch
      const matchedJobIds = await this.elasticsearchService.searchJobs({
        titleKeywords: criteria.titleKeywords,
        skills: criteria.skills,
        level: criteria.level,
        location: criteria.location,
        industryIDs: industryIDs,
        skillIDs: skillIDs,
      });

      let jobs: any[] = [];
      if (matchedJobIds.length > 0) {
        const rawJobs = await this.jobsService.findByIds(matchedJobIds);
        //- sắp xếp các công việc theo đúng thứ tự relevance score trả về từ elasticsearch
        const jobMap = new Map(rawJobs.map((j) => [j._id.toString(), j]));
        jobs = matchedJobIds.map((id) => jobMap.get(id)).filter(Boolean);
      }

      //- chuyển đổi mongoose document sang plain object và chuẩn hóa thông tin công ty
      const finalRecommendations = jobs.map((job) => {
        const jobObject = typeof job.toObject === 'function' ? job.toObject() : job;
        const company = jobObject.companyID;
        if (company && typeof company === 'object' && '_id' in company) {
          jobObject.companyID = (company as any)._id;
          (jobObject as any).company = company;
        }
        return {
          ...jobObject,
          aiExplanation: 'Công việc phù hợp với kỹ năng và định hướng hồ sơ của bạn.',
        };
      });

      const data = {
        hasProfile: true,
        message: finalRecommendations.length > 0 
          ? 'AI đã phân tích hồ sơ và CV của bạn để đưa ra những gợi ý việc làm tốt nhất dưới đây.'
          : 'Hiện tại chưa có công việc nào hoàn toàn phù hợp với hồ sơ của bạn. Hãy thử cập nhật thêm kỹ năng hoặc chờ các cơ hội mới nhé.',
        recommendations: finalRecommendations,
      };

      //- lưu cache Redis thời hạn 24h
      await this.redisService.set(
        `recommendations:${userId}`,
        data,
        24 * 60 * 60 * 1000,
      );
      return data;
    } catch (error) {
      console.error('Lỗi khi gợi ý công việc bằng AI:', error);
      const errorData = {
        hasProfile: true,
        message:
          'Hệ thống gợi ý AI đang bận. Vui lòng thử lại sau.',
        recommendations: [],
      };
      //- lưu cache tạm 5 phút khi hệ thống lỗi hoặc quá tải để tránh spam api liên tục
      try {
        await this.redisService.set(
          `recommendations:${userId}`,
          errorData,
          5 * 60 * 1000,
        );
      } catch (cacheErr) {
        //- bỏ qua nếu lỗi redis
      }
      return errorData;
    }
  }

  //- lắng nghe sự kiện cập nhật profile để re-compute chạy ngầm
  @OnEvent('candidate.profile.updated', { async: true })
  async handleProfileUpdate(payload: {
    userId: string;
    user?: UserDecoratorType;
  }) {
    this.logger.log(
      `[Chạy nền] Bắt đầu tính toán lại gợi ý việc làm cho user: ${payload.userId}`,
    );
    const user = payload.user || ({ id: payload.userId } as UserDecoratorType);
    await this.computeAndCacheRecommendations(payload.userId, user);
    this.logger.log(
      `[Chạy nền] Đã lưu cache gợi ý việc làm mới cho user: ${payload.userId}`,
    );
  }

  //- lắng nghe sự kiện cập nhật CV để re-compute chạy ngầm
  @OnEvent('candidate.cv.updated', { async: true })
  async handleCvUpdate(payload: { userId: string; user?: UserDecoratorType }) {
    this.logger.log(
      `[Chạy nền] Bắt đầu tính toán lại gợi ý việc làm cho user do CV thay đổi: ${payload.userId}`,
    );
    const user = payload.user || ({ id: payload.userId } as UserDecoratorType);
    await this.computeAndCacheRecommendations(payload.userId, user);
    this.logger.log(
      `[Chạy nền] Đã lưu cache gợi ý việc làm mới cho user: ${payload.userId}`,
    );
  }

  //- lắng nghe sự kiện tải profile của ứng viên (làm nóng cache nếu chưa có)
  @OnEvent('candidate.profile.warmup', { async: true })
  async handleProfileWarmup(payload: {
    userId: string;
    user?: UserDecoratorType;
  }) {
    const cacheKey = `recommendations:${payload.userId}`;
    const cachedData = await this.redisService.get(cacheKey);

    if (cachedData) {
      //- đã có sẵn cache, bỏ qua để tránh tính toán thừa
      return;
    }

    this.logger.log(
      `[Chạy nền] Khởi động pre-warming cache gợi ý AI cho user: ${payload.userId}`,
    );
    const user = payload.user || ({ id: payload.userId } as UserDecoratorType);
    await this.computeAndCacheRecommendations(payload.userId, user);
    this.logger.log(
      `[Chạy nền] Pre-warming cache thành công cho user: ${payload.userId}`,
    );
  }

  //- lắng nghe sự kiện đăng xuất để xoá cache gợi ý
  @OnEvent('candidate.logout', { async: true })
  async handleCandidateLogout(payload: { userId: string }) {
    this.logger.log(
      `[Chạy nền] Xóa cache gợi ý việc làm của user do đăng xuất: ${payload.userId}`,
    );
    const cacheKey = `recommendations:${payload.userId}`;
    await this.redisService.del(cacheKey);
  }

  //- helper chuyển đổi cục json cv thành dạng markdown dễ đọc cho llm
  private formatResumeContent(content: any): string {
    if (!content) return '';
    try {
      const parts: string[] = [];
      if (content.personalInfo) {
        const pi = content.personalInfo;
        if (pi.description)
          parts.push(`Giới thiệu bản thân: ${pi.description}`);
      }
      if (content.professionalSummary) {
        parts.push(`Tóm tắt chuyên môn: ${content.professionalSummary}`);
      }
      if (content.skills && Array.isArray(content.skills)) {
        const skillsList = content.skills
          .map((s: any) => s.value || s)
          .join(', ');
        if (skillsList) parts.push(`Kỹ năng trong CV: ${skillsList}`);
      }
      if (content.experience && Array.isArray(content.experience)) {
        parts.push('Kinh nghiệm làm việc:');
        content.experience.forEach((exp: any) => {
          const resp =
            exp.responsibilities && Array.isArray(exp.responsibilities)
              ? exp.responsibilities.map((r: any) => r.value || r).join('; ')
              : '';
          parts.push(
            `- Vị trí: ${exp.position} tại ${exp.company} (${exp.startDate} - ${exp.endDate}). Trách nhiệm: ${resp}`,
          );
        });
      }
      if (content.projects && Array.isArray(content.projects)) {
        parts.push('Dự án:');
        content.projects.forEach((proj: any) => {
          parts.push(`- Tên dự án: ${proj.name}. Mô tả: ${proj.description}`);
        });
      }
      return parts.join('\n');
    } catch (e) {
      return JSON.stringify(content);
    }
  }

  //- xây dựng chuỗi ngữ cảnh đầy đủ về ứng viên
  private buildProfileContext(profile: any, resumes: any[]): string {
    const contextParts: string[] = [];

    if (profile) {
      contextParts.push('--- THÔNG TIN HỒ SƠ CÁ NHÂN ---');
      if (profile.sumary) contextParts.push(`Tóm tắt: ${profile.sumary}`);
      if (profile.level)
        contextParts.push(`Cấp bậc mong muốn: ${profile.level}`);
      if (profile.address)
        contextParts.push(`Địa điểm mong muốn: ${profile.address}`);

      if (profile.skillID && profile.skillID.length > 0) {
        const skills = profile.skillID
          .map((s: any) => s.name?.vi || s.name?.en || s.name || s)
          .join(', ');
        contextParts.push(`Kỹ năng trong hồ sơ: ${skills}`);
      }

      //- bổ sung thêm ngành nghề và giới tính của ứng viên vào ngữ cảnh
      if (profile.industryID && profile.industryID.length > 0) {
        const industries = profile.industryID
          .map((i: any) => i.name?.vi || i.name?.en || i.name || i)
          .join(', ');
        contextParts.push(`Ngành nghề: ${industries}`);
      }
      if (profile.gender) {
        contextParts.push(`Giới tính: ${profile.gender}`);
      }

      if (
        profile.desiredSalary &&
        (profile.desiredSalary.min || profile.desiredSalary.max)
      ) {
        contextParts.push(
          `Mức lương mong muốn: từ ${profile.desiredSalary.min} đến ${profile.desiredSalary.max}`,
        );
      }

      if (profile.education && profile.education.length > 0) {
        contextParts.push('Học vấn:');
        profile.education.forEach((edu: any) => {
          contextParts.push(`- Trường: ${edu.school}, Bằng cấp: ${edu.degree}`);
        });
      }
    }

    if (resumes && resumes.length > 0) {
      contextParts.push('\n--- THÔNG TIN CV/RESUME ---');
      resumes.forEach((resume, idx) => {
        contextParts.push(
          `CV thứ ${idx + 1}: ${resume.resumeName || 'Không tên'}`,
        );
        if (resume.content) {
          contextParts.push(
            `Chi tiết nội dung CV:\n${this.formatResumeContent(resume.content)}`,
          );
        }
      });
    }

    return contextParts.join('\n');
  }

  //- gọi gemini để phân tích hồ sơ và trích xuất tiêu chí tìm kiếm việc
  private async extractSearchCriteria(
    profileContext: string,
  ): Promise<JobSearchCriteria> {
    try {
      const messages = await jobRecommendationPromptTemplate.formatMessages({
        profile_context: profileContext,
      });

      const response = await this.llm.invoke(messages);
      const rawText = this.extractTextContent(response);
      return this.parseAndValidateCriteria(rawText);
    } catch (e) {
      console.error('Lỗi trích xuất tiêu chí tìm kiếm từ AI:', e);
      return { titleKeywords: [], skills: [], industries: [], level: '', location: '' };
    }
  }

  //- ánh xạ tên ngành nghề viết bằng chữ sang IDs trong cơ sở dữ liệu
  private async mapIndustryNamesToIds(industryNames: string[]): Promise<string[]> {
    if (!industryNames || industryNames.length === 0) return [];

    const industryIds: string[] = [];

    for (const name of industryNames.slice(0, 5)) {
      try {
        const result = await this.industryService.findAll(1, 1, name);

        if (result?.result && result.result.length > 0) {
          industryIds.push(result.result[0]._id.toString());
        }
      } catch (e) {
        //- bỏ qua nếu không tìm thấy industry tương thích trong hệ thống
      }
    }

    return industryIds;
  }

  //- gọi gemini để viết lời giải thích vì sao công việc phù hợp với ứng viên
  private async generateMatchExplanations(
    profileContext: string,
    jobs: any[],
  ): Promise<Record<string, string>> {
    try {
      //- rút gọn danh sách job đưa vào prompt để tối ưu token
      const jobsContext = jobs
        .map((job) => {
          const title = job.title?.vi || job.title?.en || job.title || '';
          const companyName = job.company?.name || job.companyID?.name || '';
          const description =
            job.description?.vi || job.description?.en || job.description || '';
          return `ID: ${job._id.toString()}\nTiêu đề: ${title}\nCông ty: ${companyName}\nMô tả: ${description.substring(0, 300)}...`;
        })
        .join('\n\n');

      const messages =
        await jobMatchingExplanationPromptTemplate.formatMessages({
          profile_context: profileContext,
          jobs_context: jobsContext,
        });

      const response = await this.llm.invoke(messages);
      const rawText = this.extractTextContent(response);
      return this.safeJsonParse(rawText) as Record<string, string>;
    } catch (e) {
      console.error('Lỗi sinh lời giải thích độ phù hợp công việc từ AI:', e);
      return {};
    }
  }

  //- ánh xạ tên kỹ năng viết bằng chữ sang IDs trong cơ sở dữ liệu
  private async mapSkillNamesToIds(skillNames: string[]): Promise<string[]> {
    if (!skillNames || skillNames.length === 0) return [];

    const skillIds: string[] = [];

    //- duyệt qua tối đa 10 kỹ năng được trích xuất để tránh bỏ sót các kỹ năng quan trọng phía sau
    for (const name of skillNames.slice(0, 10)) {
      try {
        const result = await this.skillService.findAllByFilter({
          currentPage: 1,
          pageSize: 1,
          name,
        });

        if (result?.result && result.result.length > 0) {
          skillIds.push(result.result[0]._id.toString());
        }
      } catch (e) {
        //- bỏ qua nếu không tìm thấy skill tương thích trong hệ thống
      }
    }

    return skillIds;
  }

  //- phụ trợ lấy text thô từ langchain response
  private extractTextContent(response: any): string {
    if (typeof response?.content === 'string') {
      return response.content;
    }

    if (Array.isArray(response?.content)) {
      const textParts = response.content
        .filter((part: any) => part?.type === 'text' && part?.text)
        .map((part: any) => part.text);

      if (textParts.length > 0) {
        return textParts.join('');
      }
    }

    return '{}';
  }

  //- parse và validate tiêu chí tìm việc bằng zod
  private parseAndValidateCriteria(rawText: string): JobSearchCriteria {
    const parsed = this.safeJsonParse(rawText);
    const result = JobSearchCriteriaSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    return { titleKeywords: [], skills: [], industries: [], level: '', location: '' };
  }

  //- helper an toàn phân tích chuỗi thành json
  private safeJsonParse(rawText: string): unknown {
    try {
      return JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match?.[0]) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return {};
        }
      }
      return {};
    }
  }
}
