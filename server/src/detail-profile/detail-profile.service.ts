import { Injectable } from '@nestjs/common';
import { CreateDetailProfileDto } from './dto/create-detail-profile.dto';
import { UpdateDetailProfileDto } from './dto/update-detail-profile.dto';

@Injectable()
export class DetailProfileService {
  create(createDetailProfileDto: CreateDetailProfileDto) {
    return 'This action adds a new detailProfile';
  }

  findAll() {
    return `This action returns all detailProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} detailProfile`;
  }

  update(id: number, updateDetailProfileDto: UpdateDetailProfileDto) {
    return `This action updates a #${id} detailProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} detailProfile`;
  }
}
