import { Injectable, BadRequestException } from '@nestjs/common';
import {
  CreateConversationDto,
  AssignConversationDto,
} from './dto/create-conversation.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { Model, Types } from 'mongoose';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    private configService: ConfigService,
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
      const existingConv = await this.conversationModel
        .findOne({
          candidateId: new Types.ObjectId(candidateId),
          companyId: new Types.ObjectId(companyId),
        })
        .populate(['candidateId', 'companyId']);

      if (existingConv) {
        return existingConv;
      }

      const newConv = await this.conversationModel.create({
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

      return await newConv.populate(['candidateId', 'companyId']);
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

      if (user.roleCodeName === candidateText) {
        filter.candidateId = new Types.ObjectId(user.id);
      } else if (
        [recruiterText, recruiterAdminText].includes(user.roleCodeName)
      ) {
        if (user.employerInfo?.companyID) {
          filter.companyId = new Types.ObjectId(user.employerInfo.companyID);
        }
      }

      return await this.conversationModel
        .find(filter)
        .populate('candidateId', 'name avatar email')
        .populate('companyId', 'name logo')
        .sort({ updatedAt: -1 });
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách phòng chat');
    }
  }

  async findOne(id: number | string) {
    return await this.conversationModel
      .findById(id)
      .populate('candidateId', 'name avatar email')
      .populate('companyId', 'name logo')
      .populate('assignedRecruiterId', 'name avatar email');
  }

  async assign(
    id: string,
    assignDto: AssignConversationDto,
    user: UserDecoratorType,
  ) {
    const recruiterAdminText = this.configService.get<string>(
      'role_recruiter_admin',
    );

    if (user.roleCodeName !== recruiterAdminText) {
      throw new BadRequestException(
        'Chỉ RECRUITER_ADMIN mới có quyền phân công',
      );
    }

    return await this.conversationModel.findByIdAndUpdate(
      id,
      {
        assignedRecruiterId: new Types.ObjectId(assignDto.assignedRecruiterId),
      },
      { new: true },
    );
  }

  async markAsRead(id: string, user: UserDecoratorType) {
    let updateData = {};
    const candidateText = this.configService.get<string>('role_candidate');

    if (user.roleCodeName === candidateText) {
      updateData = { unreadCandidate: 0 };
    } else {
      updateData = { unreadCompany: 0 };
    }
    return await this.conversationModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  async updateLastMessage(
    conversationId: string,
    message: string,
    userRole: string,
  ) {
    const candidateText = this.configService.get<string>('role_candidate');

    const isCandidate = userRole === candidateText;
    const incQuery = isCandidate
      ? { unreadCompany: 1 }
      : { unreadCandidate: 1 };

    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      lastMessageAt: new Date(),
      $inc: incQuery,
    });
  }
}
