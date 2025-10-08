import { Injectable } from '@nestjs/common';
import { CreateCateNewsDto } from './dto/create-cate-new.dto';
import { UpdateCateNewsDto } from './dto/update-cate-new.dto';


@Injectable()
export class CateNewsService {
  create(createCateNewsDto: CreateCateNewsDto) {
    return 'This action adds a new cateNew';
  }

  findAll() {
    return `This action returns all cateNews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cateNew`;
  }

  update(id: number, updateCateNewDto: UpdateCateNewsDto) {
    return `This action updates a #${id} cateNew`;
  }

  remove(id: number) {
    return `This action removes a #${id} cateNew`;
  }
}
