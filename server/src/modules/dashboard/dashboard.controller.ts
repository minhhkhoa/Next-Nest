import { Controller, Get, Query, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicPermission, ResponseMessage, userDecorator } from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly configService: ConfigService,
  ) {}

  @Get('admin/stats')
  @PublicPermission()
  @ResponseMessage('Lấy thống kê dashboard admin thành công')
  @ApiOperation({ summary: 'Lấy dữ liệu thống kê dashboard cho admin' })
  async getAdminStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @userDecorator() user: UserDecoratorType,
  ) {
    //- kiểm tra quyền truy cập: chỉ cho phép super_admin hoặc system_admin
    const superAdminRole = this.configService.get<string>('role_super_admin') || 'SUPER_ADMIN';
    const systemAdminRole = this.configService.get<string>('role_system_admin') || 'SYSTEM_ADMIN';

    if (user.roleCodeName !== superAdminRole && user.roleCodeName !== systemAdminRole) {
      throw new ForbiddenException('Bạn không có quyền truy cập dữ liệu này!');
    }

    return this.dashboardService.getAdminStats(startDate, endDate);
  }

  @Get('recruiter/stats')
  @PublicPermission()
  @ResponseMessage('Lấy thống kê dashboard recruiter thành công')
  @ApiOperation({ summary: 'Lấy dữ liệu thống kê dashboard cho nhà tuyển dụng' })
  async getRecruiterStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @userDecorator() user: UserDecoratorType,
  ) {
    //- kiểm tra vai trò người dùng
    const recruiterRole = this.configService.get<string>('role_recruiter') || 'RECRUITER';
    const recruiterAdminRole = this.configService.get<string>('role_recruiter_admin') || 'RECRUITER_ADMIN';

    if (user.roleCodeName !== recruiterRole && user.roleCodeName !== recruiterAdminRole) {
      throw new ForbiddenException('Bạn không có quyền truy cập dữ liệu này!');
    }

    //- lấy company id từ thông tin nhà tuyển dụng
    const companyID = user.employerInfo?.companyID;
    if (!companyID) {
      throw new ForbiddenException('Tài khoản của bạn chưa được liên kết với doanh nghiệp!');
    }

    return this.dashboardService.getRecruiterStats(companyID.toString(), startDate, endDate);
  }
}
