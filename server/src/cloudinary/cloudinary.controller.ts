import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadOptions } from './cloudinary/file-upload.options';
import { Public } from 'src/decorator/customize';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private config: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

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

  @Get('signature')
  getSignature() {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: 'do_an' },
      this.config.get<string>('CLOUDINARY_API_SECRET') as string,
    );

    return {
      timestamp,
      signature,
      apiKey: this.config.get<string>('CLOUDINARY_API_KEY'),
      cloudName: this.config.get<string>('CLOUDINARY_NAME'),
      folder: 'do_an',
    };
  }
}
