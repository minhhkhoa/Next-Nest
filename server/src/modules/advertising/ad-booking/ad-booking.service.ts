import { Injectable } from '@nestjs/common';
import { CreateAdBookingDto } from './dto/create-ad-booking.dto';
import { UpdateAdBookingDto } from './dto/update-ad-booking.dto';

@Injectable()
export class AdBookingService {
  create(createAdBookingDto: CreateAdBookingDto) {
    return 'This action adds a new ad booking';
  }

  findAll() {
    return 'This action returns all ad bookings';
  }

  findOne(id: string) {
    return `This action returns a #${id} ad booking`;
  }

  update(id: string, updateAdBookingDto: UpdateAdBookingDto) {
    return `This action updates a #${id} ad booking`;
  }

  remove(id: string) {
    return `This action removes a #${id} ad booking`;
  }
}
