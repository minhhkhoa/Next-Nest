import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from '@elastic/elasticsearch';
import { Job, JobDocument } from '../jobs/schemas/job.schema';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;
  private readonly indexName = 'jobs';

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
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
        await this.createIndexIfNotExists();
        await this.syncExistingJobs();
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
      this.logger.log(`tạo index "${this.indexName}" thành công.`);
    } catch (error) {
      this.logger.error('lỗi khi tạo index trên elasticsearch:', error);
    }
  }

  //- đồng bộ dữ liệu ban đầu từ mongodb sang elasticsearch nếu index trống
  private async syncExistingJobs() {
    try {
      const countResponse = await this.client.count({ index: this.indexName });
      if (countResponse.count > 0) {
        this.logger.log(`index "${this.indexName}" đã có sẵn ${countResponse.count} bản ghi. bỏ qua đồng bộ ban đầu.`);
        return;
      }

      this.logger.log('đang nạp dữ liệu ban đầu từ mongodb sang elasticsearch...');
      const jobs = await this.jobModel.find({ isDeleted: false }).exec();
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
      companyID: job.companyID?.toString() || '',
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
      await this.client.index({
        index: this.indexName,
        id: job._id.toString(),
        body: this.mapJobToEsDocument(job),
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
      await this.client.index({
        index: this.indexName,
        id: id,
        body: this.mapJobToEsDocument(job),
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

    //- lọc theo cấp bậc
    if (level) {
      must.push({
        term: { level },
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
}
