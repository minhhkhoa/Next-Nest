import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { BOOKMARK_TYPE } from 'src/common/constants';

export class CreateBookmarkDto {
  @ApiProperty({ example: '6752cc5331e2d424074213d2' })
  @IsNotEmpty()
  @IsMongoId()
  itemId: string;

  @ApiProperty({ example: 'JOB' })
  @IsNotEmpty()
  @IsString()
  @IsIn(BOOKMARK_TYPE.map((opt) => opt.value))
  itemType: string;
}
