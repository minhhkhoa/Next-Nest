import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Job, JobDocument } from 'src/modules/jobs/schemas/job.schema';
import { RedisService } from '../redis/redis.service';
import { MailService } from 'src/modules/mail/mail.service';
import { JobRecommendationService } from 'src/modules/ai-service/services/job-recommendation.service';
import { UserService } from 'src/modules/user/user.service';
import { ConfigService } from '@nestjs/config';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { slugify } from 'src/utils/generate-slug';

//- Service để chạy các tác vụ định kỳ liên quan đến Job
//- Hiện tại bao gồm việc tự động đóng các tin tuyển dụng đã hết hạn

@Injectable()
export class JobCronService {
  private readonly logger = new Logger(JobCronService.name);

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => JobRecommendationService))
    private readonly jobRecommendationService: JobRecommendationService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  //- Cron Job chạy mỗi giờ một lần để quét các job hết hạn
  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoCloseExpiredJobs() {
    this.logger.debug('Đang thực thi tác vụ quét Job hết hạn tự động...');

    try {
      const now = new Date();

      //- Logic: Tìm các job đang 'active' nhưng endDate < thời điểm hiện tại
      //- thì đặt nó về 'inactive'
      const result = await this.jobModel.updateMany(
        //- đặt index vào mấy field này cho nó query nhanh hơn
        {
          status: 'active',
          endDate: { $lt: now },
          isDeleted: false,
        },
        {
          $set: { status: 'inactive' },
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.log(
          `Hệ thống đã tự động đóng ${result.modifiedCount} tin tuyển dụng hết hạn.`,
        );
      }
    } catch (error) {
      this.logger.error('Lỗi khi chạy Cron Job tự động đóng bài đăng:', error);
    }
  }

  // - Cron Job chạy mỗi 10 phút để đồng bộ lượt xem từ Redis về MongoDB
  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncViewsToDb() {
    this.logger.log('Bắt đầu đồng bộ lượt xem từ Redis về MongoDB...');

    try {
      const keys = await this.redisService.keys('job_views:*');

      if (!keys || keys.length === 0) {
        this.logger.log('Redis hiện không có lượt xem mới.');
        return;
      }

      let successCount = 0;

      for (const key of keys) {
        // CHỐT CHẶN: Chỉ xử lý nếu key thực sự chứa 'job_views'
        // Loại bỏ hoàn toàn 'view_lock'
        if (!key.includes('job_views')) {
          continue;
        }

        const parts = key.split(':');
        const jobId = parts[1];

        if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
          continue;
        }

        const viewsToAdd = await this.redisService.get<number>(key);

        // Chỉ tăng successCount khi thực sự có view và update thành công
        if (viewsToAdd && viewsToAdd > 0) {
          await this.jobModel.updateOne(
            { _id: jobId },
            { $inc: { totalViews: viewsToAdd } },
          );
          await this.redisService.del(key);
          successCount++;
        }
      }
      this.logger.log(`Đã đồng bộ thành công ${successCount} công việc.`);
    } catch (error) {
      this.logger.error(`Lỗi thực thi v6/v7: ${error.message}`);
    }
  }

  //- cron job chạy mỗi ngày để set lại isHot của công việc khi đã hết hạn
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) //- chạy vào lúc 00:00 hàng ngày
  async handleAutoRemoveHotStatus() {
    this.logger.debug('Đang thực thi tác vụ quét Job Hot hết hạn...');
    try {
      const now = new Date();
      //- Tìm các job đang là Hot Job và thời hạn hotUntil nhỏ hơn hiện tại
      const result = await this.jobModel.updateMany(
        {
          'isHot.isHotJob': true,
          'isHot.hotUntil': { $lt: now },
        },
        {
          $set: {
            isHot: {
              isHotJob: false,
              hotUntil: null,
            },
          },
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.log(
          `Hệ thống đã tự động gỡ bỏ trạng thái Hot của ${result.modifiedCount} tin tuyển dụng.`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Lỗi khi chạy Cron Job tự động gỡ bỏ trạng thái Hot:',
        error,
      );
    }
  }

  //- cron job chạy vào 8:00 am sáng chủ nhật hàng tuần để gửi gợi ý việc làm phù hợp cho ứng viên
  @Cron('0 8 * * 0')
  async handleWeeklyJobRecommendations() {
    this.logger.log(
      'Bắt đầu chạy Cron Job gửi gợi ý công việc hàng tuần cho ứng viên...',
    );
    try {
      //- lấy tất cả ứng viên đang hoạt động
      const candidates = await this.userService.findAllCandidates();
      this.logger.log(`Tìm thấy ${candidates.length} ứng viên đang hoạt động.`);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || '';

      for (const candidate of candidates) {
        try {
          //- chuẩn bị dữ liệu decorator giả cho ứng viên
          const userDecorated: UserDecoratorType = {
            id: candidate._id.toString(),
            name: candidate.name,
            email: candidate.email,
            avatar: candidate.avatar || '',
            roleCodeName: 'CANDIDATE',
            roleID: candidate.roleID as any,
          };

          //- lấy gợi ý công việc cho ứng viên
          const result =
            await this.jobRecommendationService.recommendJobs(userDecorated);

          //- chỉ gửi email khi ứng viên có hồ sơ đầy đủ và có công việc gợi ý phù hợp thực sự
          if (
            result &&
            result.hasProfile &&
            result.recommendations &&
            result.recommendations.length > 0
          ) {
            //- format danh sách công việc trước khi đưa vào template
            const formattedJobs = result.recommendations
              .slice(0, 5)
              .map((job: any) => {
                //- xử lý lương
                let salaryStr = 'Thỏa thuận';
                if (job.salary) {
                  const { min, max, currency } = job.salary;
                  if (min && max) {
                    salaryStr = `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
                  } else if (min) {
                    salaryStr = `Từ ${min.toLocaleString()} ${currency}`;
                  } else if (max) {
                    salaryStr = `Lên đến ${max.toLocaleString()} ${currency}`;
                  }
                }

                //- link chi tiết công việc theo định dạng slug-i.id của client
                const jobSlug =
                  job.slug?.vi ||
                  (job.title?.vi ? slugify(job.title.vi) : 'job');
                const jobLink = `${frontendUrl}/vi/jobs/${jobSlug}-i.${job._id}`;

                return {
                  title: job.title?.vi || job.title?.en || 'N/A',
                  companyName: job.company?.name || 'Công ty ẩn',
                  location: job.location || 'Toàn quốc',
                  salary: salaryStr,
                  aiExplanation:
                    job.aiExplanation ||
                    'Công việc phù hợp với kỹ năng của bạn.',
                  jobLink: jobLink,
                };
              });

            //- thực hiện gửi mail
            await this.mailService.sendJobRecommendationsMail(
              candidate.email,
              candidate.name,
              formattedJobs,
            );
            this.logger.log(
              `Đã gửi email gợi ý công việc thành công cho ứng viên: ${candidate.email}`,
            );
          } else {
            //- log cảnh báo chi tiết lý do không gửi email để tiện check lỗi
            this.logger.warn(
              `Không gửi email gợi ý cho ứng viên: ${candidate.email}. Lý do: ` +
                (!result
                  ? 'không nhận được kết quả phân tích gợi ý từ service.'
                  : !result.hasProfile
                  ? 'ứng viên chưa hoàn thiện hồ sơ/profile (hasProfile = false).'
                  : !result.recommendations ||
                    result.recommendations.length === 0
                  ? 'không tìm thấy công việc nào phù hợp với kỹ năng của ứng viên (recommendations rỗng).'
                  : 'lý do không xác định.'),
            );
          }
        } catch (candidateErr) {
          this.logger.error(
            `Lỗi khi xử lý gợi ý công việc cho ứng viên ${candidate.email}:`,
            candidateErr,
          );
        }
      }
      this.logger.log('Hoàn thành Cron Job gửi gợi ý công việc hàng tuần.');
    } catch (error) {
      this.logger.error(
        'Lỗi khi chạy Cron Job gửi gợi ý việc làm tuần:',
        error,
      );
    }
  }
}
