import { Injectable } from '@nestjs/common';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { TranslationService } from 'src/translation/translation.service';
import { InjectModel } from '@nestjs/mongoose';
import { Industry } from './schemas/industry.schema';
import { Model } from 'mongoose';

@Injectable()
export class IndustryService {
  constructor(
    private readonly translationService: TranslationService,
    @InjectModel(Industry.name) private indusTryModel: Model<Industry>,
  ) {}
  async create(createIndustryDto: CreateIndustryDto) {
    const dataLang = await this.translationService.translateModuleData(
      'industry',
      createIndustryDto,
    );

    const industry = await this.indusTryModel.create(dataLang);

    return {
      _id: industry._id,
      name: industry.name.en,
    };
  }

  findAll() {
    return `This action returns all industry`;
  }

  findOne(id: number) {
    return `This action returns a #${id} industry`;
  }

  update(id: number, updateIndustryDto: UpdateIndustryDto) {
    return `This action updates a #${id} industry`;
  }

  remove(id: number) {
    return `This action removes a #${id} industry`;
  }
}
