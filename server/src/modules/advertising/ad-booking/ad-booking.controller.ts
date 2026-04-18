import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdBookingService } from './ad-booking.service';
import { CreateAdBookingDto } from './dto/create-ad-booking.dto';
import { UpdateAdBookingDto } from './dto/update-ad-booking.dto';

@ApiTags('ad-booking')
@Controller('ad-booking')
export class AdBookingController {
  constructor(private readonly adBookingService: AdBookingService) {}

  @Post()
  create(@Body() createAdBookingDto: CreateAdBookingDto) {
    return this.adBookingService.create(createAdBookingDto);
  }

  @Get()
  findAll() {
    return this.adBookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adBookingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdBookingDto: UpdateAdBookingDto,
  ) {
    return this.adBookingService.update(id, updateAdBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adBookingService.remove(id);
  }
}
