import { Prop } from '@nestjs/mongoose';

export interface UserDecoratorType {
  email: string;
  id: string;
  idProvider?: string;
  name: string;
  roleID: Array<string>;
  companyID: Array<string>;
  avatar: string;
}

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
