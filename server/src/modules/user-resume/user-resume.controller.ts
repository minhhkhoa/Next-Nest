import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserResumeService } from './user-resume.service';
import { CreateUserResumeDto } from './dto/create-user-resume.dto';
import { UpdateUserResumeDto } from './dto/update-user-resume.dto';

@Controller('user-resume')
export class UserResumeController {
  constructor(private readonly userResumeService: UserResumeService) {}

  @Post()
  create(@Body() createUserResumeDto: CreateUserResumeDto) {
    return this.userResumeService.create(createUserResumeDto);
  }

  @Get()
  findAll() {
    return this.userResumeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userResumeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserResumeDto: UpdateUserResumeDto) {
    return this.userResumeService.update(+id, updateUserResumeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userResumeService.remove(+id);
  }
}
