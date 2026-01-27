import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from 'src/modules/jobs/schemas/job.schema';

//- Service để chạy các tác vụ định kỳ liên quan đến Job
//- Hiện tại bao gồm việc tự động đóng các tin tuyển dụng đã hết hạn

@Injectable()
export class JobCronService {
  private readonly logger = new Logger(JobCronService.name);

  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

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
}
