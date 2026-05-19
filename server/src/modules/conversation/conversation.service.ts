import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  CreateConversationDto,
  AssignConversationDto,
} from './dto/create-conversation.dto';
import { Types } from 'mongoose';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { ConfigService } from '@nestjs/config';
import { ConversationRepository } from './repository/conversation.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createConversationDto: CreateConversationDto,
    user: UserDecoratorType,
  ) {
    try {
      let candidateId = '';
      let companyId = '';
      let assignedRecruiterId: Types.ObjectId | null = null;

      const candidateText = this.configService.get<string>('role_candidate');
      const recruiterText = this.configService.get<string>('role_recruiter');
      const recruiterAdminText = this.configService.get<string>(
        'role_recruiter_admin',
      );

      //- TH1: Nếu là Candidate tạo phòng chat thì phải có companyId
      if (user.roleCodeName === candidateText) {
        candidateId = user.id;
        if (!createConversationDto.companyId) {
          throw new BadRequestException(
            'Bắt buộc phải có Company ID khi ứng viên tạo phòng chat',
          );
        }
        companyId = createConversationDto.companyId;
      } else if (
        //- TH2: Nếu là Recruiter tạo phòng chat thì phải có candidateId và companyId sẽ lấy từ token
        [recruiterText, recruiterAdminText].includes(user.roleCodeName)
      ) {
        if (!user.employerInfo?.companyID) {
          throw new BadRequestException('Bạn không thuộc công ty nào');
        }
        companyId = user.employerInfo.companyID;

        if (!createConversationDto.candidateId) {
          throw new BadRequestException(
            'Bắt buộc phải có Candidate ID khi nhà tuyển dụng tạo phòng chat',
          );
        }
        candidateId = createConversationDto.candidateId;
        assignedRecruiterId = new Types.ObjectId(user.id);
      } else {
        //- TH3: Các loại tài khoản khác không được phép tạo phòng chat
        throw new BadRequestException('Tài khoản không được hỗ trợ để chat');
      }

      //- Kiểm tra xem đã có conversation giữa candidateId và companyId này chưa
      const existingConv = await this.conversationRepository.findExisting(
        candidateId,
        companyId,
      );

      if (existingConv) {
        return existingConv;
      }

      const newConv = await this.conversationRepository.createAndPopulate({
        candidateId: new Types.ObjectId(candidateId),
        companyId: new Types.ObjectId(companyId),
        assignedRecruiterId,
        createdBy: {
          _id: new Types.ObjectId(user.id),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      });

      //- Thong bao qua EventEmitter de ChatGateway phat new_conversation den company room
      this.eventEmitter.emit('conversation.created', {
        companyId,
        conversation: newConv,
      });

      return newConv;
    } catch (error) {
      throw new BadRequestException('Không thể tạo phòng chat mới');
    }
  }

  async findAll(user: UserDecoratorType) {
    try {
      let filter: any = {};
      const candidateText = this.configService.get<string>('role_candidate');
      const recruiterText = this.configService.get<string>('role_recruiter');
      const recruiterAdminText = this.configService.get<string>(
        'role_recruiter_admin',
      );

      const superAdminText = this.configService.get<string>('role_super_admin');

      if (user.roleCodeName === candidateText) {
        filter.candidateId = new Types.ObjectId(user.id);
      } else if (
        [recruiterText, recruiterAdminText].includes(user.roleCodeName)
      ) {
        //- Bắt buộc phải có companyID và trạng thái ACTIVE mới được xem chat
        if (
          user.employerInfo?.companyID &&
          user.employerInfo?.userStatus === 'ACTIVE'
        ) {
          filter.companyId = new Types.ObjectId(user.employerInfo.companyID);
        } else {
          //- Nếu chưa có công ty hoặc chưa được duyệt thì không trả về gì (tránh leak data)
          return [];
        }
      } else if (user.roleCodeName === superAdminText) {
        //- Super Admin khong duoc xem conversations cua nguoi khac trong chat sidebar
        return [];
      } else {
        //- Các role khác (GUEST, ...) mặc định không thấy gì
        return [];
      }

      return await this.conversationRepository.findAllByFilter(filter);
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách phòng chat');
    }
  }

  async findOne(id: string, user: UserDecoratorType) {
    const conversation = await this.conversationRepository.findByIdWithDetails(
      id,
    );

    if (!conversation) {
      throw new BadRequestException('Không tìm thấy phòng chat');
    }

    const candidateText = this.configService.get<string>('role_candidate');
    const superAdminText = this.configService.get<string>('role_super_admin');

    //- Check quyền truy cập
    const isOwnerCandidate =
      user.roleCodeName === candidateText &&
      conversation.candidateId._id.toString() === user.id;

    const isOwnerCompany =
      user.employerInfo?.companyID &&
      conversation.companyId._id.toString() ===
        user.employerInfo.companyID.toString();

    const isSuperAdmin = user.roleCodeName === superAdminText;

    if (!isOwnerCandidate && !isOwnerCompany && !isSuperAdmin) {
      throw new ForbiddenException('Bạn không có quyền truy cập phòng chat này');
    }

    return conversation;
  }

  async assign(
    id: string,
    assignDto: AssignConversationDto,
    user: UserDecoratorType,
  ) {
    //- Đảm bảo user có quyền truy cập vào phòng chat này
    await this.findOne(id, user);

    const recruiterAdminText = this.configService.get<string>(
      'role_recruiter_admin',
    );

    if (user.roleCodeName !== recruiterAdminText) {
      throw new BadRequestException(
        'Chỉ RECRUITER_ADMIN mới có quyền phân công',
      );
    }

    return await this.conversationRepository.assignRecruiter(
      id,
      assignDto.assignedRecruiterId,
    );
  }

  async markAsRead(id: string, user: UserDecoratorType) {
    //- Đảm bảo user có quyền truy cập vào phòng chat này
    await this.findOne(id, user);

    const candidateText = this.configService.get<string>('role_candidate');
    const isCandidate = user.roleCodeName === candidateText;

    return this.conversationRepository.markAsRead(id, user.id, isCandidate);
  }

  async updateLastMessage(
    conversationId: string,
    message: string,
    userRole: string,
  ) {
    const candidateText = this.configService.get<string>('role_candidate');

    const isCandidate = userRole === candidateText;

    await this.conversationRepository.updateLastMessage(
      conversationId,
      message,
      isCandidate,
    );
  }
}
