import { PartialType } from '@nestjs/swagger';
import { CreateAdBookingDto } from './create-ad-booking.dto';

export class UpdateAdBookingDto extends PartialType(CreateAdBookingDto) {}
