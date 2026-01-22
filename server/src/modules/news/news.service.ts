import { Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { TranslationService } from 'src/common/translation/translation.service';
import { InjectModel } from '@nestjs/mongoose';
import { News, NewsDocument } from './schemas/news.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { FindNewsQueryDto } from './dto/newsDto-dto';
import aqp from 'api-query-params';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { CateNewsService } from 'src/modules/cate-news/cate-news.service';
import slugify from 'slugify';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from 'src/common/constants/notification-type.enum';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NewsService {
  constructor(
    private readonly translationService: TranslationService,
    private readonly cateNewsService: CateNewsService,
    private eventEmitter: EventEmitter2,
    private userService: UserService,
    private configService: ConfigService,
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

      //- start ping event
      //- bắn thông báo cho super_admin
      const textRole = this.configService.get<string>('role_super_admin');
      const userAdmin = await this.userService.getUserByRoleSuperAdmin(
        textRole!,
      );

      // Bắn sự kiện - Xong việc của News, không quan tâm notify xử lý thế nào
      this.eventEmitter.emit(NotificationType.NEWS_CREATED, {
        receiverId: userAdmin?.id, // Lấy từ cấu hình hoặc DB
        senderId: user.id,
        title: 'Yêu cầu duyệt bài viết mới',
        content: `Người dùng ${user.name} vừa tạo bài viết "${news.title.vi}", vui lòng phê duyệt.`,
        type: NotificationType.NEWS_CREATED,
        metadata: {
          module: 'NEWS',
          action: 'CREATE',
          resourceId: news._id,
        },
      });
      //- nó sẽ được gửi tới NotificationListener
      //- end ping event

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
      const newsList = await this.newsModel
        .find({ isDeleted: false })
        .populate({
          path: 'cateNewsID',
          match: { isDeleted: false },
          select: 'name _id summary',
        })
        .lean(); //- lean: trả về plain object thay vì mongoose document

      return newsList.map((news) => {
        const slugNews = {
          vi: slugify(news.title.vi, {
            lower: true,
            strict: true,
            locale: 'vi',
          }),
          en: slugify(news.title.en, {
            lower: true,
            strict: true,
          }),
        };

        return { ...news, slugNews };
      });
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAllNewsDashboard() {
    try {
      //- 1. Lấy bài viết nổi bật lấy bài viết mới nhất của 5 danh mục
      const listCateNews = (await this.cateNewsService.findAll()).slice(0, 4); //- trong fillAll da them slug cho cateNews roi
      const listCateNewsIDs = listCateNews.map((cate) => cate._id);

      const listNews = await this.newsModel
        .find({
          cateNewsID: { $in: listCateNewsIDs },
          isDeleted: false,
          status: 'active',
        })
        .sort({ createdAt: -1 })
        .populate({
          path: 'cateNewsID',
          match: { isDeleted: false },
          select: 'name _id summary',
        })
        .select('_id title image summary status createdBy createdAt');

      const listNewsWithSlug = listNews
        .map((news) => {
          const cateNews = listCateNews.find((cate) =>
            news.cateNewsID.some((cateID) => cateID._id.equals(cate._id)),
          );
          const slugCateNews = cateNews ? cateNews.slug : '';

          const slugNews = {
            vi: slugify(news.title.vi, {
              lower: true,
              strict: true,
              locale: 'vi',
            }),
            en: slugify(news.title.en, { lower: true, strict: true }),
          };
          return { ...news.toObject(), slugNews, slugCateNews };
        })
        .slice(0, 4);

      //- 2.Mỗi danh mục lấy ra 5 bài viết mới nhất
      const result = await Promise.all(
        //- Khi dùng map với async function, kết quả sẽ là một mảng các Promise nên cần dùng Promise.all để chờ tất cả hoàn thành
        listCateNews.map(async (cateNews) => {
          const idCate = cateNews._id;
          const nameCate = {
            title: cateNews.name,
            vi: slugify(cateNews.name.vi, {
              lower: true,
              strict: true,
              locale: 'vi',
            }),
            en: slugify(cateNews.name.en, { lower: true, strict: true }),
          };

          const getNewsByCate = await this.newsModel
            .find({
              cateNewsID: idCate,
              isDeleted: false,
              status: 'active',
            })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
              path: 'cateNewsID',
              match: { isDeleted: false },
              select: 'name _id summary',
            })
            .select('_id title image summary status createdBy createdAt');

          const getNewsByCateWithSlug = getNewsByCate.map((news) => {
            const slugNews = {
              vi: slugify(news.title.vi, {
                lower: true,
                strict: true,
                locale: 'vi',
              }),
              en: slugify(news.title.en, { lower: true, strict: true }),
            };
            return { ...news.toObject(), slugNews };
          });

          return {
            nameCate,
            listNews: getNewsByCateWithSlug,
          };
        }),
      );

      return {
        NewsHot: listNewsWithSlug,
        result,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAllByFilter(query: FindNewsQueryDto) {
    try {
      const { currentPage, pageSize, title, cateNewsID, status } = query;

      const queryForAqp = { title, cateNewsID, status };
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

      //- Xử lý filter cho status nếu truyền lên
      if (status) {
        filterConditions.status = status;
      }

      const defaultPage = currentPage > 0 ? +currentPage : 1;
      let offset = (+defaultPage - 1) * +pageSize;
      let defaultLimit = +pageSize ? +pageSize : 10;

      const totalItems = (await this.newsModel.find(filterConditions)).length;
      const totalPages = Math.ceil(totalItems / defaultLimit);

      //- sort
      const defaultSort = Object.keys(sort || {}).length
        ? sort
        : { createdAt: -1 };

      let result = await this.newsModel
        .find(filterConditions)
        .skip(offset)
        .limit(defaultLimit)
        .sort(defaultSort as any)
        .populate(population)
        .exec();

      //- thêm slug cho từng news
      result = result.map((news) => {
        const slugNews = {
          vi: slugify(news.title.vi, {
            lower: true,
            strict: true,
            locale: 'vi',
          }),
          en: slugify(news.title.en, { lower: true, strict: true }),
        };
        return { ...news.toObject(), slugNews };
      });

      return {
        meta: {
          current: defaultPage,
          pageSize: pageSize,
          totalPages: totalPages,
          totalItems: totalItems,
        },
        result,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
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

      //- thêm slug cho news
      const slugNews = {
        vi: slugify(news.title.vi, {
          lower: true,
          strict: true,
          locale: 'vi',
        }),
        en: slugify(news.title.en, { lower: true, strict: true }),
      };

      return { ...news.toObject(), slugNews };
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

  async remove(id: string, user: UserDecoratorType) {
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

      //- delete by
      await this.newsModel.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            deletedBy: {
              _id: user.id,
              name: user.name,
              email: user.email,
            },
          },
        },
      );

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- trộn mảng
  shuffle(array: any[]) {
    let currentIndex = array.length,
      randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }
}
