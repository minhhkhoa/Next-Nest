import { Injectable } from '@nestjs/common';
import { CreateAdSlotDto } from './dto/create-ad-slot.dto';
import { UpdateAdSlotDto } from './dto/update-ad-slot.dto';

@Injectable()
export class AdSlotService {
  create(createAdSlotDto: CreateAdSlotDto) {
    return 'This action adds a new ad slot';
  }

  findAll() {
    return 'This action returns all ad slots';
  }

  findOne(id: string) {
    return `This action returns a #${id} ad slot`;
  }

  update(id: string, updateAdSlotDto: UpdateAdSlotDto) {
    return `This action updates a #${id} ad slot`;
  }

  remove(id: string) {
    return `This action removes a #${id} ad slot`;
  }
}
