import { Test, TestingModule } from '@nestjs/testing';
import { LinkListsService } from './link-lists.service';
import { PrismaService } from '../prisma.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { mockPrismaService } from '../../test/mocks/mock-prisma.service';
import { mockRabbitMQService } from '../../test/mocks/mock-rabbitmq.service';
import { CreateLinkListDto } from './dto/create-link-list.dto';

describe('LinkListsService', () => {
  let service: LinkListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkListsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RabbitMQService, useValue: mockRabbitMQService },
      ],
    }).compile();

    service = module.get<LinkListsService>(LinkListsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return a new link list creation message', async () => {
      const createLinkListDto: CreateLinkListDto = {
        id: expect.any(Number),
        name: 'Test LinkList',
        email: 'test@example.com',
        phone: '1234567890',
        company: 'Test Company',
        cpf: '',
        empresa: '',
        timestamp: undefined,
      };

      // Simule uma resposta esperada
      const expectedCreatedLinkList = { ...createLinkListDto, id: 1 };

      // Aqui estamos assumindo que o PrismaService tem um método create no modelo linkList que você deseja chamar
      mockPrismaService.linkList.create.mockResolvedValue(
        expectedCreatedLinkList,
      );

      const result = await service.create(createLinkListDto);
      expect(result).toEqual(expectedCreatedLinkList);
      expect(mockPrismaService.linkList.create).toHaveBeenCalledWith({
        data: createLinkListDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all link lists', async () => {
      const expectedLinkLists = [
        { id: 1, name: 'Test LinkList 1', url: 'http://example1.com' },
        { id: 2, name: 'Test LinkList 2', url: 'http://example2.com' },
      ];

      mockPrismaService.linkList.findMany.mockResolvedValue(expectedLinkLists);

      const result = await service.findAll();
      expect(result).toEqual(expectedLinkLists);
      expect(mockPrismaService.linkList.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single link list', async () => {
      const id = 1;
      const expectedLinkList = {
        id,
        name: 'Test LinkList',
        url: 'http://example.com',
      };

      mockPrismaService.linkList.findUnique.mockResolvedValue(expectedLinkList);

      const result = await service.findOne(id);
      expect(result).toEqual(expectedLinkList);
      expect(mockPrismaService.linkList.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('update', () => {
    it('should return an update message for a link list', async () => {
      const id = 1;
      const updateLinkListDto = {
        name: 'Updated LinkList',
        url: 'http://updated-example.com',
      };
      const expectedUpdatedLinkList = { id, updateLinkListDto };

      mockPrismaService.linkList.update.mockResolvedValue(
        expectedUpdatedLinkList,
      );

      const result = await service.update(id, updateLinkListDto);
      expect(result).toEqual(expectedUpdatedLinkList);
      expect(mockPrismaService.linkList.update).toHaveBeenCalledWith({
        where: { id },
        data: updateLinkListDto,
      });
    });
  });

  describe('remove', () => {
    it('should return a removal message for a link list', async () => {
      const id = 1;
      mockPrismaService.linkList.delete.mockResolvedValue({
        id,
        name: 'Test LinkList',
        url: 'http://example.com',
      } as any);

      const result = await service.remove(id);
      expect(result).toBe(`This action removes a #${id} linkList`);
      expect(mockPrismaService.linkList.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
});
