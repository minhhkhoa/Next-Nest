import { Injectable } from '@nestjs/common';
import { CreateAdPaymentDto } from './dto/create-ad-payment.dto';
import { UpdateAdPaymentDto } from './dto/update-ad-payment.dto';

@Injectable()
export class AdPaymentService {
  create(createAdPaymentDto: CreateAdPaymentDto) {
    return 'This action adds a new ad payment';
  }

  findAll() {
    return 'This action returns all ad payments';
  }

  findOne(id: string) {
    return `This action returns a #${id} ad payment`;
  }

  update(id: string, updateAdPaymentDto: UpdateAdPaymentDto) {
    return `This action updates a #${id} ad payment`;
  }

  remove(id: string) {
    return `This action removes a #${id} ad payment`;
  }
}
