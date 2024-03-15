import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { LinkListsService } from './link-lists.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvInterceptor } from './utils/csv-interceptor';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileUploadDto } from './dto/upload-file.dto';
import { CreateLinkListDto } from './dto/create-link-list.dto';

@ApiTags('link-lists')
@Controller('link-lists')
export class LinkListsController {
  create(createDto: CreateLinkListDto): any {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly linkListsService: LinkListsService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'), CsvInterceptor)
  @ApiBody({
    description: 'Arquivo CSV contendo dados da lista de links',
    type: FileUploadDto,
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
   const result = await this.linkListsService.uploadFile(file);

    return { message: 'Dados do CSV salvos no banco de dados com sucesso.', data: result };
  }
}