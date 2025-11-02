import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

describe('ItemsService', () => {
  let service: ItemsService;
  let repository: Repository<Item>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Item),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    repository = module.get<Repository<Item>>(getRepositoryToken(Item));

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo item', async () => {
      const createDto: CreateItemDto = {
        name: 'Cerveja',
        price: 5.5,
      };
      const establishmentId = 'est-1';

      const newItem = {
        id: 'item-1',
        name: createDto.name,
        price: '5.5',
        active: true,
        establishment_id: establishmentId,
      };

      mockRepository.create.mockReturnValue(newItem);
      mockRepository.save.mockResolvedValue(newItem);

      const result = await service.create(createDto, establishmentId);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        price: '5.5',
        establishment_id: establishmentId,
      });
      expect(result).toEqual(newItem);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os itens do estabelecimento', async () => {
      const establishmentId = 'est-1';
      const items = [
        { id: '1', name: 'Cerveja', price: '5.5', active: true },
        { id: '2', name: 'Refrigerante', price: '4', active: false },
      ];

      mockRepository.find.mockResolvedValue(items);

      const result = await service.findAll(establishmentId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { establishment_id: establishmentId },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(items);
    });
  });

  describe('findActive', () => {
    it('deve retornar apenas itens ativos', async () => {
      const establishmentId = 'est-1';
      const activeItems = [
        { id: '1', name: 'Cerveja', price: '5.5', active: true },
        { id: '3', name: 'Água', price: '3', active: true },
      ];

      mockRepository.find.mockResolvedValue(activeItems);

      const result = await service.findActive(establishmentId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { active: true, establishment_id: establishmentId },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(activeItems);
    });
  });

  describe('findActiveOrderedBySales', () => {
    it('deve retornar itens ativos ordenados por vendas', async () => {
      const establishmentId = 'est-1';
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            name: 'Cerveja',
            price: '5.5',
            active: true,
            establishment_id: establishmentId,
            total_sold: '100',
          },
          {
            id: '2',
            name: 'Refrigerante',
            price: '4',
            active: true,
            establishment_id: establishmentId,
            total_sold: '50',
          },
        ]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findActiveOrderedBySales(establishmentId);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Cerveja');
    });
  });

  describe('findOne', () => {
    it('deve retornar um item por ID', async () => {
      const item = {
        id: 'item-1',
        name: 'Cerveja',
        price: '5.5',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(item);

      const result = await service.findOne('item-1', 'est-1');

      expect(result).toEqual(item);
    });

    it('deve lançar NotFoundException se item não existir', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'est-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um item', async () => {
      const updateDto: UpdateItemDto = {
        name: 'Cerveja Premium',
        price: 7,
      };

      const existingItem = {
        id: 'item-1',
        name: 'Cerveja',
        price: '5.5',
        establishment_id: 'est-1',
      };

      const updatedItem = {
        ...existingItem,
        name: updateDto.name,
        price: '7',
      };

      mockRepository.findOne.mockResolvedValue(existingItem);
      mockRepository.save.mockResolvedValue(updatedItem);

      const result = await service.update('item-1', updateDto, 'est-1');

      expect(result.name).toBe('Cerveja Premium');
      expect(result.price).toBe('7');
    });

    it('deve atualizar apenas o nome se price não for fornecido', async () => {
      const updateDto: UpdateItemDto = {
        name: 'Cerveja Premium',
      };

      const existingItem = {
        id: 'item-1',
        name: 'Cerveja',
        price: '5.5',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(existingItem);
      mockRepository.save.mockResolvedValue({
        ...existingItem,
        name: updateDto.name,
      });

      const result = await service.update('item-1', updateDto, 'est-1');

      expect(result.name).toBe('Cerveja Premium');
      expect(result.price).toBe('5.5');
    });
  });

  describe('remove', () => {
    it('deve remover um item', async () => {
      const item = {
        id: 'item-1',
        name: 'Cerveja',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(item);
      mockRepository.remove.mockResolvedValue(item);

      await service.remove('item-1', 'est-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(item);
    });

    it('deve lançar BadRequestException se item estiver em uso', async () => {
      const item = {
        id: 'item-1',
        name: 'Cerveja',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(item);
      mockRepository.remove.mockRejectedValue({ code: '23503' });

      await expect(service.remove('item-1', 'est-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deactivate', () => {
    it('deve desativar um item', async () => {
      const item = {
        id: 'item-1',
        name: 'Cerveja',
        active: true,
        establishment_id: 'est-1',
      };

      const deactivatedItem = {
        ...item,
        active: false,
      };

      mockRepository.findOne.mockResolvedValue(item);
      mockRepository.save.mockResolvedValue(deactivatedItem);

      const result = await service.deactivate('item-1', 'est-1');

      expect(result.active).toBe(false);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...item,
        active: false,
      });
    });
  });
});

