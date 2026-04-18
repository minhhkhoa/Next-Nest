import { Injectable, Logger } from '@nestjs/common';
import { CreateCateNewsDto } from './dto/create-cate-new.dto';
import { UpdateCateNewsDto } from './dto/update-cate-new.dto';
import { TranslationService } from 'src/common/translation/translation.service';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import slugify from 'slugify';
import { CateNewsRepository } from './repository/cate-news.repository';

@Injectable()
export class CateNewsService {
  private readonly logger = new Logger(CateNewsService.name);

  constructor(
    private readonly translationService: TranslationService,
    private readonly cateNewsRepository: CateNewsRepository,
  ) {}

  async create(createCateNewsDto: CreateCateNewsDto, user: UserDecoratorType) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'cateNews',
        createCateNewsDto,
      );

      const cateNews = await this.cateNewsRepository.create({
        ...dataLang,
        createdBy: {
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
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

  async findAll(traceId: string) {
    const startDB = Date.now();
    try {
      const list = await this.cateNewsRepository.findAllNotDeleted();

      const dbDuration = Date.now() - startDB;
      this.logger.log(`[${traceId}] MongoDB quét mất: ${dbDuration}ms`);

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

      const cateNews = await this.cateNewsRepository.findByIdIncludingDeleted(id);

      if (!cateNews) {
        throw new BadRequestCustom('ID cateNews không tìm thấy', !!id);
      }

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

      const cateNews = await this.cateNewsRepository.findByIdIncludingDeleted(id);
      if (!cateNews) {
        throw new BadRequestCustom('ID cateNews không tìm thấy', !!id);
      }

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
            avatar: user.avatar,
          },
        },
      };

      const result = await this.cateNewsRepository.updateMany(filter, update);

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

      const cateNews = await this.cateNewsRepository.findByIdIncludingDeleted(id);
      if (!cateNews) {
        throw new BadRequestCustom('ID cateNews không tìm thấy', !!id);
      }

      const isDeleted = cateNews.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('CateNews này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = await this.cateNewsRepository.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa cateNews', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
