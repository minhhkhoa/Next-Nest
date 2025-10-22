import { Prop } from '@nestjs/mongoose';

export enum NewsStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum Gender {
  Boy = 'Nam',
  Girl = 'Nữ',
  Other = 'Khác',
}

export class MultiLang {
  @Prop() vi: string;
  @Prop() en: string;
}
