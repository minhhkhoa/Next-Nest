import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
}
