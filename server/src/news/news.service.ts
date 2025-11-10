import { Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { TranslationService } from 'src/translation/translation.service';
import { InjectModel } from '@nestjs/mongoose';
import { News, NewsDocument } from './schemas/news.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { FindNewsQueryDto } from './dto/newsDto-dto';
import aqp from 'api-query-params';
import { UserDecoratorType } from 'src/utils/typeSchemas';

@Injectable()
export class NewsService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(News.name)
    private newsModel: SoftDeleteModel<NewsDocument>,
  ) {}

  async create(createNewsDto: CreateNewsDto, user: UserDecoratorType) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'news',
        createNewsDto,
      );

      const news = await this.newsModel.create({
        ...dataLang,
        createdBy: {
          _id: user.id,
          name: user.name,
          email: user.email,
        },
      });

      return {
        _id: news._id,
        title: news.title.en,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll() {
    try {
      return this.newsModel.find({ isDeleted: false }).populate({
        path: 'cateNewsID',
        match: { isDeleted: false },
        select: 'name _id summary',
      });
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAllByFilter(query: FindNewsQueryDto) {
    const { currentPage, pageSize, title, cateNewsID } = query;

    const queryForAqp = { title, cateNewsID };
    const { filter, sort, population } = aqp(queryForAqp);

    //- Xây dựng điều kiện lọc
    let filterConditions: any = { ...filter };

    //- Xử lý filter cho title nếu truyền lên
    if (title) {
      delete filterConditions.title;
      const searchRegex = new RegExp(title, 'i');
      filterConditions.$or = [
        { 'title.vi': { $regex: searchRegex } },
        { 'title.en': { $regex: searchRegex } },
      ];
    }

    //- Xử lý filter cho cateNewsID nếu truyền lên
    if (cateNewsID) {
      filterConditions.cateNewsID = { $in: cateNewsID }; //- Lọc theo mảng MongoID
    }

    const defaultPage = currentPage > 0 ? +currentPage : 1;
    let offset = (+defaultPage - 1) * +pageSize;
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.newsModel.find(filterConditions)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.newsModel
      .find(filterConditions)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: defaultPage,
        pageSize: pageSize,
        totalPages: totalPages,
        totalItems: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID news không đúng định dạng', !!id);
      }

      const news = await this.newsModel.findById(id).populate({
        path: 'cateNewsID',
        match: { isDeleted: false },
        select: 'name _id summary',
      });

      if (!news) throw new BadRequestCustom('ID news không tìm thấy', !!id);

      if (news?.isDeleted) {
        throw new BadRequestCustom(
          'news này hiện đã bị xóa',
          !!news?.isDeleted,
        );
      }

      return news;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(
    id: string,
    updateNewsDto: UpdateNewsDto,
    user: UserDecoratorType,
  ) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID news không đúng định dạng', !!id);
      }

      const news = await this.newsModel.findById(id);
      if (!news) throw new BadRequestCustom('ID news không tìm thấy', !!id);

      //- cần translation trước đã
      const dataTranslation = await this.translationService.translateModuleData(
        'news',
        updateNewsDto,
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

      const result = await this.newsModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa news', !!id);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID news không đúng định dạng', !!id);
      }

      const news = await this.newsModel.findById(id);
      if (!news) throw new BadRequestCustom('ID news không tìm thấy', !!id);

      const isDeleted = news.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('news này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = this.newsModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa news', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
