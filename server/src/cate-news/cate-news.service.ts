import { Injectable } from '@nestjs/common';
import { CreateCateNewDto } from './dto/create-cate-new.dto';
import { UpdateCateNewDto } from './dto/update-cate-new.dto';

@Injectable()
export class CateNewsService {
  create(createCateNewDto: CreateCateNewDto) {
    return 'This action adds a new cateNew';
  }

  findAll() {
    return `This action returns all cateNews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cateNew`;
  }

  update(id: number, updateCateNewDto: UpdateCateNewDto) {
    return `This action updates a #${id} cateNew`;
  }

  remove(id: number) {
    return `This action removes a #${id} cateNew`;
  }
}
