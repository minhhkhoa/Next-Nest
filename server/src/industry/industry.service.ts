import { Injectable } from '@nestjs/common';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { TranslationService } from 'src/translation/translation.service';
import { InjectModel } from '@nestjs/mongoose';
import { Industry, IndustryDocument } from './schemas/industry.schema';
import mongoose from 'mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class IndustryService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(Industry.name)
    private indusTryModel: SoftDeleteModel<IndustryDocument>,
  ) {}
  async create(createIndustryDto: CreateIndustryDto) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'industry',
        createIndustryDto,
      );

      const industry = await this.indusTryModel.create(dataLang);

      return {
        _id: industry._id,
        name: industry.name.en,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort, population } = aqp(query);

    if (query) {
      delete filter[query]; //- log filter ra để check các điều kiện nào không hợp lệ
      const searchRegex = new RegExp(query, 'i'); //- 'i' để không phân biệt hoa thường
      filter.$or = [
        { 'name.vi': { $regex: searchRegex } },
        { 'name.en': { $regex: searchRegex } },
      ];
    }

    const defaultPage = currentPage > 0 ? +currentPage : 1;
    let offset = (+defaultPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.indusTryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.indusTryModel
      .find(filter) //- nó tự động bỏ document có isDeleted: true.
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: defaultPage,
        pageSize: limit,
        totalPages: totalPages,
        totalItems: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID industry không đúng định dạng', !!id);
      }

      const industry = await this.indusTryModel.findById(id).populate({
        path: 'relatedIndustries',
        match: { isDeleted: false }, //- Chỉ lấy khi chưa bị xóa mềm
        select: 'name _id', //- Chỉ lấy name và _id
      });

      if (!industry)
        throw new BadRequestCustom('ID industry không tìm thấy', !!id);

      if (industry?.isDeleted) {
        throw new BadRequestCustom(
          'Industry này hiện đã bị xóa',
          !!industry?.isDeleted,
        );
      }

      return industry;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateIndustryDto: UpdateIndustryDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID industry không đúng định dạng', !!id);
      }

      const industry = await this.indusTryModel.findById(id);
      if (!industry)
        throw new BadRequestCustom('ID industry không tìm thấy', !!id);

      //- cần translation trước đã
      const dataTranslation = await this.translationService.translateModuleData(
        'industry',
        updateIndustryDto,
      );
      const filter = { _id: id };
      const update = { $set: dataTranslation };

      const result = await this.indusTryModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa industry', !!id);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID industry không đúng định dạng', !!id);
      }

      const industry = await this.indusTryModel.findById(id);
      if (!industry)
        throw new BadRequestCustom('ID industry không tìm thấy', !!id);

      const isDeleted = industry.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('Industry này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = this.indusTryModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa industry', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
