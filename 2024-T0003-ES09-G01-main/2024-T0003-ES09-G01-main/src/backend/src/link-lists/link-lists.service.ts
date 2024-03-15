import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { PrismaService } from '../prisma.service';
import {headersMatch, atLeastOneRecord, csvRecordValid} from './utils/csv.specification';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CreateLinkListDto } from './dto/create-link-list.dto';
import { UpdateLinkListDto } from './dto/update-link-list.dto';
import { error } from 'console';

@Injectable()
export class LinkListsService {
  remove(id: number): any {
    throw new Error('Method not implemented.');
  }
  update(id: number, updateLinkListDto: UpdateLinkListDto): any {
    throw new Error('Method not implemented.');
  }
  findOne(id: number): any {
    throw new Error('Method not implemented.');
  }
  findAll(): any {
    throw new Error('Method not implemented.');
  }
  create(createLinkListDto: CreateLinkListDto): any {
    throw new Error('Method not implemented.');
  }
  constructor(
    private prisma: PrismaService,
    private headersMatch: headersMatch,
    private atLeastOneRecord: atLeastOneRecord,
    private csvRecordValid: csvRecordValid,
    private readonly rabbitMQService: RabbitMQService
  ) {}

  async uploadFile(file: Express.Multer.File) {
    this.validateFileType(file);
    const csvData = this.readCSVFile(file.path);
    const parsedCsv = this.parseCSV(csvData);
    this.validateCSV(parsedCsv);

    const createdCsvEntities = await this.saveCSVData(parsedCsv);

    await this.sendLinkListToQueue(createdCsvEntities);
    
    return createdCsvEntities;
  }

  private validateFileType(file: Express.Multer.File): void {
    if (file.mimetype !== 'text/csv') {
      throw new Error('Arquivo inválido. Por favor, envie um arquivo .csv.');
    }
  }

  private readCSVFile(filePath: string): string {
    const csvFile = readFileSync(filePath, 'utf8');
    return csvFile.toString();
  }

  private parseCSV(csvData: string): any {
    return parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace('#', '').trim(),
    });
  }

  private validateCSV(parsedCsv: any): void {
    if (!this.atLeastOneRecord.isSatisfiedBy(parsedCsv)) {
      throw new Error('O arquivo CSV está vazio.');
    } else if (!this.headersMatch.isSatisfiedBy(parsedCsv.meta.fields.map(header => header.toLowerCase().replace(/\s/g, '')))) {
      throw new Error('Os headers do CSV não correspondem aos esperados ou estão fora de ordem.');
    } else if (!this.csvRecordValid.isSatisfiedBy(parsedCsv.data)) {
      throw new Error('Os registros do CSV não são válidos.');
    }
  }

  private async saveCSVData(parsedCsv: any): Promise<any[]> {
    try {
      const createdEntitiesPromises = parsedCsv.data.map(async (item) => {
        try {
          const createdCsvEntity = await this.prisma.csvTable.create({
            data: {
              name: item.name,
              email: item.email,
              phone: item.phone,
              company: item.company,
              cpf: item.cpf,
              empresa: item.empresa,
              timestamp: new Date(),
            },
          });
          return createdCsvEntity;
        } catch (error) {
          console.error(`Erro ao salvar o objeto no banco de dados: ${error}`);
          throw new Error('Erro ao salvar os dados do CSV no banco de dados.');
        }
      });

      return await Promise.all(createdEntitiesPromises);
    } catch (error) {
      throw new Error('Erro ao salvar os dados do CSV no banco de dados.');
    }
  }

  private async sendLinkListToQueue(data: any[]): Promise<void> {
    try {
      await this.rabbitMQService.sendMessage('link-list-queue', JSON.stringify(data));
      console.log("Mensagem enviada para a fila link-list-queue", data);
    } catch (error) {
      throw new Error('Erro ao enviar mensagem para a fila link-list-queue.');
    }
  }
}
