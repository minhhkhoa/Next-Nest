import { Prop } from '@nestjs/mongoose';

export enum NewsStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class MultiLang {
  @Prop() vi: string;
  @Prop() en: string;
}

export type ResUserFB = {
  provider: string;
  providerId: string;
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  avatar: string | undefined;
};
