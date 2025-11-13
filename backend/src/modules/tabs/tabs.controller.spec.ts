import { Test, TestingModule } from '@nestjs/testing';
import { TabsController } from './tabs.controller';
import { TabsService } from './tabs.service';
import { CreateTabDto } from './dto/create-tab.dto';
import { UpdateTabDto } from './dto/update-tab.dto';
import { AddItemDto } from './dto/add-item.dto';
import { AddPaymentDto } from '../payments/dto/add-payment.dto';
import { PaymentMethod } from '../payments/entities/payment.entity';

describe('TabsController', () => {
  let controller: TabsController;
  let service: TabsService;

  const mockTab = {
    id: 'tab-1',
    status: 'OPEN',
    total: 50.0,
    paid: 0,
    establishment_id: 'est-1',
    items: [],
    payments: [],
  };

  const mockTabsService = {
    open: jest.fn(),
    addItem: jest.fn(),
    removeItem: jest.fn(),
    updateItemQuantity: jest.fn(),
    findOpen: jest.fn(),
    findClosed: jest.fn(),
    delete: jest.fn(),
    addPayment: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    close: jest.fn(),
    getAvailableMonths: jest.fn(),
    getConsumptionReport: jest.fn(),
  };

  const mockRequest = {
    user: {
      establishmentId: 'est-1',
      id: 'user-1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TabsController],
      providers: [
        {
          provide: TabsService,
          useValue: mockTabsService,
        },
      ],
    }).compile();

    controller = module.get<TabsController>(TabsController);
    service = module.get<TabsService>(TabsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('open', () => {
    it('should open a new tab', async () => {
      const createTabDto: CreateTabDto = {
        customerId: 'customer-1',
      };

      mockTabsService.open.mockResolvedValue(mockTab);

      const result = await controller.open(createTabDto, mockRequest);

      expect(service.open).toHaveBeenCalledWith(createTabDto, 'est-1');
      expect(result).toEqual(mockTab);
    });
  });

  describe('addItemToTab', () => {
    it('should add item to tab', async () => {
      const data = { tabId: 'tab-1', itemId: 'item-1', qty: 2 };
      mockTabsService.addItem.mockResolvedValue(mockTab);

      const result = await controller.addItemToTab(data, mockRequest);

      expect(service.addItem).toHaveBeenCalledWith(
        'tab-1',
        { itemId: 'item-1', qty: 2 },
        'est-1',
      );
      expect(result).toEqual(mockTab);
    });
  });

  describe('removeItemFromTab', () => {
    it('should remove item from tab', async () => {
      const data = { tabId: 'tab-1', tabItemId: 'tabitem-1' };
      mockTabsService.removeItem.mockResolvedValue(mockTab);

      const result = await controller.removeItemFromTab(data, mockRequest);

      expect(service.removeItem).toHaveBeenCalledWith('tab-1', 'tabitem-1', 'est-1');
      expect(result).toEqual(mockTab);
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', async () => {
      const data = { tabId: 'tab-1', tabItemId: 'tabitem-1', qty: 3 };
      mockTabsService.updateItemQuantity.mockResolvedValue(mockTab);

      const result = await controller.updateItemQuantity(data, mockRequest);

      expect(service.updateItemQuantity).toHaveBeenCalledWith(
        'tab-1',
        'tabitem-1',
        3,
        'est-1',
      );
      expect(result).toEqual(mockTab);
    });
  });

  describe('findOpen', () => {
    it('should return open tabs', async () => {
      const tabs = [mockTab];
      mockTabsService.findOpen.mockResolvedValue(tabs);

      const result = await controller.findOpen(mockRequest);

      expect(service.findOpen).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(tabs);
    });
  });

  describe('findClosed', () => {
    it('should return closed tabs', async () => {
      const tabs = [{ ...mockTab, status: 'CLOSED' }];
      mockTabsService.findClosed.mockResolvedValue(tabs);

      const result = await controller.findClosed(undefined, undefined, mockRequest);

      expect(service.findClosed).toHaveBeenCalledWith('est-1', undefined, undefined);
      expect(result).toEqual(tabs);
    });

    it('should return closed tabs with date filters', async () => {
      const tabs = [{ ...mockTab, status: 'CLOSED' }];
      mockTabsService.findClosed.mockResolvedValue(tabs);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const result = await controller.findClosed(startDate, endDate, mockRequest);

      expect(service.findClosed).toHaveBeenCalledWith(
        'est-1',
        new Date(startDate),
        new Date(endDate),
      );
      expect(result).toEqual(tabs);
    });
  });

  describe('deleteTab', () => {
    it('should delete a tab', async () => {
      mockTabsService.delete.mockResolvedValue(undefined);

      await controller.deleteTab('tab-1', mockRequest);

      expect(service.delete).toHaveBeenCalledWith('tab-1', 'est-1');
    });
  });

  describe('deleteTabAlternative', () => {
    it('should delete a tab using alternative endpoint', async () => {
      mockTabsService.delete.mockResolvedValue(undefined);

      await controller.deleteTabAlternative({ tabId: 'tab-1' }, mockRequest);

      expect(service.delete).toHaveBeenCalledWith('tab-1', 'est-1');
    });
  });

  describe('addPaymentToTab', () => {
    it('should add payment to tab', async () => {
      const data = {
        tabId: 'tab-1',
        method: 'CASH',
        amount: '50.00',
        note: 'Paid in cash',
      };
      mockTabsService.addPayment.mockResolvedValue(mockTab);

      const result = await controller.addPaymentToTab(data, mockRequest);

      expect(service.addPayment).toHaveBeenCalledWith(
        'tab-1',
        {
          method: 'CASH' as PaymentMethod,
          amount: '50.00',
          note: 'Paid in cash',
        },
        'est-1',
      );
      expect(result).toEqual(mockTab);
    });
  });

  describe('findOne', () => {
    it('should return a single tab', async () => {
      mockTabsService.findOne.mockResolvedValue(mockTab);

      const result = await controller.findOne('tab-1', mockRequest);

      expect(service.findOne).toHaveBeenCalledWith('tab-1', 'est-1');
      expect(result).toEqual(mockTab);
    });
  });

  describe('update', () => {
    it('should update a tab', async () => {
      const updateTabDto: UpdateTabDto = {
        customerId: 'customer-2',
      };
      mockTabsService.update.mockResolvedValue({ ...mockTab, ...updateTabDto });

      const result = await controller.update('tab-1', updateTabDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith('tab-1', updateTabDto, 'est-1');
      expect(result).toEqual({ ...mockTab, ...updateTabDto });
    });
  });

  describe('addItem', () => {
    it('should add item to tab', async () => {
      const addItemDto: AddItemDto = {
        itemId: 'item-1',
        qty: 2,
      };
      mockTabsService.addItem.mockResolvedValue(mockTab);

      const result = await controller.addItem('tab-1', addItemDto, mockRequest);

      expect(service.addItem).toHaveBeenCalledWith('tab-1', addItemDto, 'est-1');
      expect(result).toEqual(mockTab);
    });
  });

  describe('removeItem', () => {
    it('should remove item from tab', async () => {
      mockTabsService.removeItem.mockResolvedValue(mockTab);

      const result = await controller.removeItem('tab-1', 'tabitem-1', mockRequest);

      expect(service.removeItem).toHaveBeenCalledWith('tab-1', 'tabitem-1', 'est-1');
      expect(result).toEqual(mockTab);
    });
  });

  describe('addPayment', () => {
    it('should add payment to tab', async () => {
      const addPaymentDto: AddPaymentDto = {
        method: PaymentMethod.CASH,
        amount: '50.00',
      };
      mockTabsService.addPayment.mockResolvedValue(mockTab);

      const result = await controller.addPayment('tab-1', addPaymentDto, mockRequest);

      expect(service.addPayment).toHaveBeenCalledWith('tab-1', addPaymentDto, 'est-1');
      expect(result).toEqual(mockTab);
    });
  });

  describe('close', () => {
    it('should close a tab', async () => {
      const closedTab = { ...mockTab, status: 'CLOSED' };
      mockTabsService.close.mockResolvedValue(closedTab);

      const result = await controller.close('tab-1', mockRequest);

      expect(service.close).toHaveBeenCalledWith('tab-1', 'est-1');
      expect(result).toEqual(closedTab);
    });
  });

  describe('getAvailableMonths', () => {
    it('should return available months', async () => {
      const months = [
        { year: 2024, month: 1 },
        { year: 2024, month: 2 },
      ];
      mockTabsService.getAvailableMonths.mockResolvedValue(months);

      const result = await controller.getAvailableMonths(mockRequest);

      expect(service.getAvailableMonths).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(months);
    });
  });

  describe('getConsumptionReport', () => {
    it('should return consumption report', async () => {
      const report = {
        totalRevenue: 1000,
        totalTabs: 10,
      };
      mockTabsService.getConsumptionReport.mockResolvedValue(report);

      const result = await controller.getConsumptionReport('2024', '1', mockRequest);

      expect(service.getConsumptionReport).toHaveBeenCalledWith(2024, 1, 'est-1');
      expect(result).toEqual(report);
    });
  });
});

