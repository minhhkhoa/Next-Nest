import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdBookingService } from './ad-booking.service';
import { CreateAdBookingDto } from './dto/create-ad-booking.dto';
import { UpdateAdBookingDto } from './dto/update-ad-booking.dto';
import {
  Public,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@ApiTags('ad-booking')
@Controller('ad-booking')
export class AdBookingController {
  constructor(private readonly adBookingService: AdBookingService) {}

  @Get('busy-dates/:slotCode')
  @ResponseMessage('Lấy ngày bận của slot quảng cáo thành công')
  @ApiOperation({ summary: 'Lấy ngày bận của slot quảng cáo theo code' })
  getBusyDates(@Param('slotCode') slotCode: string) {
    return this.adBookingService.getBusyDates(slotCode);
  }

  // @Public()
  // @ResponseMessage('Lấy quảng cáo đang hoạt động thành công')
  // @ApiOperation({ summary: 'Lấy quảng cáo đang hoạt động theo slot' })
  // @Get('active/:slotCode')
  // getActiveAd(@Param('slotCode') slotCode: string) {
  //   return this.adBookingService.getActiveAdBySlotCode(slotCode);
  // }

  @Post()
  @ResponseMessage('Tạo yêu cầu đặt quảng cáo thành công')
  @ApiOperation({ summary: 'Tạo yêu cầu đặt quảng cáo mới' })
  create(
    @Body() createAdBookingDto: CreateAdBookingDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adBookingService.create(createAdBookingDto, user);
  }

  //- recruiter lấy danh sách đơn của công ty mình
  @Get('recruiter/all')
  @ResponseMessage('Lấy danh sách đơn đặt quảng cáo thành công')
  @ApiOperation({ summary: 'Lấy danh sách đơn đặt quảng cáo của recruiter' })
  findAll(
    @Query('currentPage') currentPage: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adBookingService.findAll(user, {
      currentPage: Number(currentPage),
      pageSize: Number(pageSize),
    });
  }

  //- admin lấy tất cả các yêu cầu đặt quảng cáo
  @Get('admin/all')
  @ResponseMessage('Lấy danh sách đơn đặt quảng cáo thành công')
  @ApiOperation({ summary: 'Lấy danh sách đơn đặt quảng cáo của admin' })
  findAllByAdmin(
    @Query('currentPage') currentPage: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @userDecorator() admin: UserDecoratorType,
  ) {
    return this.adBookingService.findAllByAdmin({
      currentPage: Number(currentPage),
      pageSize: Number(pageSize),
    });
  }

  @Get(':id')
  @ResponseMessage('Lấy chi tiết đơn đặt quảng cáo thành công')
  @ApiOperation({ summary: 'Lấy chi tiết đơn đặt quảng cáo' })
  findOne(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.adBookingService.findOne(id, user);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật đơn đặt quảng cáo thành công')
  @ApiOperation({ summary: 'Cập nhật đơn đặt quảng cáo' })
  update(
    @Param('id') id: string,
    @Body() updateAdBookingDto: UpdateAdBookingDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adBookingService.update(id, updateAdBookingDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa đơn đặt quảng cáo thành công')
  @ApiOperation({ summary: 'Xóa đơn đặt quảng cáo' })
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.adBookingService.remove(id, user);
  }

  //- người dùng hủy yêu cầu
  @Patch('cancel/:id')
  @ResponseMessage('Hủy đơn đặt quảng cáo thành công')
  @ApiOperation({ summary: 'Hủy đơn đặt quảng cáo của người dùng' })
  cancelByUser(
    @Param('id') id: string,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adBookingService.cancelByUser(id, user);
  }

  //- admin hủy yêu cầu
  @Patch('admin/cancel/:id')
  @ResponseMessage('Hủy đơn đặt quảng cáo thành công')
  @ApiOperation({ summary: 'Hủy đơn đặt quảng cáo của admin' })
  cancelByAdmin(
    @Param('id') id: string,
    @userDecorator() admin: UserDecoratorType,
  ) {
    return this.adBookingService.cancelByAdmin(id, admin);
  }
}
