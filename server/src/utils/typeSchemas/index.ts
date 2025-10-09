import { Prop } from '@nestjs/mongoose';

export enum NewsStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class MultiLang {
  @Prop() vi: string;
  @Prop() en: string;
}
