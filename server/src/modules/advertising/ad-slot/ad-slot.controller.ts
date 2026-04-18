import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdSlotService } from './ad-slot.service';
import { CreateAdSlotDto } from './dto/create-ad-slot.dto';
import { UpdateAdSlotDto } from './dto/update-ad-slot.dto';

@ApiTags('ad-slot')
@Controller('ad-slot')
export class AdSlotController {
  constructor(private readonly adSlotService: AdSlotService) {}

  @Post()
  create(@Body() createAdSlotDto: CreateAdSlotDto) {
    return this.adSlotService.create(createAdSlotDto);
  }

  @Get()
  findAll() {
    return this.adSlotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adSlotService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdSlotDto: UpdateAdSlotDto) {
    return this.adSlotService.update(id, updateAdSlotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adSlotService.remove(id);
  }
}
