import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Job, JobDocument } from 'src/modules/jobs/schemas/job.schema';

//- Service để chạy các tác vụ định kỳ liên quan đến Job
//- Hiện tại bao gồm việc tự động đóng các tin tuyển dụng đã hết hạn

@Injectable()
export class JobCronService {
  private readonly logger = new Logger(JobCronService.name);

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  @Cron(CronExpression.EVERY_10_MINUTES)
  // @Cron('*/30 * * * * *')
  async syncViewsToDb() {
    this.logger.log('Bắt đầu đồng bộ lượt xem từ Redis về MongoDB...');
    const cache: any = this.cacheManager;

    try {
      const redisStore = cache.stores ? cache.stores[0] : null;
      if (!redisStore) return;

      const keys: string[] =
        typeof redisStore.keys === 'function'
          ? await redisStore.keys('keyv:job_views:*')
          : await redisStore.store?.keys('keyv:job_views:*');

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
        const jobId = parts[2];

        if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
          continue;
        }

        const cleanKey = key.replace(/^keyv:/, '');
        const viewsToAdd = await cache.get(cleanKey);

        // Chỉ tăng successCount khi thực sự có view và update thành công
        if (viewsToAdd && viewsToAdd > 0) {
          await this.jobModel.updateOne(
            { _id: jobId },
            { $inc: { totalViews: viewsToAdd } },
          );
          await cache.del(cleanKey);
          successCount++;
        }
      }
      this.logger.log(`Đã đồng bộ thành công ${successCount} công việc.`);
    } catch (error) {
      this.logger.error(`Lỗi thực thi v6/v7: ${error.message}`);
    }
  }
}
