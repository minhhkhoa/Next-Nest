import { PartialType } from '@nestjs/swagger';
import { CreateDetailProfileDto } from './create-detail-profile.dto';

export class UpdateDetailProfileDto extends PartialType(CreateDetailProfileDto) {}
