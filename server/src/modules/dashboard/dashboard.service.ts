import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import {
  Application,
  ApplicationDocument,
} from '../application/schemas/application.schema';
import {
  AdBooking,
  AdBookingDocument,
} from '../advertising/ad-booking/schemas/ad-booking.schema';
import { Issue, IssueDocument } from '../issue/schemas/issue.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import {
  AdPayment,
  AdPaymentDocument,
} from '../advertising/ad-payment/schemas/ad-payment.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(AdBooking.name)
    private adBookingModel: Model<AdBookingDocument>,
    @InjectModel(Issue.name) private issueModel: Model<IssueDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(AdPayment.name)
    private adPaymentModel: Model<AdPaymentDocument>,
    private configService: ConfigService,
  ) {}

  async getAdminStats(startDate?: string, endDate?: string) {
    //- thiết lập mốc thời gian mặc định nếu không truyền lên (30 ngày trước đến hiện tại)
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    //- đặt mốc thời gian cuối ngày để lấy trọn vẹn dữ liệu ngày kết thúc
    end.setHours(23, 59, 59, 999);

    //- tìm id các role tương ứng trong hệ thống
    const candidateRoleName =
      this.configService.get<string>('role_candidate') || 'CANDIDATE';
    const recruiterRoleName =
      this.configService.get<string>('role_recruiter') || 'RECRUITER';
    const recruiterAdminRoleName =
      this.configService.get<string>('role_recruiter_admin') ||
      'RECRUITER_ADMIN';

    const roles = await this.roleModel.find({
      $or: [
        {
          'name.en': {
            $in: [candidateRoleName, recruiterRoleName, recruiterAdminRoleName],
          },
        },
        {
          'name.vi': {
            $in: [candidateRoleName, recruiterRoleName, recruiterAdminRoleName],
          },
        },
      ],
    });

    const candidateRoleIds = roles
      .filter(
        (r) =>
          r.name.en === candidateRoleName || r.name.vi === candidateRoleName,
      )
      .map((r) => r._id);
    const recruiterRoleIds = roles
      .filter(
        (r) =>
          r.name.en === recruiterRoleName ||
          r.name.vi === recruiterRoleName ||
          r.name.en === recruiterAdminRoleName ||
          r.name.vi === recruiterAdminRoleName,
      )
      .map((r) => r._id);

    //- truy vấn kpis tổng quan (cumulative - lũy kế từ trước đến nay)
    const totalCandidates = await this.userModel.countDocuments({
      roleID: { $in: candidateRoleIds },
      isDeleted: false,
    });
    const totalRecruiters = await this.userModel.countDocuments({
      roleID: { $in: recruiterRoleIds },
      isDeleted: false,
    });
    const totalCompanies = await this.companyModel.countDocuments({
      isDeleted: false,
    });
    const pendingCompanies = await this.companyModel.countDocuments({
      status: 'PENDING',
      isDeleted: false,
    });
    const activeCompanies = await this.companyModel.countDocuments({
      status: 'ACCEPT',
      isDeleted: false,
    });
    const totalJobs = await this.jobModel.countDocuments({ isDeleted: false });
    const activeJobs = await this.jobModel.countDocuments({
      status: 'active',
      isDeleted: false,
    });
    const totalApplications = await this.applicationModel.countDocuments({
      isDeleted: false,
    });

    //- tổng doanh thu quảng cáo (chỉ tính các đơn hàng đã thanh toán thành công)
    const revenueSum = await this.adBookingModel.aggregate([
      {
        $match: {
          status: { $in: ['SCHEDULED', 'RUNNING', 'COMPLETED'] },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const totalRevenue = revenueSum[0]?.total || 0;

    //- lấy xu hướng đăng ký mới (user và company) theo thời gian
    //- thống kê user đăng ký
    const userRegs = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$roleID',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    //- thống kê công ty đăng ký
    const companyRegs = await this.companyModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    //- gom dữ liệu xu hướng đăng ký theo từng ngày
    const registrationTrendsMap = new Map<
      string,
      {
        date: string;
        candidates: number;
        recruiters: number;
        companies: number;
      }
    >();

    //- điền sẵn các ngày trong khoảng lọc để tránh bị đứt gãy biểu đồ
    const tempDate = new Date(start);
    while (tempDate <= end) {
      const dateStr = tempDate.toISOString().split('T')[0];
      registrationTrendsMap.set(dateStr, {
        date: dateStr,
        candidates: 0,
        recruiters: 0,
        companies: 0,
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    //- điền dữ liệu user vào map
    userRegs.forEach((reg) => {
      const dateStr = reg._id.date;
      const roleId = reg._id.role;
      const count = reg.count;

      const current = registrationTrendsMap.get(dateStr) || {
        date: dateStr,
        candidates: 0,
        recruiters: 0,
        companies: 0,
      };

      //- kiểm tra xem role thuộc candidate hay recruiter
      const isCandidate = candidateRoleIds.some(
        (id) => id.toString() === roleId?.toString(),
      );
      const isRecruiter = recruiterRoleIds.some(
        (id) => id.toString() === roleId?.toString(),
      );

      if (isCandidate) {
        current.candidates += count;
      } else if (isRecruiter) {
        current.recruiters += count;
      }
      registrationTrendsMap.set(dateStr, current);
    });

    //- điền dữ liệu company vào map
    companyRegs.forEach((reg) => {
      const dateStr = reg._id;
      const count = reg.count;
      const current = registrationTrendsMap.get(dateStr) || {
        date: dateStr,
        candidates: 0,
        recruiters: 0,
        companies: 0,
      };
      current.companies += count;
      registrationTrendsMap.set(dateStr, current);
    });

    const registrationTrends = Array.from(registrationTrendsMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date),
    );

    //- thống kê doanh thu quảng cáo trong khoảng thời gian đã chọn
    //- xu hướng doanh thu theo ngày
    const revenueDbTrends = await this.adBookingModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['SCHEDULED', 'RUNNING', 'COMPLETED'] },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const revenueTrendsMap = new Map<string, number>();
    const tempDateRev = new Date(start);
    while (tempDateRev <= end) {
      const dateStr = tempDateRev.toISOString().split('T')[0];
      revenueTrendsMap.set(dateStr, 0);
      tempDateRev.setDate(tempDateRev.getDate() + 1);
    }

    revenueDbTrends.forEach((item) => {
      revenueTrendsMap.set(item._id, item.amount);
    });

    const revenueTrends = Array.from(revenueTrendsMap.entries())
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    //- phân chia doanh thu theo phương thức thanh toán (payment provider)
    const revenueByProvider = await this.adBookingModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['SCHEDULED', 'RUNNING', 'COMPLETED'] },
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'adpayments',
          localField: 'paymentId',
          foreignField: '_id',
          as: 'payment',
        },
      },
      {
        $unwind: {
          path: '$payment',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ['$payment.provider', 'SEPAY'] },
          amount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          provider: '$_id',
          amount: 1,
        },
      },
    ]);

    //- thống kê doanh nghiệp (company stats)
    //- phân bố trạng thái công ty
    const companyStatusDistribution = await this.companyModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]);

    //- top 5 công ty đăng nhiều việc làm nhất
    const topCompaniesByJobs = await this.jobModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$companyID', jobCount: { $sum: 1 } } },
      { $sort: { jobCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $project: {
          _id: 0,
          companyId: '$_id',
          companyName: '$company.name',
          jobCount: 1,
        },
      },
    ]);

    //- top 5 công ty chi nhiều tiền quảng cáo nhất
    const topCompaniesByBookings = await this.adBookingModel.aggregate([
      {
        $match: {
          status: { $in: ['SCHEDULED', 'RUNNING', 'COMPLETED'] },
          isDeleted: false,
        },
      },
      { $group: { _id: '$companyId', totalSpent: { $sum: '$amount' } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $project: {
          _id: 0,
          companyId: '$_id',
          companyName: '$company.name',
          totalSpent: 1,
        },
      },
    ]);

    //- thống kê tin tuyển dụng (job stats)
    //- phân bố trạng thái tin tuyển dụng
    const jobStatusDistribution = await this.jobModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]);

    //- thống kê số lượng job theo ngành nghề (industry)
    const jobsByIndustry = await this.jobModel.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: '$industryID' },
      { $group: { _id: '$industryID', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'industries',
          localField: '_id',
          foreignField: '_id',
          as: 'industry',
        },
      },
      { $unwind: '$industry' },
      {
        $project: {
          _id: 0,
          industryName: '$industry.name',
          count: 1,
        },
      },
    ]);

    //- thống kê số lượng job theo kỹ năng (skill)
    const jobsBySkill = await this.jobModel.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'skills',
          localField: '_id',
          foreignField: '_id',
          as: 'skill',
        },
      },
      { $unwind: '$skill' },
      {
        $project: {
          _id: 0,
          skillName: '$skill.name',
          count: 1,
        },
      },
    ]);

    //- top 5 công việc có nhiều lượt xem nhất
    const topViewedJobs = await this.jobModel
      .find({ isDeleted: false })
      .sort({ totalViews: -1 })
      .limit(5)
      .populate('companyID', 'name')
      .lean();

    const formattedTopViewedJobs = topViewedJobs.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      companyName: (job.companyID as any)?.name || 'N/A',
      views: job.totalViews || 0,
    }));

    //- top 5 công việc có nhiều lượt ứng tuyển nhất
    const topAppliedJobs = await this.jobModel
      .find({ isDeleted: false })
      .sort({ totalApplied: -1 })
      .limit(5)
      .populate('companyID', 'name')
      .lean();

    const formattedTopAppliedJobs = topAppliedJobs.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      companyName: (job.companyID as any)?.name || 'N/A',
      applied: job.totalApplied || 0,
    }));

    //- duyệt nhanh (quick approvals)
    //- danh sách 5 doanh nghiệp chờ duyệt gần nhất
    const pendingCompaniesList = await this.companyModel
      .find({ status: 'PENDING', isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedPendingCompanies = pendingCompaniesList.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      taxCode: c.taxCode,
      website: c.website,
      createdAt: (c as any).createdAt,
    }));

    //- danh sách 5 yêu cầu hỗ trợ chưa giải quyết gần nhất
    const pendingIssuesList = await this.issueModel
      .find({ status: 'PENDING', isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedPendingIssues = pendingIssuesList.map((i) => ({
      id: i._id.toString(),
      title: i.title,
      type: i.type,
      createdBy: i.createdBy?.name || 'N/A',
      createdAt: (i as any).createdAt,
    }));

    return {
      kpis: {
        totalCandidates,
        totalRecruiters,
        totalCompanies,
        pendingCompanies,
        activeCompanies,
        totalJobs,
        activeJobs,
        totalApplications,
        totalRevenue,
      },
      registrationTrends,
      revenueTrends: {
        trends: revenueTrends,
        byProvider: revenueByProvider,
      },
      companyStats: {
        totalCompanies,
        statusDistribution: companyStatusDistribution,
        topCompaniesByJobs,
        topCompaniesByBookings,
      },
      jobStats: {
        totalJobs,
        statusDistribution: jobStatusDistribution,
        byIndustry: jobsByIndustry,
        bySkill: jobsBySkill,
        topViewedJobs: formattedTopViewedJobs,
        topAppliedJobs: formattedTopAppliedJobs,
      },
      quickApprovals: {
        pendingCompanies: formattedPendingCompanies,
        pendingIssues: formattedPendingIssues,
      },
    };
  }

  async getRecruiterStats(companyID: string, startDate?: string, endDate?: string) {
    //- thiết lập mốc thời gian mặc định nếu không truyền (30 ngày trước đến nay)
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    //- đặt mốc thời gian cuối ngày để lấy trọn vẹn dữ liệu ngày kết thúc
    end.setHours(23, 59, 59, 999);

    const companyObjId = new Types.ObjectId(companyID);

    //- lấy kpis tổng quan cho doanh nghiệp
    const totalJobs = await this.jobModel.countDocuments({
      companyID: companyObjId,
      isDeleted: false,
    });
    const activeJobs = await this.jobModel.countDocuments({
      companyID: companyObjId,
      status: 'active',
      isDeleted: false,
    });
    const totalApplications = await this.applicationModel.countDocuments({
      companyId: companyObjId,
      isDeleted: false,
    });
    const pendingApplications = await this.applicationModel.countDocuments({
      companyId: companyObjId,
      status: 'PENDING',
      isDeleted: false,
    });

    //- tính tổng số tiền chi trả cho quảng cáo banner
    const bookingSum = await this.adBookingModel.aggregate([
      {
        $match: {
          companyId: companyObjId,
          status: { $in: ['SCHEDULED', 'RUNNING', 'COMPLETED'] },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);
    const totalSpent = bookingSum[0]?.total || 0;

    //- lấy xu hướng nhận đơn ứng tuyển theo thời gian
    const appDbTrends = await this.applicationModel.aggregate([
      {
        $match: {
          companyId: companyObjId,
          createdAt: { $gte: start, $lte: end },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const applicationsTrendMap = new Map<string, number>();
    const tempDateApp = new Date(start);
    while (tempDateApp <= end) {
      const dateStr = tempDateApp.toISOString().split('T')[0];
      applicationsTrendMap.set(dateStr, 0);
      tempDateApp.setDate(tempDateApp.getDate() + 1);
    }

    appDbTrends.forEach((item) => {
      applicationsTrendMap.set(item._id, item.count);
    });

    const applicationsTrend = Array.from(applicationsTrendMap.entries())
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    //- phân bố trạng thái đơn ứng tuyển
    const applicationsStatusDistribution = await this.applicationModel.aggregate([
      {
        $match: {
          companyId: companyObjId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    //- thống kê hiệu quả tin tuyển dụng (top 5 job tương tác nhiều nhất)
    const topJobs = await this.jobModel
      .find({ companyID: companyObjId, isDeleted: false })
      .sort({ totalApplied: -1, totalViews: -1 })
      .limit(5)
      .lean();

    const jobsPerformance = topJobs.map((job) => ({
      id: job._id.toString(),
      title: job.title.vi || job.title.en || 'job',
      views: job.totalViews || 0,
      applied: job.totalApplied || 0,
    }));

    //- danh sách 5 đơn ứng tuyển mới nhất cần duyệt gấp
    const recentApps = await this.applicationModel
      .find({ companyId: companyObjId, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('jobId', 'title slug')
      .populate('userId', 'name email avatar')
      .lean();

    const recentApplications = recentApps.map((app) => ({
      id: app._id.toString(),
      jobTitle: (app.jobId as any)?.title?.vi || (app.jobId as any)?.title?.en || 'n/a',
      candidateName: (app.userId as any)?.name || 'n/a',
      candidateEmail: (app.userId as any)?.email || app.email || 'n/a',
      candidateAvatar: (app.userId as any)?.avatar || '',
      status: app.status,
      createdAt: (app as any).createdAt,
    }));

    //- danh sách lịch sử đặt quảng cáo của doanh nghiệp
    const recentAdBookings = await this.adBookingModel
      .find({ companyId: companyObjId, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('slotId', 'name code')
      .lean();

    const formattedRecentAdBookings = recentAdBookings.map((booking) => ({
      id: booking._id.toString(),
      slotName: (booking.slotId as any)?.name || 'n/a',
      slotCode: (booking.slotId as any)?.code || 'n/a',
      adType: booking.adType,
      amount: booking.amount,
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      createdAt: (booking as any).createdAt,
    }));

    return {
      kpis: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        totalSpent,
      },
      applicationsTrend,
      applicationsStatusDistribution,
      jobsPerformance,
      recentApplications,
      recentAdBookings: formattedRecentAdBookings,
    };
  }
}

