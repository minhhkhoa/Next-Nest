import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client } from '@elastic/elasticsearch';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { FindJobAdvancedPublicQueryDto } from '../jobs/dto/jobDto.dto';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;
  private readonly indexName = 'jobs';

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Company.name) private readonly companyModel: Model<CompanyDocument>,
  ) {
    const node = this.configService.get<string>('ELASTICSEARCH_NODE');
    //- khởi tạo client kết nối tới elasticsearch
    this.client = new Client({
      node: node || 'http://localhost:9200',
    });
  }

  //- hàm tự động chạy khi nestjs khởi tạo module
  async onModuleInit() {
    this.logger.log('đang khởi chạy tiến trình kết nối tới elasticsearch...');
    await this.connectWithRetry();
  }

  //- hàm kết nối lại nhiều lần phòng trường hợp elasticsearch khởi động chậm hơn backend
  private async connectWithRetry(retries = 5, delay = 3000) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.client.ping();
        this.logger.log('kết nối thành công tới elasticsearch!');

        //- Kiểm tra cờ FORCE_REINDEX từ .env
        const forceReindex = this.configService.get<string>('ELASTICSEARCH_FORCE_REINDEX') === 'true';
        if (forceReindex) {
          this.logger.log('phát hiện cờ ELASTICSEARCH_FORCE_REINDEX=true. tiến hành xóa index cũ để rebuild...');
          await this.deleteIndexIfExists();
        }

        await this.createIndexIfNotExists();
        await this.syncExistingJobs(forceReindex);
        return;
      } catch (error) {
        this.logger.warn(
          `kết nối elasticsearch thất bại (lần thử ${i + 1}/${retries}). đang thử lại sau ${delay / 1000} giây...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    this.logger.error(
      'không thể kết nối tới elasticsearch sau nhiều lần thử. tính năng tìm kiếm nhanh bằng elasticsearch sẽ tạm ngưng hoạt động.',
    );
  }

  //- xóa index trên elasticsearch nếu tồn tại
  private async deleteIndexIfExists() {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      if (exists) {
        await this.client.indices.delete({ index: this.indexName });
        this.logger.log(`đã xóa thành công index "${this.indexName}".`);
      }
    } catch (error) {
      this.logger.error(`lỗi khi xóa index "${this.indexName}":`, error);
    }
  }

  //- tạo index và cấu hình analyzer tìm tiếng việt không dấu/có dấu cơ bản
  private async createIndexIfNotExists() {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      if (exists) {
        return;
      }

      this.logger.log(`đang khởi tạo index "${this.indexName}" trên elasticsearch...`);
      await this.client.indices.create({
        index: this.indexName,
        body: {
          settings: {
            analysis: {
              analyzer: {
                vi_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding'],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: {
                properties: {
                  vi: { type: 'text', analyzer: 'vi_analyzer' },
                  en: { type: 'text', analyzer: 'standard' },
                },
              },
              companyID: { type: 'keyword' },
              company: {
                properties: {
                  id: { type: 'keyword' },
                  name: { type: 'text', analyzer: 'vi_analyzer' },
                  taxCode: { type: 'keyword' },
                  status: { type: 'keyword' },
                  isDeleted: { type: 'boolean' },
                },
              },
              industryID: { type: 'keyword' },
              skills: { type: 'keyword' },
              description: {
                properties: {
                  vi: { type: 'text', analyzer: 'vi_analyzer' },
                  en: { type: 'text', analyzer: 'standard' },
                },
              },
              location: { type: 'text', analyzer: 'vi_analyzer' },
              salary: {
                properties: {
                  min: { type: 'integer' },
                  max: { type: 'integer' },
                  currency: { type: 'keyword' },
                },
              },
              level: { type: 'keyword' },
              employeeType: { type: 'keyword' },
              experience: { type: 'keyword' },
              status: { type: 'keyword' },
              isActive: { type: 'boolean' },
              isHot: {
                properties: {
                  isHotJob: { type: 'boolean' },
                  hotUntil: { type: 'date' },
                },
              },
              isDeleted: { type: 'boolean' },
              createdAt: { type: 'date' },
            },
          },
        },
      });
      this.logger.log(`tạo index "${this.indexName}" thành công.`); //- trigger reload index jobs
    } catch (error) {
      this.logger.error('lỗi khi tạo index trên elasticsearch:', error);
    }
  }

  //- đồng bộ dữ liệu ban đầu từ mongodb sang elasticsearch nếu index trống
  private async syncExistingJobs(forceSync = false) {
    try {
      if (!forceSync) {
        const countResponse = await this.client.count({ index: this.indexName });
        if (countResponse.count > 0) {
          this.logger.log(`index "${this.indexName}" đã có sẵn ${countResponse.count} bản ghi. bỏ qua đồng bộ ban đầu.`);
          return;
        }
      }

      this.logger.log('đang nạp dữ liệu ban đầu từ mongodb sang elasticsearch...');
      const jobs = await this.jobModel.find({ isDeleted: false }).populate('companyID').exec();
      if (jobs.length === 0) {
        this.logger.log('không tìm thấy job nào hợp lệ trong mongodb để đồng bộ.');
        return;
      }

      const body = jobs.flatMap((job) => [
        { index: { _index: this.indexName, _id: job._id.toString() } },
        this.mapJobToEsDocument(job),
      ]);

      const bulkResponse = await this.client.bulk({ refresh: true, body });
      if (bulkResponse.errors) {
        this.logger.error('đồng bộ hàng loạt sang elasticsearch gặp một số lỗi.');
      } else {
        this.logger.log(`đồng bộ thành công ${jobs.length} công việc từ mongodb sang elasticsearch.`);
      }
    } catch (error) {
      this.logger.error('lỗi trong tiến trình đồng bộ dữ liệu sang elasticsearch:', error);
    }
  }

  //- map mongodb document sang định dạng lưu trữ của elasticsearch
  private mapJobToEsDocument(job: any) {
    return {
      id: job._id.toString(),
      title: {
        vi: job.title?.vi || '',
        en: job.title?.en || '',
      },
      slug: {
        vi: job.slug?.vi || '',
        en: job.slug?.en || '',
      },
      companyID: job.companyID?._id?.toString() || job.companyID?.toString() || '',
      company: {
        id: job.companyID?._id?.toString() || job.companyID?.toString() || '',
        name: job.companyID?.name || '',
        taxCode: job.companyID?.taxCode || '',
        status: job.companyID?.status || 'PENDING',
        isDeleted: job.companyID?.isDeleted || false,
      },
      industryID: (job.industryID || []).map((id: any) => id.toString()),
      description: {
        vi: job.description?.vi || '',
        en: job.description?.en || '',
      },
      skills: (job.skills || []).map((id: any) => id.toString()),
      location: job.location || '',
      salary: {
        min: job.salary?.min || 0,
        max: job.salary?.max || 0,
        currency: job.salary?.currency || 'VND',
      },
      level: job.level || '',
      employeeType: job.employeeType || '',
      experience: job.experience || '',
      status: job.status || 'active',
      isActive: job.isActive || false,
      isHot: {
        isHotJob: job.isHot?.isHotJob || false,
        hotUntil: job.isHot?.hotUntil || null,
      },
      isDeleted: job.isDeleted || false,
      createdAt: job.createdAt || new Date(),
    };
  }

  //- thêm mới một công việc vào elasticsearch
  async indexJob(job: any) {
    try {
      let jobToSync = job;
      if (job.companyID && (typeof job.companyID === 'string' || job.companyID instanceof Types.ObjectId || !job.companyID.name)) {
        //- Tự động fetch thông tin company từ MongoDB nếu chưa được populate
        const company = await this.companyModel.findById(job.companyID).exec();
        if (company) {
          jobToSync = job.toObject ? job.toObject() : { ...job };
          jobToSync.companyID = company;
        }
      }
      await this.client.index({
        index: this.indexName,
        id: job._id.toString(),
        body: this.mapJobToEsDocument(jobToSync),
        refresh: true,
      });
      this.logger.log(`đã đồng bộ thêm mới job lên elasticsearch: ${job._id}`);
    } catch (error) {
      this.logger.error(`lỗi khi thêm mới job ${job._id} lên elasticsearch:`, error);
    }
  }

  //- cập nhật thông tin công việc trên elasticsearch
  async updateJob(id: string, job: any) {
    try {
      let jobToSync = job;
      if (job.companyID && (typeof job.companyID === 'string' || job.companyID instanceof Types.ObjectId || !job.companyID.name)) {
        //- Tự động fetch thông tin company từ MongoDB nếu chưa được populate
        const company = await this.companyModel.findById(job.companyID).exec();
        if (company) {
          jobToSync = job.toObject ? job.toObject() : { ...job };
          jobToSync.companyID = company;
        }
      }
      await this.client.index({
        index: this.indexName,
        id: id,
        body: this.mapJobToEsDocument(jobToSync),
        refresh: true,
      });
      this.logger.log(`đã đồng bộ cập nhật job lên elasticsearch: ${id}`);
    } catch (error) {
      this.logger.error(`lỗi khi cập nhật job ${id} lên elasticsearch:`, error);
    }
  }

  //- xóa hoặc cập nhật trạng thái xóa của công việc trên elasticsearch
  async deleteJob(id: string) {
    try {
      await this.client.delete({
        index: this.indexName,
        id: id,
        refresh: true,
      });
      this.logger.log(`đã xóa job khỏi elasticsearch: ${id}`);
    } catch (error) {
      this.logger.error(`lỗi khi xóa job ${id} khỏi elasticsearch:`, error);
    }
  }

  //- tìm kiếm nâng cao kết hợp nhiều bộ lọc, trả về mảng ids của các công việc phù hợp
  async searchJobs(criteria: {
    titleKeywords?: string[];
    skills?: string[];
    level?: string;
    location?: string;
    industryIDs?: string[];
    skillIDs?: string[];
  }): Promise<string[]> {
    const { titleKeywords, level, location, industryIDs, skillIDs } = criteria;

    //- thiết lập bộ lọc cứng: chỉ lấy job chưa bị xóa, đang active
    const must: any[] = [
      { term: { isDeleted: false } },
      { term: { isActive: true } },
      { term: { status: 'active' } },
    ];

    const should: any[] = [];

    //- tìm kiếm mờ theo danh sách từ khóa tiêu đề trên vi/en title và mô tả
    if (titleKeywords && titleKeywords.length > 0) {
      titleKeywords.forEach((keyword) => {
        if (keyword.trim()) {
          should.push({
            multi_match: {
              query: keyword.trim(),
              fields: ['title.vi^3', 'title.en^3', 'description.vi', 'description.en'],
              fuzziness: 'AUTO',
            },
          });
        }
      });
    }

    //- lọc theo kỹ năng (chính xác theo skill ids) - chuyển sang must để bắt buộc Job phải có ít nhất một kỹ năng của ứng viên
    if (skillIDs && skillIDs.length > 0) {
      must.push({
        terms: {
          skills: skillIDs,
        },
      });
    }

    //- lọc theo ngành nghề (chính xác theo industry ids) - chuyển sang must để bắt buộc đúng ngành
    if (industryIDs && industryIDs.length > 0) {
      must.push({
        terms: {
          industryID: industryIDs,
        },
      });
    }

    //- tìm kiếm mờ theo địa điểm (để ở should để ưu tiên địa điểm mong muốn, không bắt buộc)
    if (location) {
      should.push({
        match: {
          location: {
            query: location,
            fuzziness: 'AUTO',
          },
        },
      });
    }

    const query: any = {
      bool: {
        must,
      },
    };

    if (should.length > 0) {
      query.bool.should = should;
      //- nếu có các bộ lọc nên khớp, yêu cầu khớp tối thiểu một điều kiện để tăng điểm số
      query.bool.minimum_should_match = 1;
    }

    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query,
          size: 40, //- giới hạn trả về tối đa 40 kết quả
          _source: ['id'],
        },
      });

      const hits = response.hits.hits;
      return hits.map((hit: any) => hit._source.id || hit._id);
    } catch (error) {
      this.logger.error('lỗi khi truy vấn tìm kiếm nhanh trên elasticsearch:', error);
      return [];
    }
  }

  //- Tìm kiếm nâng cao có phân trang và lọc AND nghiêm ngặt cho trang Find Jobs
  async searchJobsPublicAdvanced(
    queryDto: FindJobAdvancedPublicQueryDto,
    industryObjectIds: string[],
  ): Promise<{ jobIds: string[]; totalItems: number }> {
    const {
      currentPage = 1,
      pageSize = 12,
      title,
      fieldCompany,
      address,
      level,
      employeeType,
      experience,
      isHot,
      minSalary,
      maxSalary,
      currency,
      skillIDs,
    } = queryDto;

    const skip = (currentPage - 1) * pageSize;

    //- 1. Lọc cứng (Bắt buộc khớp): must/filter
    const must: any[] = [
      { term: { isDeleted: false } },
      { term: { isActive: true } },
      { term: { status: 'active' } },
      { term: { 'company.isDeleted': false } },
      { term: { 'company.status': 'ACCEPT' } },
    ];

    const should: any[] = [];

    //- Lọc bắt buộc theo ngành nghề (đã phân giải cha + con)
    if (industryObjectIds && industryObjectIds.length > 0) {
      must.push({
        terms: {
          industryID: industryObjectIds,
        },
      });
    }

    //- Lọc bắt buộc theo kỹ năng
    if (skillIDs && skillIDs.length > 0) {
      must.push({
        terms: {
          skills: skillIDs,
        },
      });
    }

    //- Lọc bắt buộc cấp bậc (Dải cấp bậc tương thích)
    if (level) {
      const levelHierarchy = ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'];
      const selectedLevelIndex = levelHierarchy.indexOf(level);
      const compatibleLevels =
        selectedLevelIndex >= 0
          ? levelHierarchy.slice(0, selectedLevelIndex + 1)
          : [level];

      must.push({
        terms: {
          level: compatibleLevels,
        },
      });
    }

    //- Lọc bắt buộc kinh nghiệm (Dải kinh nghiệm tương thích)
    if (experience) {
      const experienceHierarchy = [
        'no_experience',
        'less_than_1_year',
        '1_to_3_years',
        '3_to_5_years',
        '5_to_10_years',
        'more_than_10_years',
      ];
      const selectedExperienceIndex = experienceHierarchy.indexOf(experience);
      const compatibleExperiences =
        selectedExperienceIndex >= 0
          ? experienceHierarchy.slice(0, selectedExperienceIndex + 1)
          : [experience];

      must.push({
        terms: {
          experience: compatibleExperiences,
        },
      });
    }

    //- Lọc bắt buộc hình thức làm việc
    if (employeeType) {
      must.push({
        term: {
          employeeType: employeeType,
        },
      });
    }

    //- Lọc bắt buộc việc làm hot
    if (isHot === 'true') {
      must.push({
        term: {
          'isHot.isHotJob': true,
        },
      });
    }

    //- Lọc bắt buộc loại tiền tệ
    if (currency) {
      must.push({
        term: {
          'salary.currency': currency,
        },
      });
    }

    //- Lọc bắt buộc dải lương (giao thoa dải lương)
    if (minSalary !== undefined && minSalary !== null) {
      must.push({
        range: {
          'salary.max': {
            gte: minSalary,
          },
        },
      });
    }
    if (maxSalary !== undefined && maxSalary !== null) {
      must.push({
        range: {
          'salary.min': {
            lte: maxSalary,
          },
        },
      });
    }

    //- 2. Tìm kiếm mờ (Tính điểm số liên quan): should
    //- Tìm kiếm theo title
    if (title && title.trim()) {
      should.push({
        multi_match: {
          query: title.trim(),
          fields: ['title.vi^5', 'title.en^5', 'description.vi', 'description.en'],
          fuzziness: 'AUTO',
        },
      });
    }

    //- Tìm kiếm theo công ty
    if (fieldCompany && fieldCompany.trim()) {
      should.push({
        multi_match: {
          query: fieldCompany.trim(),
          fields: ['company.name^3', 'company.taxCode^3'],
          fuzziness: 'AUTO',
        },
      });
    }

    //- Tìm kiếm theo địa điểm (address)
    if (address && address.trim()) {
      should.push({
        match: {
          location: {
            query: address.trim(),
            fuzziness: 'AUTO',
          },
        },
      });
    }

    const query: any = {
      bool: {
        must,
      },
    };

    if (should.length > 0) {
      query.bool.should = should;
      //- Khi có từ khóa tìm kiếm (title, company, address), bắt buộc phải khớp ít nhất một điều kiện trong should
      query.bool.minimum_should_match = 1;
    }

    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query,
          from: skip,
          size: pageSize,
          sort: [
            { _score: { order: 'desc' } },
            { 'isHot.isHotJob': { order: 'desc' } },
            { createdAt: { order: 'desc' } },
          ],
          _source: ['id'],
        },
      });

      const hits = response.hits.hits;
      const jobIds = hits.map((hit: any) => hit._source.id || hit._id);
      const totalItems = typeof response.hits.total === 'number' 
        ? response.hits.total 
        : (response.hits.total as any)?.value || 0;

      return { jobIds, totalItems };
    } catch (error) {
      this.logger.error('lỗi khi truy vấn tìm kiếm nâng cao trên elasticsearch:', error);
      return { jobIds: [], totalItems: 0 };
    }
  }
}
