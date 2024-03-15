// Importações necessárias do NestJS e dos seus arquivos
import { Test, TestingModule } from '@nestjs/testing';
import { LinkListsController } from './link-lists.controller';
import { LinkListsService } from './link-lists.service';
import { CreateLinkListDto } from './dto/create-link-list.dto';

// Criação de um mock para o LinkListsService
const mockLinkListsService = {
  create: jest.fn((dto) => {
    return Promise.resolve({ id: Date.now(), ...dto });
  }),
  findAll: jest.fn(() => {
    return Promise.resolve([]);
  }),
  findOne: jest.fn((id) => {
    return Promise.resolve({ id, name: 'Test Name', email: 'test@example.com', phone: '1234567890', company: 'Test Company' });
  }),
  update: jest.fn((id, dto) => {
    return Promise.resolve({ id, ...dto });
  }),
  remove: jest.fn((id) => {
    return Promise.resolve({ id });
  }),
};

describe('LinkListsController', () => {
  let controller: LinkListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinkListsController],
      providers: [{ provide: LinkListsService, useValue: mockLinkListsService }],
    }).compile();

    controller = module.get<LinkListsController>(LinkListsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a link list', async () => {
      const createDto: CreateLinkListDto = {
        name: 'Test LinkList',
        email: 'test@example.com',
        phone: '1234567890',
        company: 'Test Company',
        id: 0,
        cpf: '',
        empresa: '',
        timestamp: undefined
      };

      await expect(controller.create(createDto)).resolves.toEqual(expect.objectContaining(createDto));
      expect(mockLinkListsService.create).toHaveBeenCalledWith(createDto);
    });
  });
});
