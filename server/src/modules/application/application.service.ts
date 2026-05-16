import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { FindApplicationQueryDto } from './dto/applicationDto.dto';
import { JobsService } from '../jobs/jobs.service';
import { UserResumeService } from '../user-resume/user-resume.service';
import { UserService } from '../user/user.service';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { TranslationService } from 'src/common/translation/translation.service';
import { slugify } from 'src/utils/generate-slug';
import { ConfigService } from '@nestjs/config';
import { ApplicationRepository } from './repository/application.repository';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private configService: ConfigService,
    @Inject(forwardRef(() => JobsService)) private jobsService: JobsService,
    private readonly translationService: TranslationService,
    private userResumeService: UserResumeService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
    user: UserDecoratorType,
  ) {
    try {
      //- dịch đã
      const dataLang = await this.translationService.translateModuleData(
        'application',
        createApplicationDto,
      );
      const { jobId, resumeType, systemCvData, cvUrl } = dataLang;

      //- Validate Job
      const job = await this.jobsService.validateJobForApplication(jobId);

      //- Validate Resume
      if (resumeType === 'SYSTEM_CV') {
        if (!systemCvData || !systemCvData.userResumeId) {
          throw new BadRequestCustom('Vui lòng chọn CV hệ thống');
        }
        //- Kiểm tra CV có thuộc về ứng viên và hợp lệ để ứng tuyển không
        await this.userResumeService.validateResumeForApplication(
          systemCvData.userResumeId,
          user.id,
        );
      } else {
        if (!cvUrl) throw new BadRequestCustom('Vui lòng tải lên file CV');
      }

      //- Check existing application cho cùng job và user (chỉ cho phép 1 đơn ứng tuyển mỗi job)
      const existApp = await this.applicationRepository.findOne({
        filter: {
          jobId,
          userId: user.id,
        },
      });

      if (existApp) {
        throw new BadRequestCustom('Bạn đã ứng tuyển công việc này rồi.');
      }

      //- Create Application
      const newApplication = await this.applicationRepository.create({
        ...dataLang,
        userId: user.id,
        companyId: job.companyID,
        jobId: job._id,
        history: [
          {
            status: 'PENDING',
            note: {
              vi: 'Ứng viên nộp hồ sơ',
              en: 'Candidate submitted application',
            },
            updatedAt: new Date(),
            updatedBy: {
              _id: new Types.ObjectId(user.id),
              email: user.email,
              name: user.name,
              avatar: user.avatar,
            },
          },
        ],
        createdBy: {
          _id: new Types.ObjectId(user.id),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      });

      //- ping noti
      try {
        const recruiters = await this.userService.findRecruitersByCompany(
          job.companyID.toString(),
        );

        recruiters.forEach((recruiter) => {
          this.eventEmitter.emit(NotificationType.APPLICATION_SUBMITTED, {
            receiverId: recruiter._id.toString(),
            senderId: user.id,
            title: 'Hồ sơ ứng tuyển mới',
            content: `Ứng viên ${user.name} đã ứng tuyển vào công việc ${job.title['vi'] || job.title['en'] || 'Job'}`,
            type: NotificationType.APPLICATION_SUBMITTED,
            metadata: {
              applicationId: newApplication._id.toString(),
              jobId: job._id.toString(),
              companyId: job.companyID.toString(),
              module: 'APPLICATION',
            },
          });
        });
      } catch (notifError) {
        console.error('Notification Error:', notifError);
      }

      return newApplication;
    } catch (error) {
      if (
        error instanceof BadRequestCustom ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestCustom(error.message);
    }
  }

  async checkApplication(jobId: string, userId: string) {
    try {
      const filter = {
        jobId: new Types.ObjectId(jobId),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      };
      const application = await this.applicationRepository.findOne({
        filter: filter,
      });

      if (!application) {
        return null; // Chưa ứng tuyển
      }

      return application; // Đã ứng tuyển, trả về thông tin đơn ứng tuyển
    } catch (error) {}
  }

  async findAll(query: FindApplicationQueryDto, user: UserDecoratorType) {
    try {
      const {
        currentPage,
        pageSize,
        status,
        jobId,
        isViewed,
        keyword,
        minScore,
        isDeleted,
      } = query;

      const filter: any = {};

      const userRole = user.roleCodeName;
      const textRoleSuperAdmin =
        this.configService.get<string>('role_super_admin');

      //- check quyền: Chỉ recruiter của công ty mới xem được tất cả đơn ứng tuyển của công ty mình
      if (user.employerInfo?.companyID) {
        filter.companyId = new Types.ObjectId(user.employerInfo.companyID);
      } else if (userRole === textRoleSuperAdmin) {
        //- supper admin có thể xem tất cả đơn ứng tuyển, sau không cần thì xóa đi, nay test thì mình bật lên.
      } else {
        throw new ForbiddenException(
          'Không có quyền truy cập. Chỉ dành cho nhà tuyển dụng.',
        );
      }

      //- Các filter
      if (status) filter.status = status;

      if (jobId) filter.jobId = new Types.ObjectId(jobId);

      if (isViewed !== undefined && isViewed !== '')
        filter.isViewed = isViewed === 'true';

      if (minScore) filter.score = { $gte: minScore };

      //- Lọc theo đã xóa hay chưa
      if (isDeleted === 'true') {
        filter.isDeleted = true;
      } else {
        filter.isDeleted = false;
      }

      //- Pagination
      const limit = pageSize ? +pageSize : 10;
      const offset = currentPage ? (+currentPage - 1) * limit : 0;

      const pipeline: any[] = [
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userPopulated',
          },
        },
        {
          $unwind: {
            path: '$userPopulated',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'jobPopulated',
          },
        },
        {
          //- $unwind giúp biến mảng jobPopulated thành object (vì mỗi đơn ứng tuyển chỉ ứng tuyển vào 1 job nên chỉ có 1 phần tử trong mảng sau lookup) -> dễ dàng truy cập các trường của job như title, slug trong pipeline sau đó
          $unwind: {
            path: '$jobPopulated',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'userresumes',
            localField: 'systemCvData.userResumeId',
            foreignField: '_id',
            as: 'resumePopulated',
          },
        },
        {
          $unwind: {
            path: '$resumePopulated',
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      //- Tìm kiếm theo từ khóa (email, tên ứng viên, thư giới thiệu, tên job...) sau khi lookup xong
      if (keyword) {
        //- Trong MongoDB Aggregation, dữ liệu chảy qua Pipeline theo thứ tự.
        //- và đây là lần match thứ 2, nên lúc này chúng ta đã có dữ liệu userPopulated (sau lookup users) và jobPopulated (sau lookup jobs) để có thể tìm kiếm theo tên ứng viên, email ứng viên, tên job, thư giới thiệu...
        pipeline.push({
          $match: {
            $or: [
              { coverLetter: { $regex: keyword, $options: 'i' } },
              { 'userPopulated.name': { $regex: keyword, $options: 'i' } },
              { 'userPopulated.email': { $regex: keyword, $options: 'i' } },
              { 'jobPopulated.title.vi': { $regex: keyword, $options: 'i' } }, //- $unwind ở trên đã biến jobPopulated từ mảng thành object nên có thể truy cập trực tiếp vào jobPopulated.title.vi để tìm kiếm
              { 'jobPopulated.title.en': { $regex: keyword, $options: 'i' } },
            ],
          },
        });
      }

      const [dataResult, countResult] = await Promise.all([
        this.applicationRepository.aggregateWithPipeline([
          ...pipeline,
          { $sort: { createdAt: -1 } }, //- Sắp xếp theo ngày tạo mới nhất
          { $skip: offset },
          { $limit: limit },
          {
            $project: { //- $project để chọn trường nào cần lấy ra
              _id: 1, //- 1 tức là lấy, 0 là không lấy
              jobId: {
                _id: '$jobPopulated._id',
                title: '$jobPopulated.title',
                slug: '$jobPopulated.slug',
                salary: '$jobPopulated.salary',
              },
              userId: {
                _id: '$userPopulated._id',
                name: '$userPopulated.name',
                email: '$userPopulated.email',
                avatar: '$userPopulated.avatar',
              },
              companyId: 1,
              email: 1,
              resumeType: 1,
              cvUrl: 1,
              systemCvData: {
                userResumeId: {
                  _id: '$resumePopulated._id',
                  resumeName: '$resumePopulated.resumeName',
                  url: '$resumePopulated.url',
                },
                templateId: '$systemCvData.templateId',
                resumeContent: '$systemCvData.resumeContent',
              },
              coverLetter: 1,
              status: 1,
              isViewed: 1,
              score: 1,
              recruiterNote: 1,
              interviewTime: 1,
              rejectionReason: 1,
              history: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ]),
        this.applicationRepository.aggregateWithPipeline([
          ...pipeline,
          { $count: 'total' },
        ]),
      ]);

      const totalItems = countResult.length > 0 ? countResult[0].total : 0;

      return {
        meta: {
          current: currentPage || 1,
          pageSize: limit,
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
        },
        result: dataResult,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new BadRequestCustom(error.message);
    }
  }

  //- Ứng viên xem lại tất cả đơn đã nộp của mình
  async findMyApplications(
    query: FindApplicationQueryDto,
    user: UserDecoratorType,
  ) {
    try {
      const { currentPage, pageSize, status, keyword } = query;

      const limit = pageSize ? +pageSize : 10;
      const offset = currentPage ? (+currentPage - 1) * limit : 0;

      //- Điều kiện Match ban đầu (Cơ bản)
      const matchStage: any = {
        userId: new Types.ObjectId(user.id),
        isDeleted: false,
      };

      if (status) matchStage.status = status;

      // Xây dựng Pipeline
      const pipeline: any[] = [
        { $match: matchStage },

        //- Lookup Job để lấy Title
        {
          $lookup: {
            from: 'jobs', //- Tên collection thực tế trong DB
            localField: 'jobId', //- trường jobId trong Application
            foreignField: '_id', //- trường _id trong Job
            as: 'jobPopulated',
          },
        },
        {
          $unwind: {
            path: '$jobPopulated',
            preserveNullAndEmptyArrays: true,
          },
        },

        //- Lookup Company để lấy Name
        {
          $lookup: {
            from: 'companies', //- Tên collection thực tế trong DB
            localField: 'companyId',
            foreignField: '_id',
            as: 'companyPopulated',
          },
        },
        {
          $unwind: {
            path: '$companyPopulated',
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      //- Nếu có keyword, áp dụng bộ lọc $match OR
      if (keyword) {
        pipeline.push({
          $match: {
            $or: [
              { coverLetter: { $regex: keyword, $options: 'i' } },
              { 'jobPopulated.title.vi': { $regex: keyword, $options: 'i' } },
              { 'jobPopulated.title.en': { $regex: keyword, $options: 'i' } },
              { 'companyPopulated.name': { $regex: keyword, $options: 'i' } },
            ],
          },
        });
      }

      //- Query data (Pagination + Sort) & Count total
      const [dataResult, countResult] = await Promise.all([
        this.applicationRepository.aggregateWithPipeline([
          ...pipeline,
          { $sort: { createdAt: -1 } },
          { $skip: offset },
          { $limit: limit },
          {
            //- Project lại data giống với find() .populate() truyền thống
            $project: {
              _id: 1,
              jobId: {
                _id: '$jobPopulated._id',
                title: '$jobPopulated.title',
                slug: '$jobPopulated.slug',
                salary: '$jobPopulated.salary',
              },
              companyId: {
                _id: '$companyPopulated._id',
                name: '$companyPopulated.name',
                logo: '$companyPopulated.logo',
                slug: '$companyPopulated.slug',
              },
              userId: 1,
              email: 1,
              resumeType: 1,
              cvUrl: 1,
              systemCvData: 1,
              coverLetter: 1,
              status: 1,
              isViewed: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ]),
        this.applicationRepository.aggregateWithPipeline([
          ...pipeline,
          { $count: 'total' },
        ]),
      ]);

      const totalItems = countResult.length > 0 ? countResult[0].total : 0;

      const formattedResult = dataResult.map((app) => ({
        ...app,
        companyId: app.companyId
          ? {
              ...app.companyId,
              slug: app.companyId.name
                ? slugify(app.companyId.name)
                : undefined,
            }
          : undefined,
      }));

      return {
        meta: {
          current: currentPage || 1,
          pageSize: limit,
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
        },
        result: formattedResult,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message);
    }
  }

  async findOne(id: string, user: UserDecoratorType) {
    try {
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestCustom('ID không hợp lệ');

      const application = await this.applicationRepository.findByIdWithDetails(id);

      if (!application)
        throw new NotFoundException(`Không tìm thấy đơn ứng tuyển #${id}`);

      //- check quyền
      const isOwner = application.userId._id.toString() === user.id;
      const isCompanyRecruiter =
        user.employerInfo?.companyID &&
        application.companyId._id.toString() === user.employerInfo.companyID;

      if (!isOwner && !isCompanyRecruiter) {
        throw new ForbiddenException('Bạn không có quyền xem đơn này');
      }

      //- Nếu recruiter xem chi tiết đơn mà chưa xem trước đó thì đánh dấu đã xem
      if (isCompanyRecruiter && !application.isViewed) {
        application.isViewed = true;
        await application.save();
      }

      const appObject: any = application.toObject();
      if (appObject.companyId && appObject.companyId.name) {
        appObject.companyId.slug = slugify(appObject.companyId.name);
      }

      return appObject;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestCustom
      )
        throw error;
      throw new BadRequestCustom(error.message);
    }
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
    user: UserDecoratorType,
  ) {
    try {
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestCustom('ID không hợp lệ');

      //- dịch đã
      const dataLang = await this.translationService.translateModuleData(
        'application',
        updateApplicationDto,
      );

      const application = await this.applicationRepository.findByIdForStatusUpdate(id);

      if (!application) throw new NotFoundException(`Application not found`);

      //- check quyền cho cập nhật: Chỉ Recruiter của công ty mới được cập nhật
      if (
        !user.employerInfo?.companyID ||
        application.companyId.toString() !== user.employerInfo.companyID
      ) {
        throw new ForbiddenException(
          'Chỉ nhà tuyển dụng của công ty này mới được cập nhật',
        );
      }

      //- Nếu cập nhật trạng thái, thêm lịch sử trạng thái
      if (dataLang.status && dataLang.status !== application.status) {
        const oldStatus = application.status;
        const newStatus = dataLang.status;

        application.history.push({
          status: newStatus,
          note: (dataLang as any).recruiterNote || {
            vi: `Cập nhật trạng thái từ ${oldStatus} sang ${newStatus}`,
            en: `Updated status from ${oldStatus} to ${newStatus}`,
          },
          updatedAt: new Date(),
          updatedBy: {
            _id: new Types.ObjectId(user.id),
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        });

        //- ping noti
        try {
          const jobTitle =
            (application.jobId as any)?.title?.vi ||
            (application.jobId as any)?.title?.en ||
            'Job';
          this.eventEmitter.emit(NotificationType.APPLICATION_STATUS_CHANGED, {
            receiverId: application.userId._id.toString(),
            senderId: user.id,
            title: 'Cập nhật trạng thái hồ sơ',
            content: `Hồ sơ ứng tuyển vào công việc ${jobTitle} của bạn đã chuyển sang trạng thái ${newStatus}`,
            type: NotificationType.APPLICATION_STATUS_CHANGED,
            metadata: {
              applicationId: application._id.toString(),
              jobId: application.jobId._id.toString(),
              status: newStatus,
              module: 'APPLICATION',
            },
          });
        } catch (notifError) {
          console.error('Notification Error:', notifError);
        }
      }

      //- Cập nhật các trường còn lại (gộp lại)
      Object.assign(application, dataLang);

      application.updatedBy = {
        _id: new Types.ObjectId(user.id),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      };

      return await application.save();
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestCustom
      )
        throw error;
      throw new BadRequestCustom(error.message);
    }
  }

  async remove(id: string, user: UserDecoratorType) {
    try {
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestCustom('ID không hợp lệ');

      const application = await this.applicationRepository.findByIdRaw(id);
      if (!application)
        throw new NotFoundException(`Application không tìm thấy`);

      //- check quyền
      const isOwner = application.userId.toString() === user.id;
      const isCompanyRecruiter =
        user.employerInfo?.companyID &&
        application.companyId.toString() === user.employerInfo.companyID;

      if (!isOwner && !isCompanyRecruiter) {
        throw new ForbiddenException('Bạn không có quyền xóa đơn này');
      }

      //- Luật: Ứng viên chỉ được rút đơn khi trạng thái là PENDING
      if (isOwner && application.status !== 'PENDING') {
        throw new BadRequestCustom(
          'Bạn chỉ có thể rút lại đơn ứng tuyển khi hồ sơ đang ở trạng thái chờ xử lý (PENDING)',
        );
      }

      return this.applicationRepository.softDeleteRaw({ _id: id });
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestCustom
      )
        throw error;
      throw new BadRequestCustom(error.message);
    }
  }
}
