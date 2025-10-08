import { PartialType } from '@nestjs/swagger';
import { CreateCateNewDto } from './create-cate-new.dto';

export class UpdateCateNewDto extends PartialType(CreateCateNewDto) {}
