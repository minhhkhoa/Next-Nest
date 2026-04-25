import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdPaymentService } from './ad-payment.service';
import { CreateAdPaymentDto } from './dto/create-ad-payment.dto';
import { UpdateAdPaymentDto } from './dto/update-ad-payment.dto';
import { Public } from 'src/common/decorator/customize';
import { SePayWebhookDto } from './dto/sepay-webhook.dto';

@ApiTags('ad-payment')
@Controller('ad-payment')
export class AdPaymentController {
  constructor(private readonly adPaymentService: AdPaymentService) {}

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Body() payload: SePayWebhookDto,
    @Headers('authorization') authHeader: string,
  ) {
    return this.adPaymentService.handleSePayWebhook(payload, authHeader);
  }

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
