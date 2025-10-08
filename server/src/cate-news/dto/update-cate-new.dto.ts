import { PartialType } from '@nestjs/swagger';
import { CreateCateNewsDto } from './create-cate-new.dto';

export class UpdateCateNewsDto extends PartialType(CreateCateNewsDto) {}
