import { Injectable } from '@nestjs/common';
import { CreateCateNewsDto } from './dto/create-cate-new.dto';
import { UpdateCateNewsDto } from './dto/update-cate-new.dto';
import { TranslationService } from 'src/translation/translation.service';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CateNews, CateNewsDocument } from './schemas/cate-new.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';

@Injectable()
export class CateNewsService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(CateNews.name)
    private cateNewsModel: SoftDeleteModel<CateNewsDocument>,
  ) {}

  async create(createCateNewsDto: CreateCateNewsDto) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'cateNews',
        createCateNewsDto,
      );

      const cateNews = await this.cateNewsModel.create(dataLang);

      return {
        _id: cateNews._id,
        name: cateNews.name.en,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  findAll() {
    try {
      return this.cateNewsModel.find({ isDeleted: false });
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID CateNews không đúng định dạng', !!id);
      }

      const cateNews = await this.cateNewsModel.findById(id);

      if (!cateNews)
        throw new BadRequestCustom('ID cateNews không tìm thấy', !!id);

      if (cateNews?.isDeleted) {
        throw new BadRequestCustom(
          'skill này hiện đã bị xóa',
          !!cateNews?.isDeleted,
        );
      }

      return cateNews;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  update(id: number, updateCateNewDto: UpdateCateNewsDto) {
    return `This action updates a #${id} cateNew`;
  }

  remove(id: number) {
    return `This action removes a #${id} cateNew`;
  }
}
