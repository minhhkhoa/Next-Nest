import { forwardRef, Module } from '@nestjs/common';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Issue, IssueSchema } from './schemas/issue.schema';
import { TranslationModule } from 'src/common/translation/translation.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TranslationModule,
    MailModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Issue.name, schema: IssueSchema }]),
  ],
  controllers: [IssueController],
  providers: [IssueService],
  exports: [IssueService],
})
export class IssueModule {}
