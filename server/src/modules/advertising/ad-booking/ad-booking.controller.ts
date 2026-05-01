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
import { ApiTags } from '@nestjs/swagger';
import { AdBookingService } from './ad-booking.service';
import { CreateAdBookingDto } from './dto/create-ad-booking.dto';
import { UpdateAdBookingDto } from './dto/update-ad-booking.dto';
import { userDecorator } from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@ApiTags('ad-booking')
@Controller('ad-booking')
export class AdBookingController {
  constructor(private readonly adBookingService: AdBookingService) {}

  @Get('busy-dates/:slotCode')
  getBusyDates(@Param('slotCode') slotCode: string) {
    return this.adBookingService.getBusyDates(slotCode);
  }

  @Post()
  create(
    @Body() createAdBookingDto: CreateAdBookingDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adBookingService.create(createAdBookingDto, user);
  }

  @Get()
  findAll(@userDecorator() user: UserDecoratorType) {
    return this.adBookingService.findAll(user);
  }

  @Get('admin/all')
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
  findOne(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.adBookingService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdBookingDto: UpdateAdBookingDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adBookingService.update(id, updateAdBookingDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.adBookingService.remove(id, user);
  }

  @Patch('cancel/:id')
  cancelByUser(
    @Param('id') id: string,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adBookingService.cancelByUser(id, user);
  }

  @Patch('admin/cancel/:id')
  cancelByAdmin(
    @Param('id') id: string,
    @userDecorator() admin: UserDecoratorType,
  ) {
    return this.adBookingService.cancelByAdmin(id, admin);
  }
}
