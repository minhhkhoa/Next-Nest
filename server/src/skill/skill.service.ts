import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { TranslationService } from 'src/translation/translation.service';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { FindSkillQueryDto } from './dto/skillDto.dto';
import aqp from 'api-query-params';

@Injectable()
export class SkillService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(Skill.name)
    private skillModel: SoftDeleteModel<SkillDocument>,
  ) {}
  async create(createSkillDto: CreateSkillDto) {
    try {
      //- dịch sang tiếng anh đã
      const dataLang = await this.translationService.translateModuleData(
        'skill',
        createSkillDto,
      );

      const industry = await this.skillModel.create(dataLang);

      return {
        _id: industry._id,
        name: industry.name.en,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  findAll() {
    try {
      return this.skillModel.find({ isDeleted: false }).populate('industryID');
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAllByFilter(query: FindSkillQueryDto) {
    try {
      const { currentPage, pageSize, name, industryID } = query;

      const queryForAqp = { name, industryID };
      const { filter, sort } = aqp(queryForAqp);

      //- Xây dựng điều kiện lọc
      let filterConditions: any = { ...filter };

      //- Xử lý filter cho name nếu truyền lên
      if (name) {
        delete filterConditions.name;
        const searchRegex = new RegExp(name, 'i');
        filterConditions.$or = [
          { 'name.vi': { $regex: searchRegex } },
          { 'name.en': { $regex: searchRegex } },
        ];
      }

      //- Xử lý filter cho industryID nếu truyền lên
      if (industryID && industryID.length > 0) {
        filterConditions.industryID = { $in: industryID }; //- Lọc theo mảng MongoID
      }

      const defaultPage = currentPage > 0 ? +currentPage : 1;
      let offset = (+defaultPage - 1) * +pageSize;
      let defaultLimit = +pageSize ? +pageSize : 10;

      const totalItems = (await this.skillModel.find(filterConditions)).length;
      const totalPages = Math.ceil(totalItems / defaultLimit);

      // delete filterConditions.industryID;

      const result = await this.skillModel
        .find(filterConditions)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate({
          path: 'industryID',
          select: '_id name parentId', // chỉ lấy những field cần
          // Nếu muốn populate tiếp parentId thành object (ngành cha)
          // populate: {
          //   path: 'parentId',
          //   select: '_id name'
          // }
        })
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
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID skill không đúng định dạng', !!id);
      }

      const skill = await this.skillModel.findById(id).populate({
        path: 'industryID',
        match: { isDeleted: false }, //- Chỉ lấy khi chưa bị xóa mềm
        select: 'name _id', //- Chỉ lấy name và _id
      });

      if (!skill) throw new BadRequestCustom('ID skill không tìm thấy', !!id);

      if (skill?.isDeleted) {
        throw new BadRequestCustom(
          'skill này hiện đã bị xóa',
          !!skill?.isDeleted,
        );
      }

      return skill;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateSkillDto: UpdateSkillDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID skill không đúng định dạng', !!id);
      }

      const skill = await this.skillModel.findById(id);
      if (!skill) throw new BadRequestCustom('ID skill không tìm thấy', !!id);

      //- cần translation trước đã
      const dataTranslation = await this.translationService.translateModuleData(
        'skill',
        updateSkillDto,
      );
      const filter = { _id: id };
      const update = { $set: dataTranslation };

      const result = await this.skillModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa skill', !!id);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID skill không đúng định dạng', !!id);
      }

      const skill = await this.skillModel.findById(id);
      if (!skill) throw new BadRequestCustom('ID skill không tìm thấy', !!id);

      const isDeleted = skill.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('Skill này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = this.skillModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa skill', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
