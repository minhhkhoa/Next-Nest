import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadOptions } from './cloudinary/file-upload.options';
import { Public } from 'src/decorator/customize';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @ApiTags('upload file')
  @Public()
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileUpload: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('fileUpload', fileUploadOptions))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new Error('File missing or empty');
    }
    try {
      const data = await this.cloudinaryService.uploadFile(file);
      return data.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      throw new Error('Upload failed');
    }
  }
}
