import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import { FindJobQueryDto, RecruiteAdminApproveJobDto } from './dto/jobDto.dto';
import mongoose from 'mongoose';
import { TranslationService } from 'src/common/translation/translation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { generateMultiLangSlug } from 'src/utils/generate-slug';
import { UserService } from '../user/user.service';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class JobsService {
  constructor(
    private readonly translationService: TranslationService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createJobDto: CreateJobDto, user: UserDecoratorType) {
    try {
      const userCompanyId = user.employerInfo?.companyID;
      if (!userCompanyId) {
        throw new Error('Bạn phải thuộc về một công ty để đăng tin');
      }

      //- Chống việc đăng tin cho công ty khác
      if (createJobDto.companyID !== userCompanyId.toString()) {
        throw new Error('Bạn không có quyền đăng tin cho công ty này');
      }

      //- Kiểm tra logic ngày tháng
      if (new Date(createJobDto.endDate) <= new Date(createJobDto.startDate)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      const dataLang = await this.translationService.translateModuleData(
        'job',
        createJobDto,
      );
      const createSlug = generateMultiLangSlug(dataLang.title as any);

      //- Xác định xem có cần duyệt hay không vì có thể là recruiter_admin tạo job
      const recruiterAdmin =
        await this.userService.getRecruiterAdminByCompanyID(userCompanyId);

      const isAdminCreating =
        recruiterAdmin?._id.toString() === user.id.toString();

      const newJob = await this.jobModel.create({
        ...dataLang,
        slug: createSlug,
        isActive: isAdminCreating, //- Tự động duyệt nếu là recruiter_admin
        createdBy: {
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });

      //- Bắn thông báo (nếu không phải admin tạo)
      if (!isAdminCreating && recruiterAdmin) {
        this.eventEmitter.emit(NotificationType.JOB_CREATED, {
          receiverId: recruiterAdmin._id,
          senderId: user.id,
          title: 'Phê duyệt công việc mới',
          content: `Công việc mới "${newJob.title.vi}" vừa được ${user.name} tạo và đang chờ bạn phê duyệt.`,
          type: NotificationType.JOB_CREATED,
          metadata: {
            module: 'JOB',
            resourceId: newJob._id.toString(),
            action: 'APPROVE_NEEDED',
          },
        });
      }

      return {
        _id: newJob._id,
        title: newJob.title.vi,
        isActive: newJob.isActive,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, true);
    }
  }

  async findJobFilter(query: FindJobQueryDto, user: UserDecoratorType) {
    try {
      const {
        currentPage,
        pageSize,
        title,
        isActive,
        nameCreatedBy,
        status,
        isHot,
        isDeleted,
        fieldCompany,
      } = query;

      const roleSuperAdmin = this.configService.get<string>('role_super_admin');
      const isSuperAdmin = user.roleCodeName === roleSuperAdmin;

      //- Khởi tạo điều kiện lọc cơ bản cho Job
      let filterConditions: any = { isDeleted: isDeleted === 'true' };

      //- Check quyền
      if (!isSuperAdmin) {
        const userCompanyId = user.employerInfo?.companyID;
        if (!userCompanyId) {
          throw new ForbiddenException(
            'Tài khoản của bạn chưa được liên kết với công ty!',
          );
        }
        //- chỉ lấy những Job thuộc công ty của User này
        filterConditions.companyID = new mongoose.Types.ObjectId(userCompanyId);
      } else {
        //- với SUPER_ADMIN
        //- Cho phép lọc Job Hot trên toàn hệ thống
        if (isHot !== undefined && isHot !== null && isHot !== '') {
          filterConditions['isHot.isHotJob'] = isHot === 'true';
        }
      }

      //- Lọc theo Title (MultiLang)
      if (title && title !== null && title !== '') {
        const searchRegex = new RegExp(title, 'i');
        filterConditions.$or = [
          { 'title.vi': { $regex: searchRegex } },
          { 'title.en': { $regex: searchRegex } },
        ];
      }

      if (nameCreatedBy && nameCreatedBy !== null && nameCreatedBy !== '') {
        filterConditions['createdBy.name'] = {
          $regex: new RegExp(nameCreatedBy, 'i'),
        };
      }

      if (status && status !== null && status !== '')
        filterConditions.status = status;

      if (isActive !== undefined && isActive !== null && isActive !== '')
        filterConditions.isActive = isActive === 'true';

      //- Xây dựng Aggregation Pipeline
      const pipeline: any[] = [
        { $match: filterConditions }, //- Lọc Job trước để tối ưu hiệu năng
        {
          $lookup: {
            from: 'companies', //- Tên collection của Company trong DB
            localField: 'companyID', //- Trường khóa ngoại
            foreignField: '_id', //- Trường khóa chính trong collection Company
            as: 'company', //- Tên trường kết quả sau khi join
          },
        },
        { $unwind: '$company' }, // Chuyển mảng company thành object
      ];

      //- Lọc theo tên công ty, mst (Sau khi đã Lookup)
      if (fieldCompany && fieldCompany !== null && fieldCompany !== '') {
        const searchRegex = new RegExp(fieldCompany, 'i');
        pipeline.push({
          $match: {
            $or: [
              { 'company.name': searchRegex },
              { 'company.taxCode': searchRegex },
            ],
          },
        });
      }

      //- Tính toán phân trang
      const defaultPage = currentPage > 0 ? +currentPage : 1;
      const defaultLimit = +pageSize > 0 ? +pageSize : 10;
      const skip = (defaultPage - 1) * defaultLimit;

      //- Thực thi lấy tổng số lượng và kết quả phân trang
      // Tạo pipeline để đếm tổng số bản ghi sau khi lọc
      const countPipeline = [...pipeline, { $count: 'total' }];

      // Thêm sort, skip, limit vào pipeline chính
      pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: defaultLimit },
      );

      const [countResult, result] = await Promise.all([
        this.jobModel.aggregate(countPipeline).exec(),
        this.jobModel.aggregate(pipeline).exec(),
      ]);

      const totalItems = countResult.length > 0 ? countResult[0].total : 0;

      return {
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          totalPages: Math.ceil(totalItems / defaultLimit),
          totalItems: totalItems,
        },
        result,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new Error('Lỗi truy vấn Job: ' + error.message);
    }
  }

  //- API Public cho trang chủ (Không cần login, chỉ lấy job active)
  async findJobFilterPublic(query: FindJobQueryDto) {
    try {
      const {
        currentPage,
        pageSize,
        title,
        isHot,
        fieldCompany,
        address,
        level,
      } = query;

      //- Mặc định: Chỉ lấy Job Active, Status = active, IsDeleted = false
      let filterConditions: any = {
        isActive: true,
        status: 'active',
        isDeleted: false,
      };

      //- Lọc theo Title (MultiLang)
      if (title && title !== null && title !== '') {
        const searchRegex = new RegExp(title, 'i');
        filterConditions.$or = [
          { 'title.vi': { $regex: searchRegex } },
          { 'title.en': { $regex: searchRegex } },
        ];
      }

      //- Lọc theo Address (Location)
      if (address && address !== null && address !== '') {
        //- Xử lý các trường hợp đặc biệt về tên địa điểm
        let regexPattern = address;

        if (address.includes('Hồ Chí Minh') || address.includes('HCM')) {
          //- Tìm theo: Hồ Chí Minh, HCM, TPHCM, TP. Hồ Chí Minh
          regexPattern = 'Hồ Chí Minh|HCM|TPHCM';
        } else if (address.includes('Hà Nội')) {
          //- Tìm theo: Hà Nội, HN, Ha Noi, HaNoi
          regexPattern = 'Hà Nội|HN|Ha Noi|HaNoi';
        } else if (address.includes('Đà Nẵng')) {
          regexPattern = 'Đà Nẵng|Da Nang|DaNang';
        }

        filterConditions.location = { $regex: new RegExp(regexPattern, 'i') };
      }

      //- Lọc theo Level
      if (level && level !== null && level !== '') {
        filterConditions.level = level;
      }

      //- Lọc Job Hot
      if (isHot !== undefined && isHot !== null && isHot === 'true') {
        filterConditions['isHot.isHotJob'] = true;
      }

      //- Xây dựng Pipeline
      const pipeline: any[] = [
        { $match: filterConditions },
        {
          $lookup: {
            from: 'companies',
            localField: 'companyID',
            foreignField: '_id',
            as: 'company',
          },
        },
        { $unwind: '$company' },
        //- Chỉ hiển thị Job của công ty đã được duyệt và chưa bị xóa
        {
          $match: {
            'company.isDeleted': false,
            'company.status': 'ACCEPT',
          },
        },
        {
          $lookup: {
            from: 'industries',
            localField: 'industryID',
            foreignField: '_id',
            as: 'industryID',
          },
        },
        {
          $lookup: {
            from: 'skills',
            localField: 'skills',
            foreignField: '_id',
            as: 'skills',
          },
        },
      ];

      //- Lọc theo tên công ty (Sau khi Lookup)
      if (fieldCompany && fieldCompany !== null && fieldCompany !== '') {
        const searchRegex = new RegExp(fieldCompany, 'i');
        pipeline.push({
          $match: {
            $or: [
              { 'company.name': searchRegex },
              { 'company.taxCode': searchRegex },
            ],
          },
        });
      }

      //- Tính toán phân trang
      const defaultPage = currentPage && currentPage > 0 ? +currentPage : 1;
      const defaultLimit = pageSize && pageSize > 0 ? +pageSize : 10;
      const skip = (defaultPage - 1) * defaultLimit;

      //- Count total
      const countPipeline = [...pipeline]; // Clone pipeline for counting
      countPipeline.push({ $count: 'total' });

      //- Paging
      pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: defaultLimit },
      );

      const [countResult, result] = await Promise.all([
        this.jobModel.aggregate(countPipeline).exec(),
        this.jobModel.aggregate(pipeline).exec(),
      ]);

      const totalItems = countResult.length > 0 ? countResult[0].total : 0;

      return {
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          totalPages: Math.ceil(totalItems / defaultLimit),
          totalItems: totalItems,
        },
        result,
      };
    } catch (error) {
      throw new BadRequestCustom(
        'Lỗi truy vấn Job Public: ' + error.message,
        true,
      );
    }
  }

  async findAll() {
    try {
      return await this.jobModel.find().exec();
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async handleVerifyJob(
    verifyDto: RecruiteAdminApproveJobDto,
    recruiter_admin: UserDecoratorType,
  ) {
    try {
      const { jobId, action } = verifyDto;

      //- Kiểm tra Job tồn tại
      const job = await this.jobModel.findOne({ _id: jobId, isDeleted: false });
      if (!job) {
        throw new BadRequestCustom(
          'Công việc không tồn tại hoặc đã bị xóa',
          true,
        );
      }

      //- Kiểm tra quyền sở hữu công ty
      const adminCompanyId =
        recruiter_admin.employerInfo?.companyID?.toString();
      const jobCompanyId = job.companyID.toString();

      // Chỉ cho phép duyệt Job của chính công ty mình
      if (adminCompanyId !== jobCompanyId) {
        throw new ForbiddenException(
          'Bạn không có quyền phê duyệt công việc của công ty khác',
        );
      }

      //- Quyết định trạng thái mới
      const isAccept = action === 'ACCEPT';
      const updateData = {
        isActive: isAccept,
        status: isAccept ? 'active' : 'inactive',
        updatedBy: {
          _id: recruiter_admin.id,
          name: recruiter_admin.name,
          email: recruiter_admin.email,
          avatar: recruiter_admin.avatar,
        },
      };

      //- Cập nhật vào db
      const updatedJob = await this.jobModel.findByIdAndUpdate(
        jobId,
        updateData,
        { new: true },
      );

      //- Bắn thông báo cho người tạo Job (Recruiter)
      try {
        this.eventEmitter.emit(NotificationType.JOB_VERIFIED, {
          receiverId: job.createdBy._id, // Gửi cho người tạo
          senderId: recruiter_admin.id,
          title: isAccept
            ? 'Công việc đã được phê duyệt'
            : 'Công việc bị từ chối',
          content: isAccept
            ? `Chúc mừng! Công việc "${job.title.vi}" của bạn đã được phê duyệt và hiển thị công khai.`
            : `Rất tiếc! Công việc "${job.title.vi}" của bạn đã bị từ chối bởi quản trị viên.`,
          type: NotificationType.JOB_VERIFIED,
          metadata: {
            module: 'JOB',
            resourceId: job._id.toString(),
            result: action, // ACCEPT hoặc REJECT
          },
        });
      } catch (error) {
        console.error('Lỗi khi gửi thông báo verify job:', error.message);
      }

      if (!updatedJob) {
        throw new BadRequestCustom('Cập nhật không thành công', true);
      }

      return {
        _id: updatedJob._id,
        status: updatedJob.status,
        isActive: updatedJob.isActive,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findOne(id: string, ip: string) {
    //- Ép kiểu để dùng được get/set của cache-manager v5
    const cache: any = this.cacheManager;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestCustom('ID không hợp lệ', true);
    }

    //- check job
    const job = await this.jobModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .exec();

    if (!job) {
      throw new BadRequestCustom('Không tìm thấy công việc', true);
    }

    //- tắt đi, nếu bật lên thì làm sao vào được trang này để bật isActive
    // if (!job.isActive) {
    //   throw new BadRequestCustom(
    //     'Công việc này hiện chưa được phê duyệt',
    //     true,
    //   );
    // }

    try {
      const viewKey = `job_views:${id}`;
      const lockKey = `view_lock:${id}:${ip}`; //- Khóa dựa trên JobID và IP người dùng

      //- Check xem IP này có đang trong thời gian "bị khóa" không
      const isLocked = await cache.get(lockKey);

      if (!isLocked) {
        //- Tăng view tạm thời trong Redis
        let additionalViews: number = (await cache.get(viewKey)) || 0;
        additionalViews++;
        await cache.set(viewKey, additionalViews);

        //- Ghi nhận "khóa" IP này lại trong 30 phút (1.800.000 ms)
        //- hết 30p tự mất lockKey để có thể tăng view lại
        await cache.set(lockKey, true, 1800000);
      }

      //- Trả về kết quả: View gốc + View tạm từ Redis
      const currentAdditional = (await cache.get(viewKey)) || 0;
      const jobObject = job.toObject();

      return {
        ...jobObject,
        totalViews: (jobObject.totalViews || 0) + currentAdditional,
      };
    } catch (redisError) {
      //- Fail-safe: Redis lỗi thì vẫn cho xem Job, chỉ là không tăng view
      console.error('Redis View Count Error:', redisError.message);
      return job.toObject();
    }
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    user: UserDecoratorType,
  ) {
    try {
      //- dịch đã
      const dataLang = await this.translationService.translateModuleData(
        'job',
        updateJobDto,
      );

      const { status, isActive, isHot, hotDays, ...restData } = dataLang;

      //- check id đã
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID công việc không hợp lệ', true);
      }

      //- Tìm Job hiện tại
      const currentJob = await this.jobModel.findOne({
        _id: id,
        isDeleted: false,
      });
      if (!currentJob) {
        throw new BadRequestCustom('Công việc không tồn tại', true);
      }

      const userRole = user.roleCodeName;
      const userCompanyId = user.employerInfo?.companyID?.toString();
      const jobCompanyId = currentJob.companyID.toString();

      //- lấy ra roletừ config
      const textRoleSuperAdmin =
        this.configService.get<string>('role_super_admin');
      const textRoleRecruiterAdmin = this.configService.get<string>(
        'role_recruiter_admin',
      );

      //- nếu không phải super_admin và công ty của user khác công ty của job thì không cho sửa
      if (userRole !== textRoleSuperAdmin && userCompanyId !== jobCompanyId) {
        throw new ForbiddenException(
          'Bạn không có quyền chỉnh sửa công việc này',
        );
      }

      const updatePayload: any = { ...restData };

      const isSuperAdmin = userRole === textRoleSuperAdmin;
      const isRecruiterAdmin = userRole === textRoleRecruiterAdmin;
      const isNormalRecruiter = !isSuperAdmin && !isRecruiterAdmin;

      //- logic isActive: Recruiter sửa thì bắt duyệt lại
      if (isNormalRecruiter) {
        updatePayload.isActive = false;
      } else if (isActive !== undefined) {
        //- chỉ super_admin và recruiter_admin mới set được nếu có truyền lên
        updatePayload.isActive = isActive;
      }

      if (status) updatePayload.status = status;

      // LOGIC isHot chỉ dành cho super_admin
      if (isHot !== undefined && isSuperAdmin) {
        if (isHot) {
          //- Nếu set Hot: tính toán ngày hết hạn
          const days = hotDays || 3; // Mặc định 3 ngày nếu không truyền
          const expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + days);

          updatePayload.isHot = {
            isHotJob: true,
            hotUntil: expireDate,
          };
        } else {
          //- Nếu tắt Hot
          updatePayload.isHot = {
            isHotJob: false,
            hotUntil: null,
          };
        }
      }

      //- Tự động cập nhật slug nếu title thay đổi
      if (restData.title) {
        updatePayload.slug = generateMultiLangSlug(restData.title as any);
      }

      //- Thực hiện cập nhật vào DB
      const updatedJob = await this.jobModel.findByIdAndUpdate(
        id,
        {
          ...updatePayload,
          updatedBy: {
            _id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        },
        { new: true, runValidators: true },
      );

      if (!updatedJob) {
        throw new BadRequestCustom('Cập nhật công việc thất bại', true);
      }

      //- Thông báo cho Recruiter_Admin nếu Recruiter thường cập nhật
      if (isNormalRecruiter) {
        try {
          const recruiterAdmin =
            await this.userService.getRecruiterAdminByCompanyID(userCompanyId!);
          if (recruiterAdmin) {
            this.eventEmitter.emit(NotificationType.JOB_UPDATED, {
              receiverId: recruiterAdmin._id,
              senderId: user.id,
              title: 'Công việc chờ duyệt lại',
              content: `Công việc "${updatedJob.title.vi}" đã được chỉnh sửa bởi nhân viên ${user.name} và đang chờ bạn phê duyệt lại.`,
              type: NotificationType.JOB_UPDATED,
              metadata: {
                module: 'JOB',
                resourceId: updatedJob._id.toString(),
                action: 'APPROVE_NEEDED',
              },
            });
          }
        } catch (notifError) {
          console.error(
            'Notification Error after job update:',
            notifError.message,
          );
        }
      }

      return updatedJob;
    } catch (error) {
      console.log('error update job: ', error);
    }
  }

  //- khôi phục công việc đã xóa dành cho super_admin
  async restore(id: string, user: UserDecoratorType) {
    try {
      //- Kiểm tra ID hợp lệ
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID không hợp lệ', true);
      }

      //- Kiểm tra quyền hạn (Chỉ Super Admin mới được khôi phục)
      const textRoleSuperAdmin =
        this.configService.get<string>('role_super_admin');
      if (user.roleCodeName !== textRoleSuperAdmin) {
        throw new ForbiddenException(
          'Chỉ quản trị viên hệ thống mới có quyền khôi phục công việc!',
        );
      }

      //- Tìm Job đang ở trạng thái bị xóa
      const job = await this.jobModel.findOne({ _id: id, isDeleted: true });

      if (!job) {
        throw new BadRequestCustom(
          'Không tìm thấy công việc bị xóa để khôi phục',
          true,
        );
      }

      //- Thực hiện khôi phục
      return await this.jobModel.updateOne(
        { _id: id },
        {
          $set: {
            isDeleted: false,
            updatedBy: {
              _id: user.id,
              email: user.email,
              name: user.name,
              avatar: user.avatar,
            },
          },
          // Sử dụng $unset để xóa sạch các trường thông tin khi xóa
          $unset: {
            deletedAt: 1,
            deletedBy: 1,
          },
        },
      );
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async removeMany(ids: string[], user: UserDecoratorType) {
    try {
      const textRoleSuperAdmin =
        this.configService.get<string>('role_super_admin');
      const textRoleRecruiterAdmin = this.configService.get<string>(
        'role_recruiter_admin',
      );

      const isSuperAdmin = user.roleCodeName === textRoleSuperAdmin;
      const isRecruiterAdmin = user.roleCodeName === textRoleRecruiterAdmin;

      // Nếu không phải 1 trong 2 role này thì chặn ngay
      if (!isSuperAdmin && !isRecruiterAdmin) {
        throw new ForbiddenException(
          'Bạn không có quyền thực hiện hành động này!',
        );
      }

      //- Xây dựng Filter truy vấn
      const filter: any = {
        _id: { $in: ids },
        isDeleted: false,
      };

      //- Nếu là Recruiter_Admin: Chỉ cho phép tác động vào các Job thuộc công ty mình
      if (!isSuperAdmin) {
        const userCompanyID = user.employerInfo?.companyID;
        if (!userCompanyID) {
          throw new ForbiddenException(
            'Tài khoản của bạn không gắn liền với công ty nào!',
          );
        }
        filter.companyID = new mongoose.Types.ObjectId(userCompanyID);
      }

      const result = await this.jobModel.updateMany(filter, {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: {
            _id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        },
      });

      if (result.matchedCount === 0) {
        throw new BadRequestCustom(
          'Không tìm thấy công việc hợp lệ để xóa!',
          true,
        );
      }

      return {
        matched: result.matchedCount,
        deleted: result.modifiedCount,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- phục vụ xóa công ty: soft delete nhiều job theo companyID
  async softDeleteManyByCompany(
    companyIds: string[],
    session: mongoose.ClientSession,
  ) {
    return await this.jobModel.updateMany(
      {
        companyID: {
          $in: companyIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        isDeleted: false,
      },
      { $set: { isDeleted: true, status: 'inactive' } },
      { session },
    );
  }

  //- hàm này là đối ngược với hàm softDeleteManyByCompany, ta sẽ khôi phục công ty
  async restoreManyByCompany(
    companyId: string,
    session: mongoose.ClientSession,
  ) {
    return await this.jobModel.updateMany(
      {
        companyID: new mongoose.Types.ObjectId(companyId),
        isDeleted: true,
        status: 'inactive',
      },
      { $set: { isDeleted: false, status: 'active' } },
      { session },
    );
  }

  async remove(id: string, user: UserDecoratorType) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID không hợp lệ', true);
      }

      const job = await this.jobModel.findOne({ _id: id, isDeleted: false });
      if (!job) {
        throw new BadRequestCustom(
          'Không tìm thấy công việc hoặc đã bị xóa',
          true,
        );
      }

      const textRoleSuperAdmin =
        this.configService.get<string>('role_super_admin');
      const textRoleRecruiterAdmin = this.configService.get<string>(
        'role_recruiter_admin',
      );

      const isSuperAdmin = user.roleCodeName === textRoleSuperAdmin;
      const isRecruiterAdmin = user.roleCodeName === textRoleRecruiterAdmin;

      //- KIỂM TRA QUYỀN THEO CÔNG TY (recruiter_admin chỉ được xóa công việc của công ty mình)
      //- So sánh companyID của Job với companyID trong employerInfo của User
      const userCompanyID = user.employerInfo?.companyID;
      const isSameCompany =
        job.companyID?.toString() === userCompanyID?.toString();

      // Điều kiện: SuperAdmin (Xóa tất cả) HOẶC (RecruiterAdmin VÀ cùng công ty)
      const canDelete = isSuperAdmin || (isRecruiterAdmin && isSameCompany);

      if (!canDelete) {
        throw new ForbiddenException(
          'Bạn không có quyền xóa công việc của công ty khác hoặc không đủ thẩm quyền!',
        );
      }

      return await this.jobModel.updateOne(
        { _id: id },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: {
            _id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
        },
      );
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
