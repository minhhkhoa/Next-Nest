import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueAdminDto, UpdateIssueDto } from './dto/update-issue.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  PublicPermission,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { FindIssueQueryDto, DeleteManyIssueDto } from './dto/issueDto.dto';

@ApiTags('issue')
@Controller('issue')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @PublicPermission()
  @Post()
  @ResponseMessage('Gửi yêu cầu hỗ trợ/báo cáo thành công')
  @ApiOperation({ summary: 'Người dùng (Ứng viên/HR) tạo yêu cầu mới' })
  create(
    @Body() createIssueDto: CreateIssueDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.issueService.create(createIssueDto, user);
  }

  @PublicPermission()
  @Get('filter')
  @ResponseMessage('Lấy danh sách yêu cầu với lọc nâng cao thành công')
  @ApiOperation({ summary: 'Admin lấy danh sách yêu cầu (Phân trang, Filter)' })
  findAllByFilter(@Query() query: FindIssueQueryDto) {
    return this.issueService.findAllByFilter(query);
  }

  //- Người dùng xem lại lịch sử yêu cầu của chính họ
  @PublicPermission()
  @Get('me')
  @ResponseMessage('Lấy danh sách yêu cầu cá nhân thành công')
  @ApiOperation({ summary: 'Người dùng xem lại lịch sử yêu cầu của chính họ' })
  findAllByUser(
    @userDecorator() user: UserDecoratorType,
    @Query() query: FindIssueQueryDto,
  ) {
    return this.issueService.findAllByUser(user, query);
  }

  @PublicPermission()
  @Get(':id')
  @ResponseMessage('Lấy chi tiết yêu cầu thành công')
  @ApiOperation({ summary: 'Xem chi tiết yêu cầu và phản hồi từ admin' })
  findOne(@Param('id') id: string) {
    return this.issueService.findOne(id);
  }

  //- Dành cho Admin xử lý phản hồi
  @PublicPermission()
  @Patch('admin-reply')
  @ResponseMessage('Phản hồi yêu cầu thành công')
  @ApiOperation({
    summary: 'Super_Admin/Admin xử lý phê duyệt và phản hồi yêu cầu',
  })
  adminReply(
    @Body() updateAdminDto: UpdateIssueAdminDto,
    @userDecorator() admin: UserDecoratorType,
  ) {
    return this.issueService.handleAdminReply(updateAdminDto, admin);
  }

  //- Dành cho User muốn sửa thông tin khi chưa xử lý hoặc Đóng yêu cầu
  @PublicPermission()
  @Patch(':id')
  @ResponseMessage('Cập nhật yêu cầu thành công')
  @ApiOperation({ summary: 'Người dùng cập nhật nội dung yêu cầu' })
  update(
    @Param('id') id: string,
    @Body() updateIssueDto: UpdateIssueDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.issueService.update(id, updateIssueDto, user);
  }

  @PublicPermission()
  @Delete('deleteMany')
  @ResponseMessage('Xóa nhiều yêu cầu thành công')
  @ApiOperation({ summary: 'Xóa nhiều yêu cầu (Xóa mềm)' })
  removeMany(
    @Body() deleteDto: DeleteManyIssueDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.issueService.removeMany(deleteDto.ids, user);
  }

  @PublicPermission()
  @Delete(':id')
  @ResponseMessage('Xóa yêu cầu thành công')
  @ApiOperation({ summary: 'Xóa yêu cầu (Xóa mềm hoặc xóa cứng)' })
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.issueService.remove(id, user);
  }
}
