import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdBookingDto } from './dto/create-ad-booking.dto';
import { UpdateAdBookingDto } from './dto/update-ad-booking.dto';
import { AdBookingRepository } from './repository/ad-booking.repository';
import { AdPaymentRepository } from '../ad-payment/repository/ad-payment.repository';
import { AdSlotRepository } from '../ad-slot/repository/ad-slot.repository';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import * as dayjs from 'dayjs';
import { NotificationsGateway } from 'src/modules/notifications/notifications.gateway';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AdBookingService {
  constructor(
    private readonly adBookingRepository: AdBookingRepository,
    private readonly adPaymentRepository: AdPaymentRepository,
    private readonly adSlotRepository: AdSlotRepository,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(
    createAdBookingDto: CreateAdBookingDto,
    user: UserDecoratorType,
  ) {
    const { employerInfo, id: recruiterId } = user;

    if (!employerInfo?.companyID) {
      throw new BadRequestException(
        'Bạn phải thuộc một công ty để đặt quảng cáo',
      );
    }

    const companyId = employerInfo.companyID;

    //- Lấy thông tin slot quảng cáo
    const slot = await this.adSlotRepository.findById(
      createAdBookingDto.slotId,
    );
    if (!slot) {
      throw new BadRequestException('Slot quảng cáo không tồn tại');
    }

    if (!slot.isActive || slot.isDeleted) {
      throw new BadRequestException('Slot quảng cáo hiện không khả dụng');
    }

    //- Tính toán số ngày và số tiền
    const start = dayjs(createAdBookingDto.startAt).startOf('day');
    const end = dayjs(createAdBookingDto.endAt).startOf('day');
    const diffDays = end.diff(start, 'day') + 1;

    if (diffDays <= 0) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    if (diffDays > slot.maxDurationDays) {
      throw new BadRequestException(
        `Thời gian chạy tối đa cho slot này là ${slot.maxDurationDays} ngày`,
      );
    }

    //- KIỂM TRA TRÙNG LỊCH (Overlap check)
    // Tìm bất kỳ booking nào của slot này mà có thời gian chồng lấn và chưa bị hủy
    const overlappingBooking = await this.adBookingRepository.findOneRaw({
      slotId: createAdBookingDto.slotId,
      status: { $nin: ['CANCELLED', 'EXPIRED'] },
      $or: [
        {
          startAt: { $lte: createAdBookingDto.endAt },
          endAt: { $gte: createAdBookingDto.startAt },
        },
      ],
    });

    if (overlappingBooking) {
      throw new BadRequestException(
        'Khoảng thời gian này đã có công ty khác đặt chỗ. Vui lòng chọn thời gian khác.',
      );
    }

    const amount = diffDays * slot.pricePerDay;

    //- Khởi tạo Transaction
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      //- Tạo AdBooking
      const bookingPayload = {
        ...createAdBookingDto,
        companyId,
        recruiterId,
        amount,
        status: 'PENDING_PAYMENT',
      };

      const booking = await this.adBookingRepository.create(
        bookingPayload,
        session,
      );

      //- Sinh mã giao dịch (Transfer Content & Order Code)
      const timestamp = dayjs().format('YYMMDDHHmmss');
      const transferContent =
        `ADV${timestamp}${recruiterId.slice(-4)}`.toUpperCase();
      const orderCode = `ORD_${timestamp}_${booking._id}`;

      //- Tạo AdPayment
      const paymentPayload = {
        bookingId: booking._id,
        provider: 'SEPAY',
        orderCode,
        transferContent,
        amount,
        status: 'PENDING',
      };

      const payment = await this.adPaymentRepository.create(
        paymentPayload,
        session,
      );

      //- Cập nhật paymentId vào Booking
      await this.adBookingRepository.updateOneRaw(
        { _id: booking._id },
        { paymentId: payment._id },
        { session },
      );

      await session.commitTransaction();

      //- Notify Admin
      try {
        const textRoleAdmin =
          this.configService.get<string>('role_super_admin');
        const superAdmin = await this.userService.getUserByRoleSuperAdmin(
          textRoleAdmin!,
        );

        if (superAdmin) {
          this.eventEmitter.emit(NotificationType.AD_CREATED, {
            receiverId: superAdmin._id.toString(),
            senderId: recruiterId,
            title: 'Đơn quảng cáo mới',
            content: `Khách hàng vừa tạo một đơn quảng cáo mới (Mã: ${orderCode}) và đang chờ thanh toán.`,
            type: NotificationType.AD_CREATED,
            metadata: {
              module: 'ADVERTISING',
              resourceId: booking._id.toString(),
            },
          });
        }
      } catch (err) {
        console.error('Failed to notify admin on ad creation:', err.message);
      }

      return {
        booking: {
          ...booking.toObject(),
          paymentId: payment._id,
        },
        payment: payment.toObject(),
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        error.message || 'Lỗi hệ thống khi tạo đơn quảng cáo',
      );
    } finally {
      session.endSession();
    }
  }

  async getBusyDates(slotCode: string) {
    const slot = await this.adSlotRepository.findByCode(slotCode);
    if (!slot) return [];

    const bookings = await this.adBookingRepository.find({
      filter: {
        slotId: slot._id,
        status: { $nin: ['CANCELLED', 'EXPIRED'] },
        // Lấy các booking từ hôm nay trở đi để tối ưu
        endAt: { $gte: dayjs().startOf('day').toDate() },
      },
    });

    return bookings.map((b) => ({
      startAt: b.startAt,
      endAt: b.endAt,
      companyId: b.companyId, //- Có thể dùng để hiển thị tên công ty nếu cần (masking info)
    }));
  }

  async findAll(
    user: UserDecoratorType,
    query: { currentPage: number; pageSize: number },
  ) {
    const companyId = user.employerInfo?.companyID;
    if (!companyId) {
      throw new ForbiddenException('Bạn không có quyền truy cập dữ liệu này');
    }

    const { currentPage, pageSize } = query;

    const [total, items] = await Promise.all([
      this.adBookingRepository.countDocumentsRaw(
        {
          companyId: companyId,
          isDeleted: { $ne: true },
        },
        false, //- includeDeleted = false
      ),
      this.adBookingRepository.findRaw(
        {
          companyId: companyId,
          isDeleted: { $ne: true },
        },
        {
          skip: (currentPage - 1) * pageSize,
          limit: pageSize,
          sort: { createdAt: -1 },
          lean: true,
          populate: ['recruiterId', 'companyId', 'paymentId', 'slotId'],
        },
      ),
    ]);

    return {
      meta: {
        current: currentPage,
        pageSize: pageSize,
        totalPages: Math.ceil(total / pageSize),
        totalItems: total,
      },
      result: items,
    };
  }

  async findAllByAdmin(query: { currentPage: number; pageSize: number }) {
    const { currentPage, pageSize } = query;
    const defaultPage = currentPage > 0 ? +currentPage : 1;
    const defaultLimit = pageSize > 0 ? +pageSize : 10;
    const skip = (defaultPage - 1) * defaultLimit;

    const [totalItems, items] = await Promise.all([
      this.adBookingRepository.countDocumentsRaw({}),
      this.adBookingRepository.findRaw(
        {},
        {
          skip,
          limit: defaultLimit,
          sort: { createdAt: -1 },
          populate: ['recruiterId', 'companyId', 'paymentId', 'slotId'],
        },
      ),
    ]);

    return {
      meta: {
        current: defaultPage,
        pageSize: defaultLimit,
        totalPages: Math.ceil(totalItems / defaultLimit),
        totalItems,
      },
      result: items,
    };
  }

  async findOne(id: string, user: UserDecoratorType) {
    const booking = await this.adBookingRepository.findByIdRaw(id, {
      populate: ['recruiterId', 'companyId', 'paymentId', 'slotId'],
    });
    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt quảng cáo');
    }

    const bookingCompanyId =
      booking.companyId?._id?.toString() || booking.companyId?.toString();
    if (bookingCompanyId !== user.employerInfo?.companyID) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    return booking;
  }

  async update(
    id: string,
    updateAdBookingDto: UpdateAdBookingDto,
    user: UserDecoratorType,
  ) {
    const booking = await this.findOne(id, user);

    //- Chỉ cho phép chỉnh sửa nếu đơn đang ở trạng thái chờ thanh toán
    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(
        'Không thể chỉnh sửa đơn hàng đã thanh toán hoặc đang xử lý',
      );
    }

    return this.adBookingRepository.updateOneRaw(
      { _id: id },
      updateAdBookingDto,
    );
  }

  async remove(id: string, user: UserDecoratorType) {
    const booking = await this.findOne(id, user);

    //- Cho phép xóa mềm đối với các đơn chưa thanh toán, đã hủy hoặc hết hạn
    if (!['PENDING_PAYMENT', 'CANCELLED', 'EXPIRED'].includes(booking.status)) {
      throw new BadRequestException(
        'Chỉ có thể xóa các đơn nháp, đã hủy hoặc hết hạn',
      );
    }

    return this.adBookingRepository.softDeleteById(id);
  }

  //- Khách hàng (Recruiter) tự hủy đơn khi đổi ý (chỉ áp dụng khi chưa thanh toán)
  async cancelByUser(id: string, user: UserDecoratorType) {
    const booking = await this.findOne(id, user);

    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Chỉ có thể hủy đơn đang chờ thanh toán');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.adBookingRepository.updateOneRaw(
        { _id: id },
        { status: 'CANCELLED' },
        { session },
      );

      if (booking.paymentId) {
        await this.adPaymentRepository.updateOneRaw(
          { _id: booking.paymentId },
          { status: 'EXPIRED' },
          { session },
        );
      }

      await session.commitTransaction();

      //- Notify via socket so client can update UI if needed
      this.notificationsGateway.emitPaymentCancelled(
        user.id,
        booking.paymentId?.toString(),
      );

      return { message: 'Đã hủy đơn quảng cáo thành công' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      session.endSession();
    }
  }

  //- Admin hủy đơn (có quyền cao nhất, hủy ở bất kỳ trạng thái nào)
  async cancelByAdmin(id: string, admin: UserDecoratorType) {
    const booking = await this.adBookingRepository.findByIdRaw(id, {
      populate: ['slotId'],
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn quảng cáo');
    }

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      throw new BadRequestException('Đơn quảng cáo này đã bị hủy hoặc hết hạn');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.adBookingRepository.updateOneRaw(
        { _id: id },
        { status: 'CANCELLED' },
        { session },
      );

      if (booking.paymentId && booking.status === 'PENDING_PAYMENT') {
        await this.adPaymentRepository.updateOneRaw(
          { _id: booking.paymentId },
          { status: 'EXPIRED' },
          { session },
        );
      }

      await session.commitTransaction();

      //- Notify Recruiter
      try {
        const slotName = booking.slotId['name'] || 'N/A';
        this.eventEmitter.emit(NotificationType.AD_CANCELLED, {
          receiverId: booking.recruiterId.toString(),
          senderId: admin.id,
          title: 'Quảng cáo bị hủy',
          content: `Quảng cáo của bạn (Slot: ${slotName}) đã bị Ban Quản Trị hệ thống hủy. Nếu bạn đã thanh toán, vui lòng liên hệ CSKH.`,
          type: NotificationType.AD_CANCELLED,
          metadata: {
            module: 'ADVERTISING',
            resourceId: booking._id.toString(),
          },
        });

        //- Emit socket event
        this.notificationsGateway.emitPaymentCancelled(
          booking.recruiterId.toString(),
          booking.paymentId?.toString(),
        );
      } catch (err) {
        console.error(
          'Failed to notify recruiter on ad cancellation:',
          err.message,
        );
      }

      return { message: 'Đã hủy đơn quảng cáo thành công' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      session.endSession();
    }
  }

  async getActiveAdBySlotCode(slotCode: string) {
    const now = dayjs().startOf('day').toDate();
    const nextDay = dayjs().endOf('day').toDate();

    //- Phải tìm slotId trước từ slotCode
    const slot = await this.adSlotRepository.findByCode(slotCode.toUpperCase());
    if (!slot) return null;

    //- Tìm booking đang chạy cho slot này
    const ad = await this.adBookingRepository.findOneRaw(
      {
        slotId: slot._id.toString(),
        status: { $in: ['SCHEDULED', 'RUNNING'] },
        startAt: { $lte: nextDay },
        endAt: { $gte: now },
        isDeleted: { $ne: true },
      },
      {
        populate: ['companyId', 'slotId'],
        lean: true,
      },
    );

    //- Tự động cập nhật status thành RUNNING nếu đã tới ngày nhưng vẫn đang là SCHEDULED
    if (
      ad &&
      ad.status === 'SCHEDULED' &&
      dayjs().isAfter(dayjs(ad.startAt).startOf('day'))
    ) {
      await this.adBookingRepository.updateOneRaw(
        { _id: ad._id },
        { status: 'RUNNING' },
      );
      ad.status = 'RUNNING';
    }

    return { ad, slot };
  }
}
