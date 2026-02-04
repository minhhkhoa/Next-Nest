import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { TranslationService } from 'src/common/translation/translation.service';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/common/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';
import { FindSkillQueryDto } from './dto/skillDto.dto';
import { IndustryService } from '../industry/industry.service';

@Injectable()
export class SkillService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(Skill.name)
    private skillModel: SoftDeleteModel<SkillDocument>,
    private industryService: IndustryService,
  ) {}

  async create(createSkillDto: CreateSkillDto) {
    try {
      //- dịch sang tiếng anh đã
      const dataLang = await this.translationService.translateModuleData(
        'skill',
        createSkillDto,
      );

      const skill = await this.skillModel.create(dataLang);

      return {
        _id: skill._id,
        name: skill.name.en,
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
      const { currentPage, pageSize, name, industryIDs } = query;
      // Khởi tạo filter cơ bản
      const filterConditions: any = { isDeleted: false };

      // 1. Xử lý filter name
      if (name) {
        const searchRegex = new RegExp(name, 'i');
        filterConditions.$or = [
          { 'name.vi': { $regex: searchRegex } },
          { 'name.en': { $regex: searchRegex } },
        ];
      }

      //- Logic "Cha truyền con nối" - CỰC KỲ QUAN TRỌNG
      if (industryIDs && industryIDs.length > 0) {
        const targetIndustryIds =
          await this.industryService.getAllIndustryIdsInSameFamily(industryIDs);

        filterConditions.industryID = { $in: targetIndustryIds };
      } else if (industryIDs === undefined || industryIDs.length === 0) {
        // Nếu Khoa muốn: Khi không chọn ngành nào thì KHÔNG hiện skill nào,
        // hoặc chỉ hiện skill không thuộc ngành nào, hãy xử lý ở đây.
        // Hiện tại code của Khoa đang là: Không gửi industryIDs thì hiện TẤT CẢ skill (vì isDeleted: false).
      }

      //- Phân trang và Query
      const defaultPage = +currentPage > 0 ? +currentPage : 1;
      const defaultLimit = +pageSize > 0 ? +pageSize : 10;
      const offset = (defaultPage - 1) * defaultLimit;

      const [totalItems, result] = await Promise.all([
        this.skillModel.countDocuments(filterConditions),
        this.skillModel
          .find(filterConditions)
          .skip(offset)
          .limit(defaultLimit)
          .sort('-createdAt')
          .populate({ path: 'industryID', select: '_id name parentId' })
          .lean(),
      ]);

      const totalPages = Math.ceil(totalItems / defaultLimit);

      return {
        meta: {
          current: defaultPage,
          pageSize: defaultLimit,
          totalPages,
          totalItems,
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
