import { Injectable } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { IS_BUSINESS_MODULE } from 'src/common/decorator/customize';

//- lấy ra các module đang đánh dấu

@Injectable()
export class DiscoveryService {
  constructor(
    // Đây là module container quản lý toàn bộ vòng đời của app
    private readonly modulesContainer: ModulesContainer,
    // Reflector dùng để đọc metadata từ decorator bạn đã gắn
    private readonly reflector: Reflector,
  ) {}

  getBusinessModules(): string[] {
    const businessModules: string[] = [];

    // Duyệt qua tất cả instance của các module đã được nạp
    this.modulesContainer.forEach((moduleInstance) => {
      const { metatype } = moduleInstance;

      if (!metatype) return;

      // Tìm decorator @BusinessModule() trên class Module
      const isBusiness = this.reflector.get<boolean>(
        IS_BUSINESS_MODULE,
        metatype,
      );

      if (isBusiness) {
        businessModules.push(metatype.name);
      }
    });

    return businessModules.sort();
  }
}
