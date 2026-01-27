import { ForbiddenException, Injectable } from '@nestjs/common';
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
import { RolesService } from '../roles/roles.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly translationService: TranslationService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
    private userService: UserService,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
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

  async findAllByFilter(query: FindJobQueryDto) {
    try {
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
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
    const adminCompanyId = recruiter_admin.employerInfo?.companyID?.toString();
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
  }

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID không hợp lệ', true);
      }

      const job = await this.jobModel.findById(id).exec();

      if (!job) {
        throw new BadRequestCustom('Không tìm thấy công việc', true);
      }

      if (!job.isActive) {
        throw new BadRequestCustom(
          'Công việc này hiện chưa được phê duyệt',
          true,
        );
      }

      return job;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    user: UserDecoratorType,
  ) {
    const { status, isActive, isHot, hotDays, ...restData } = updateJobDto;

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
  }

  async removeMany(ids: string[], user: UserDecoratorType) {
    try {
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string, user: UserDecoratorType) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID không hợp lệ', true);
      }
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
