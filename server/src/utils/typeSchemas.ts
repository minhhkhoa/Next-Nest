import { Prop } from '@nestjs/mongoose';

export interface UserDecoratorType {
  email: string;
  id: string;
  idProvider?: string;
  name: string;
  roleID: Array<string>;
  employerInfo?: {
    companyID: string;
    userStatus: string;
    isOwner: boolean;
  };
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

export enum typeMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export class MultiLang {
  @Prop() vi: string;
  @Prop() en: string;
}
