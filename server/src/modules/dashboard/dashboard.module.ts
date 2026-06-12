import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { Application, ApplicationSchema } from '../application/schemas/application.schema';
import { AdBooking, AdBookingSchema } from '../advertising/ad-booking/schemas/ad-booking.schema';
import { Issue, IssueSchema } from '../issue/schemas/issue.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { AdPayment, AdPaymentSchema } from '../advertising/ad-payment/schemas/ad-payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: AdBooking.name, schema: AdBookingSchema },
      { name: Issue.name, schema: IssueSchema },
      { name: Role.name, schema: RoleSchema },
      { name: AdPayment.name, schema: AdPaymentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
