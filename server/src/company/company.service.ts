import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { TranslationService } from 'src/translation/translation.service';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestCustom } from 'src/customExceptions/BadRequestCustom';
import mongoose from 'mongoose';

@Injectable()
export class CompanyService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      const dataLang = await this.translationService.translateModuleData(
        'company',
        createCompanyDto,
      );

      const company = await this.companyModel.create(dataLang);

      return {
        _id: company._id,
        name: company.name.en,
      };
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async findAll() {
    try {
      //- sau này cần bổ sung thêm có bao job cho mỗi công ty
      return this.companyModel.find({ isDeleted: false }).select('-userFollow');
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  //- còn thiếu 1 vài api nữa, nào code tới FE mình làm thêm

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID company không đúng định dạng', !!id);
      }

      const company = await this.companyModel.findById(id).populate([
        {
          path: 'industryID',
          match: { isDeleted: false },
          select: 'name _id',
        },
        // {
        //   path: 'userFollow',
        //   match: { isDeleted: false },
        //   select: 'name _id',
        // },
      ]);

      if (!company)
        throw new BadRequestCustom('ID company không tìm thấy', !!id);

      if (company?.isDeleted) {
        throw new BadRequestCustom(
          'company này hiện đã bị xóa',
          !!company?.isDeleted,
        );
      }

      return company;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID company không đúng định dạng', !!id);
      }

      const company = await this.companyModel.findById(id);
      if (!company)
        throw new BadRequestCustom('ID company không tìm thấy', !!id);

      //- cần translation trước đã
      const dataTranslation = await this.translationService.translateModuleData(
        'company',
        updateCompanyDto,
      );
      const filter = { _id: id };
      const update = { $set: dataTranslation };

      const result = await this.companyModel.updateOne(filter, update);

      if (result.modifiedCount === 0)
        throw new BadRequestCustom('Lỗi sửa company', !!id);
      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestCustom('ID company không đúng định dạng', !!id);
      }

      const company = await this.companyModel.findById(id);
      if (!company) throw new BadRequestCustom('ID company không tìm thấy', !!id);

      const isDeleted = company.isDeleted;

      if (isDeleted)
        throw new BadRequestCustom('company này đã được xóa', !!isDeleted);

      const filter = { _id: id };
      const result = this.companyModel.softDelete(filter);

      if (!result) throw new BadRequestCustom('Lỗi xóa company', !!id);

      return result;
    } catch (error) {
      throw new BadRequestCustom(error.message, !!error.message);
    }
  }
}
