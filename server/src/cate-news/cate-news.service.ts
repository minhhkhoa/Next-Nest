import { Injectable } from '@nestjs/common';
import { CreateCateNewsDto } from './dto/create-cate-new.dto';
import { UpdateCateNewsDto } from './dto/update-cate-new.dto';
import { TranslationService } from 'src/translation/translation.service';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CateNews, CateNewsDocument } from './schemas/cate-new.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import slugify from 'slugify';

@Injectable()
export class CateNewsService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(CateNews.name)
    private cateNewsModel: SoftDeleteModel<CateNewsDocument>,
  ) {}

  async create(createCateNewsDto: CreateCateNewsDto, user: UserDecoratorType) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'cateNews',
        createCateNewsDto,
      );

      const cateNews = await this.cateNewsModel.create({
        ...dataLang,
        createdBy: {
          _id: user.id,
          name: user.name,
          email: user.email,
        },
      });

      return {
        _id: cateNews._id,
        name: cateNews.name.en,
        createdAt: cateNews.createdAt,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll() {
    try {
      const list = await this.cateNewsModel.find({ isDeleted: false }).lean(); //- lean để chuyển về obj thường

      return list.map((item) => ({
        ...item,
        slug: {
          vi: slugify(item.name.vi, {
            lower: true,
            strict: true,
            locale: 'vi',
          }),
          en: slugify(item.name.en, { lower: true, strict: true }),
        },
      }));
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

  async update(
    id: string,
    updateCateNewDto: UpdateCateNewsDto,
    user: UserDecoratorType,
  ) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID CateNews không đúng định dạng', !!id);
      }

      const cateNews = await this.cateNewsModel.findById(id);
      if (!cateNews)
        throw new BadRequestCustom('ID cateNews không tìm thấy', !!id);

      //- cần translation trước đã
      const dataTranslation = await this.translationService.translateModuleData(
        'cateNews',
        updateCateNewDto,
      );
      const filter = { _id: id };
      const update = {
        $set: {
          ...dataTranslation,
          updatedBy: {
            _id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      };

      const result = await this.cateNewsModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa cateNews', !!id);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID cateNews không đúng định dạng', !!id);
      }

      const cateNews = await this.cateNewsModel.findById(id);
      if (!cateNews)
        throw new BadRequestCustom('ID cateNews không tìm thấy', !!id);

      const isDeleted = cateNews.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('CateNews này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = this.cateNewsModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa cateNews', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
