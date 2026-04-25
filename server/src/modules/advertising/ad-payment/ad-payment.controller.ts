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
import { AdPaymentService } from './ad-payment.service';
import { CreateAdPaymentDto } from './dto/create-ad-payment.dto';
import { UpdateAdPaymentDto } from './dto/update-ad-payment.dto';

@ApiTags('ad-payment')
@Controller('ad-payment')
export class AdPaymentController {
  constructor(private readonly adPaymentService: AdPaymentService) {}

  @Post()
  create(@Body() createAdPaymentDto: CreateAdPaymentDto) {
    return this.adPaymentService.create(createAdPaymentDto);
  }

  @Get()
  findAll() {
    return this.adPaymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adPaymentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdPaymentDto: UpdateAdPaymentDto,
  ) {
    return this.adPaymentService.update(id, updateAdPaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adPaymentService.remove(id);
  }
}
