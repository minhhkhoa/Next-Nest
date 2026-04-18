import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Skill, SkillSchema } from './schemas/skill.schema';
import { BusinessModule } from 'src/common/decorator/customize';
import { IndustryModule } from '../industry/industry.module';
import { SkillRepository } from './repository/skill.repository';

@BusinessModule()
@Module({
  imports: [
    TranslationModule,
    IndustryModule,
    MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }]),
  ],
  controllers: [SkillController],
  providers: [SkillService, SkillRepository],
})
export class SkillModule {}
