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

@Injectable()
export class AdBookingService {
  constructor(
    private readonly adBookingRepository: AdBookingRepository,
    private readonly adPaymentRepository: AdPaymentRepository,
    private readonly adSlotRepository: AdSlotRepository,
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
    const slot = await this.adSlotRepository.findByCode(
      createAdBookingDto.slotCode,
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
      slotCode: createAdBookingDto.slotCode,
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
    const bookings = await this.adBookingRepository.find({
      filter: {
        slotCode,
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

  async findAll(user: UserDecoratorType) {
    const companyId = user.employerInfo?.companyID;
    if (!companyId) {
      throw new ForbiddenException('Bạn không có quyền truy cập dữ liệu này');
    }
    return this.adBookingRepository.find({
      filter: { companyId: new Types.ObjectId(companyId) },
    });
  }

  async findOne(id: string, user: UserDecoratorType) {
    const booking = await this.adBookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Không tìm thấy đơn đặt quảng cáo');
    }

    if (booking.companyId.toString() !== user.employerInfo?.companyID) {
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

    //- Chỉ cho phép xóa nếu đơn chưa thanh toán
    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Không thể xóa đơn hàng đã thanh toán');
    }

    return this.adBookingRepository.softDeleteById(id);
  }
}
