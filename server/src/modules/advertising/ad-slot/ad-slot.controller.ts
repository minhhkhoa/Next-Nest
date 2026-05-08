import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Public,
  ResponseMessage,
  userDecorator,
} from 'src/common/decorator/customize';
import { UserDecoratorType } from 'src/utils/typeSchemas';
import { AdSlotService } from './ad-slot.service';
import { CreateAdSlotDto } from './dto/create-ad-slot.dto';
import { FindAdSlotQueryDto } from './dto/find-ad-slot-query.dto';
import { UpdateAdSlotDto } from './dto/update-ad-slot.dto';

@ApiTags('ad-slot')
@Controller('ad-slot')
export class AdSlotController {
  constructor(private readonly adSlotService: AdSlotService) {}

  //- Tạo mới slot quảng cáo (Chỉ super_admin)
  @ResponseMessage('Tạo slot quảng cáo thành công')
  @ApiOperation({ summary: 'Super_Admin tạo mới vị trí quảng cáo' })
  @Post()
  create(
    @Body() dto: CreateAdSlotDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adSlotService.create(dto, user);
  }

  //- Lấy danh sách slot công khai (không cần login, chỉ lấy active)
  @Public()
  @ResponseMessage('Lấy danh sách slot công khai thành công')
  @ApiOperation({ summary: 'Lấy danh sách slot đang active (Public)' })
  @Get('public')
  findAllPublic() {
    return this.adSlotService.findAllPublic();
  }

  // @Public()
  // @ResponseMessage('Lấy chi tiết slot quảng cáo thành công')
  // @ApiOperation({ summary: 'Lấy chi tiết slot theo code' })
  // @Get('code/:code')
  // findByCode(@Param('code') code: string) {
  //   return this.adSlotService.findByCode(code);
  // }

  //- Lấy danh sách slot có lọc/phân trang (Admin)
  @ResponseMessage('Lấy danh sách slot quảng cáo thành công')
  @ApiOperation({ summary: 'Admin lấy danh sách slot có lọc và phân trang' })
  @Get()
  findAll(@Query() query: FindAdSlotQueryDto) {
    return this.adSlotService.findAll(query);
  }

  //- Khôi phục slot đã xóa mềm (Chỉ super_admin)
  @ResponseMessage('Khôi phục slot quảng cáo thành công')
  @ApiOperation({ summary: 'Super_Admin khôi phục slot đã xóa mềm' })
  @Patch('restore/:id')
  restore(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.adSlotService.restore(id, user);
  }

  //- Bật/tắt trạng thái active của slot
  @ResponseMessage('Cập nhật trạng thái slot thành công')
  @ApiOperation({ summary: 'Super_Admin bật/tắt slot quảng cáo' })
  @Patch(':id/toggle-active')
  toggleActive(
    @Param('id') id: string,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adSlotService.toggleActive(id, user);
  }

  //- Lấy chi tiết một slot theo ID
  @ResponseMessage('Lấy chi tiết slot quảng cáo thành công')
  @ApiOperation({ summary: 'Lấy chi tiết slot theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adSlotService.findOne(id);
  }

  //- Cập nhật thông tin slot (Chỉ super_admin)
  @ResponseMessage('Cập nhật slot quảng cáo thành công')
  @ApiOperation({ summary: 'Super_Admin cập nhật thông tin slot' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdSlotDto,
    @userDecorator() user: UserDecoratorType,
  ) {
    return this.adSlotService.update(id, dto, user);
  }

  //- Xóa mềm slot (Chỉ super_admin)
  @ResponseMessage('Xóa slot quảng cáo thành công')
  @ApiOperation({ summary: 'Super_Admin xóa mềm slot quảng cáo' })
  @Delete(':id')
  remove(@Param('id') id: string, @userDecorator() user: UserDecoratorType) {
    return this.adSlotService.remove(id, user);
  }
}
