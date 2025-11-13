import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  const mockItem = {
    id: 'item-1',
    name: 'Cerveja Heineken',
    price: 8.0,
    active: true,
    establishment_id: 'est-1',
  };

  const mockItemsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn(),
    findActiveOrderedBySales: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    deactivate: jest.fn(),
  };

  const mockRequest = {
    user: {
      establishmentId: 'est-1',
      id: 'user-1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockItemsService,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const createItemDto: CreateItemDto = {
        name: 'Cerveja Heineken',
        price: 8.0,
      };

      mockItemsService.create.mockResolvedValue(mockItem);

      const result = await controller.create(createItemDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createItemDto, 'est-1');
      expect(result).toEqual(mockItem);
    });
  });

  describe('findAll', () => {
    it('should return all items', async () => {
      const items = [mockItem];
      mockItemsService.findAll.mockResolvedValue(items);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(items);
    });
  });

  describe('findActive', () => {
    it('should return active items', async () => {
      const items = [mockItem];
      mockItemsService.findActive.mockResolvedValue(items);

      const result = await controller.findActive(mockRequest);

      expect(service.findActive).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(items);
    });
  });

  describe('findActiveOrderedBySales', () => {
    it('should return active items ordered by sales', async () => {
      const items = [mockItem];
      mockItemsService.findActiveOrderedBySales.mockResolvedValue(items);

      const result = await controller.findActiveOrderedBySales(mockRequest);

      expect(service.findActiveOrderedBySales).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(items);
    });
  });

  describe('findOne', () => {
    it('should return a single item', async () => {
      mockItemsService.findOne.mockResolvedValue(mockItem);

      const result = await controller.findOne('item-1', mockRequest);

      expect(service.findOne).toHaveBeenCalledWith('item-1', 'est-1');
      expect(result).toEqual(mockItem);
    });
  });

  describe('update', () => {
    it('should update an item', async () => {
      const updateItemDto: UpdateItemDto = {
        name: 'Cerveja Heineken 600ml',
        price: 10.0,
      };
      const updatedItem = { ...mockItem, ...updateItemDto };
      mockItemsService.update.mockResolvedValue(updatedItem);

      const result = await controller.update('item-1', updateItemDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith('item-1', updateItemDto, 'est-1');
      expect(result).toEqual(updatedItem);
    });
  });

  describe('remove', () => {
    it('should remove an item', async () => {
      mockItemsService.remove.mockResolvedValue(undefined);

      await controller.remove('item-1', mockRequest);

      expect(service.remove).toHaveBeenCalledWith('item-1', 'est-1');
    });
  });

  describe('deactivate', () => {
    it('should deactivate an item', async () => {
      const deactivatedItem = { ...mockItem, active: false };
      mockItemsService.deactivate.mockResolvedValue(deactivatedItem);

      const result = await controller.deactivate('item-1', mockRequest);

      expect(service.deactivate).toHaveBeenCalledWith('item-1', 'est-1');
      expect(result).toEqual(deactivatedItem);
    });
  });
});

