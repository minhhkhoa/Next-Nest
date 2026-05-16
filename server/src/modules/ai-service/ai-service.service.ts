import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { UserResumeService } from '../user-resume/user-resume.service';
import { ChatAiService } from './services/chat-ai.service';
import { CvScoringService, CvScoreResult } from './services/cv-scoring.service';
import { JdMatchingService, JdMatchResult } from './services/jd-matching.service';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@Injectable()
export class AiServiceService {
  constructor(
    private readonly chatAiService: ChatAiService,
    private readonly cvScoringService: CvScoringService,
    private readonly jdMatchingService: JdMatchingService,
    private readonly jobsService: JobsService,
    private readonly userResumeService: UserResumeService,
  ) {}

  //- lay job va tao context, sau do goi chat ai
  async chat(jobId: string, question: string): Promise<{ jobId: string; answer: string }> {
    const job = await this.jobsService.getJobContextById(jobId);
    const jobContext = this.buildJobContext(job);
    const answer = await this.chatAiService.chat(jobId, jobContext, question);

    return { jobId, answer };
  }

  //- lay cv cua user, tao context va cham diem
  async scoreCv(cvId: string, user: UserDecoratorType): Promise<CvScoreResult> {
    const resume = await this.userResumeService.findOne(cvId, user);
    const cvContext = this.buildCvContext(resume);

    return this.cvScoringService.scoreCv(cvContext);
  }

  //- lay cv va job, tao context roi cham do khop
  async matchCvToJob(
    cvId: string,
    jobId: string,
    user: UserDecoratorType,
  ): Promise<JdMatchResult> {
    const [resume, job] = await Promise.all([
      this.userResumeService.findOneById(cvId),
      this.jobsService.getJobContextById(jobId),
    ]);

    const cvContext = this.buildCvContext(resume);
    const jobContext = this.buildJobContext(job);

    return this.jdMatchingService.matchCvToJob(cvContext, jobContext);
  }

  //- bien doi job thanh chuoi tom tat de dua vao prompt
  private buildJobContext(job: any): string {
    const title = job?.title?.vi || job?.title?.en || '';
    const companyName = job?.companyID?.name || '';
    const location = job?.location || '';
    const level = job?.level || '';
    const experience = job?.experience || '';
    const skills = Array.isArray(job?.skills)
      ? job.skills
          .map((skill: any) => skill?.name || skill?.nameVi || skill?.nameEn)
          .filter(Boolean)
      : [];
    const otherSkills = Array.isArray(job?.otherSkills) ? job.otherSkills : [];
    const description = job?.description?.vi || job?.description?.en || '';

    return [
      `Vi tri: ${title}`,
      companyName ? `Cong ty: ${companyName}` : null,
      location ? `Dia diem: ${location}` : null,
      level ? `Cap bac: ${level}` : null,
      experience ? `Kinh nghiem: ${experience}` : null,
      skills.length > 0 ? `Ky nang: ${skills.join(', ')}` : null,
      otherSkills.length > 0 ? `Ky nang khac: ${otherSkills.join(', ')}` : null,
      description ? `Mo ta: ${description}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }

  //- bien doi cv thanh chuoi tom tat de dua vao prompt
  private buildCvContext(resume: any): string {
    const resumeName = resume?.resumeName || '';
    const content = resume?.content ? JSON.stringify(resume.content) : '';

    return [
      resumeName ? `Ten CV: ${resumeName}` : null,
      content ? `Noi dung CV: ${content}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }
}
