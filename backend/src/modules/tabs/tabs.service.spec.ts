import { Test, TestingModule } from '@nestjs/testing';
import { TabsService } from './tabs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tab, TabStatus } from './entities/tab.entity';
import { TabItem } from '../tab-items/entities/tab-item.entity';
import { Payment, PaymentMethod } from '../payments/entities/payment.entity';
import { CustomersService } from '../customers/services/customers.service';
import { ItemsService } from '../items/items.service';
import { ExpensesService } from '../expenses/expenses.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTabDto } from './dto/create-tab.dto';
import { AddItemDto } from './dto/add-item.dto';
import { AddPaymentDto } from '../payments/dto/add-payment.dto';

describe('TabsService', () => {
  let service: TabsService;
  let tabsRepository: Repository<Tab>;
  let tabItemsRepository: Repository<TabItem>;
  let paymentsRepository: Repository<Payment>;
  let customersService: CustomersService;
  let itemsService: ItemsService;

  const mockTabsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockTabItemsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockPaymentsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockCustomersService = {
    findOne: jest.fn(),
    updateBalanceDue: jest.fn(),
  };

  const mockItemsService = {
    findOne: jest.fn(),
  };

  const mockExpensesService = {
    findByPeriod: jest.fn(),
    findByEstablishment: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TabsService,
        {
          provide: getRepositoryToken(Tab),
          useValue: mockTabsRepository,
        },
        {
          provide: getRepositoryToken(TabItem),
          useValue: mockTabItemsRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentsRepository,
        },
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
        {
          provide: ItemsService,
          useValue: mockItemsService,
        },
        {
          provide: ExpensesService,
          useValue: mockExpensesService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TabsService>(TabsService);
    tabsRepository = module.get<Repository<Tab>>(getRepositoryToken(Tab));
    tabItemsRepository = module.get<Repository<TabItem>>(getRepositoryToken(TabItem));
    paymentsRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    customersService = module.get<CustomersService>(CustomersService);
    itemsService = module.get<ItemsService>(ItemsService);

    jest.clearAllMocks();
    
    // Silenciar logs do console durante os testes
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('open', () => {
    it('deve abrir uma nova conta sem cliente', async () => {
      const createDto: CreateTabDto = {};
      const establishmentId = 'est-1';

      const newTab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
        customer: null,
        establishment_id: establishmentId,
        opened_at: new Date(),
      };

      mockTabsRepository.create.mockReturnValue(newTab);
      mockTabsRepository.save.mockResolvedValue(newTab);

      const result = await service.open(createDto, establishmentId);

      expect(mockTabsRepository.create).toHaveBeenCalledWith({
        status: TabStatus.OPEN,
        customer: null,
        establishment_id: establishmentId,
      });
      expect(result).toEqual(newTab);
    });

    it('deve abrir uma nova conta com cliente', async () => {
      const createDto: CreateTabDto = { customerId: 'customer-1' };
      const establishmentId = 'est-1';

      const newTab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
        customer: { id: 'customer-1' },
        establishment_id: establishmentId,
      };

      mockTabsRepository.create.mockReturnValue(newTab);
      mockTabsRepository.save.mockResolvedValue(newTab);

      const result = await service.open(createDto, establishmentId);

      expect(result.customer).toBeDefined();
    });
  });

  describe('findOpen', () => {
    it('deve retornar contas abertas', async () => {
      const establishmentId = 'est-1';
      const openTabs = [
        { id: 'tab-1', status: TabStatus.OPEN },
        { id: 'tab-2', status: TabStatus.OPEN },
      ];

      mockTabsRepository.find.mockResolvedValue(openTabs);

      const result = await service.findOpen(establishmentId);

      expect(mockTabsRepository.find).toHaveBeenCalledWith({
        where: { status: TabStatus.OPEN, establishment_id: establishmentId },
        relations: ['customer', 'tabItems', 'tabItems.item'],
        order: { opened_at: 'DESC' },
      });
      expect(result).toEqual(openTabs);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma conta por ID', async () => {
      const tab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
        establishment_id: 'est-1',
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);

      const result = await service.findOne('tab-1', 'est-1');

      expect(result).toEqual(tab);
    });

    it('deve lançar NotFoundException se conta não existir', async () => {
      mockTabsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'est-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addItem', () => {
    it('deve adicionar item à conta aberta', async () => {
      const tabId = 'tab-1';
      const addItemDto: AddItemDto = {
        itemId: 'item-1',
        qty: 2,
      };
      const establishmentId = 'est-1';

      const tab = {
        id: tabId,
        status: TabStatus.OPEN,
        establishment_id: establishmentId,
      };

      const item = {
        id: 'item-1',
        name: 'Cerveja',
        price: '5.5',
      };

      const tabItem = {
        id: 'tab-item-1',
        tab: { id: tabId },
        item: { id: 'item-1' },
        qty: 2,
        unit_price: '5.5',
        total: '11',
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockItemsService.findOne.mockResolvedValue(item);
      mockTabItemsRepository.create.mockReturnValue(tabItem);
      mockTabItemsRepository.save.mockResolvedValue(tabItem);

      const result = await service.addItem(tabId, addItemDto, establishmentId);

      expect(result.qty).toBe(2);
      expect(result.total).toBe('11');
    });

    it('deve lançar erro ao adicionar item em conta fechada', async () => {
      const tab = {
        id: 'tab-1',
        status: TabStatus.CLOSED,
        establishment_id: 'est-1',
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);

      await expect(
        service.addItem('tab-1', { itemId: 'item-1', qty: 1 }, 'est-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve usar preço customizado quando fornecido', async () => {
      const tabId = 'tab-1';
      const addItemDto: AddItemDto = {
        itemId: 'item-1',
        qty: 2,
        unitPrice: '6',
      };

      const tab = {
        id: tabId,
        status: TabStatus.OPEN,
      };

      const item = {
        id: 'item-1',
        name: 'Cerveja',
        price: '5.5',
      };

      const tabItem = {
        id: 'tab-item-1',
        qty: 2,
        unit_price: '6',
        total: '12',
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockItemsService.findOne.mockResolvedValue(item);
      mockTabItemsRepository.create.mockReturnValue(tabItem);
      mockTabItemsRepository.save.mockResolvedValue(tabItem);

      const result = await service.addItem(tabId, addItemDto, 'est-1');

      expect(result.unit_price).toBe('6');
      expect(result.total).toBe('12');
    });
  });

  describe('removeItem', () => {
    it('deve remover item da conta', async () => {
      const tab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
      };

      const tabItem = {
        id: 'tab-item-1',
        tab: { id: 'tab-1' },
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockTabItemsRepository.findOne.mockResolvedValue(tabItem);
      mockTabItemsRepository.remove.mockResolvedValue(tabItem);

      await service.removeItem('tab-1', 'tab-item-1', 'est-1');

      expect(mockTabItemsRepository.remove).toHaveBeenCalledWith(tabItem);
    });
  });

  describe('calculateTotal', () => {
    it('deve calcular o total da conta', async () => {
      const tabItems = [
        { total: '10' },
        { total: '15.5' },
        { total: '20' },
      ];

      mockTabItemsRepository.find.mockResolvedValue(tabItems);

      const result = await service.calculateTotal('tab-1');

      expect(result).toBe('45.5');
    });
  });

  describe('addPayment', () => {
    it('deve adicionar pagamento e fechar conta quando pagar tudo', async () => {
      const tab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
        customer: null,
      };

      const payment = {
        id: 'payment-1',
        tab: { id: 'tab-1' },
        method: PaymentMethod.CASH,
        amount: '50',
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockPaymentsRepository.create.mockReturnValue(payment);
      mockPaymentsRepository.save.mockResolvedValue(payment);
      
      // Mock para calculateTotal
      mockTabItemsRepository.find.mockResolvedValue([
        { total: '30' },
        { total: '20' },
      ]);
      
      // Mock para calculatePaidAmount
      mockPaymentsRepository.find.mockResolvedValue([payment]);
      
      // Mock para close
      mockTabsRepository.save.mockResolvedValue({
        ...tab,
        status: TabStatus.CLOSED,
        closed_at: new Date(),
      });

      const addPaymentDto: AddPaymentDto = {
        method: PaymentMethod.CASH,
        amount: '50',
      };

      await service.addPayment('tab-1', addPaymentDto, 'est-1');

      expect(mockPaymentsRepository.save).toHaveBeenCalled();
    });

    it('deve criar dívida quando pagamento for LATER', async () => {
      const tab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
        customer: { id: 'customer-1' },
      };

      const payment = {
        id: 'payment-1',
        method: PaymentMethod.LATER,
        amount: '50',
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockPaymentsRepository.create.mockReturnValue(payment);
      mockPaymentsRepository.save.mockResolvedValue(payment);
      mockTabItemsRepository.find.mockResolvedValue([{ total: '50' }]);
      mockPaymentsRepository.find.mockResolvedValue([]);
      mockCustomersService.updateBalanceDue.mockResolvedValue(undefined);
      mockTabsRepository.save.mockResolvedValue({
        ...tab,
        status: TabStatus.CLOSED,
      });

      const addPaymentDto: AddPaymentDto = {
        method: PaymentMethod.LATER,
        amount: '50',
      };

      await service.addPayment('tab-1', addPaymentDto, 'est-1');

      expect(mockCustomersService.updateBalanceDue).toHaveBeenCalledWith(
        'customer-1',
        '-50',
        'est-1',
      );
    });

    it('deve creditar saldo quando cliente pagar a mais', async () => {
      const tab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
        customer: { id: 'customer-1' },
      };

      const payment = {
        id: 'payment-1',
        method: PaymentMethod.CASH,
        amount: '100',
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockPaymentsRepository.create.mockReturnValue(payment);
      mockPaymentsRepository.save.mockResolvedValue(payment);
      
      // Total da conta é 50
      mockTabItemsRepository.find.mockResolvedValue([{ total: '50' }]);
      
      // Cliente pagou 100 (a mais)
      mockPaymentsRepository.find.mockResolvedValue([payment]);
      
      mockCustomersService.updateBalanceDue.mockResolvedValue(undefined);
      mockTabsRepository.save.mockResolvedValue({
        ...tab,
        status: TabStatus.CLOSED,
      });

      const addPaymentDto: AddPaymentDto = {
        method: PaymentMethod.CASH,
        amount: '100',
      };

      await service.addPayment('tab-1', addPaymentDto, 'est-1');

      // Deve creditar os 50 que sobraram (100 - 50 = 50)
      expect(mockCustomersService.updateBalanceDue).toHaveBeenCalledWith(
        'customer-1',
        '50',
        'est-1',
      );
    });
  });

  describe('close', () => {
    it('deve fechar uma conta', async () => {
      const tab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
        establishment_id: 'est-1',
      };

      const closedTab = {
        ...tab,
        status: TabStatus.CLOSED,
        closed_at: new Date(),
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockTabsRepository.save.mockResolvedValue(closedTab);

      const result = await service.close('tab-1', 'est-1');

      expect(result.status).toBe(TabStatus.CLOSED);
      expect(result.closed_at).toBeDefined();
    });
  });

  describe('delete', () => {
    it('deve excluir conta vazia', async () => {
      const tab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
        tabItems: [],
        payments: [],
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockTabsRepository.remove.mockResolvedValue(tab);

      await service.delete('tab-1', 'est-1');

      expect(mockTabsRepository.remove).toHaveBeenCalledWith(tab);
    });

    it('deve lançar erro ao excluir conta com itens', async () => {
      const tab = {
        id: 'tab-1',
        tabItems: [{ id: 'item-1' }],
        payments: [],
      };

      mockTabsRepository.findOne.mockResolvedValue(tab);

      await expect(service.delete('tab-1', 'est-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findClosed', () => {
    it('deve retornar contas fechadas', async () => {
      const tabs = [
        {
          id: 'tab-1',
          status: TabStatus.CLOSED,
          establishment_id: 'est-1',
        },
      ];

      mockTabsRepository.find.mockResolvedValue(tabs);

      const result = await service.findClosed('est-1');

      expect(result).toEqual(tabs);
      expect(mockTabsRepository.find).toHaveBeenCalled();
    });

    it('deve filtrar por período quando fornecido', async () => {
      const tabs = [{ id: 'tab-1' }];
      mockTabsRepository.find.mockResolvedValue(tabs);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await service.findClosed('est-1', startDate, endDate);

      expect(mockTabsRepository.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar uma conta', async () => {
      const tab = {
        id: 'tab-1',
        establishment_id: 'est-1',
        customer: null,
      };

      const updateDto = { customerId: 'customer-1' };
      const updatedTab = { ...tab, customer: { id: 'customer-1' } };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockCustomersService.findOne.mockResolvedValue({ id: 'customer-1', name: 'Cliente Teste' });
      mockTabsRepository.save.mockResolvedValue(updatedTab);

      const result = await service.update('tab-1', updateDto, 'est-1');

      expect(result.customer).toBeDefined();
      expect(mockTabsRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateItemQuantity', () => {
    it('deve atualizar quantidade de item', async () => {
      const tab = {
        id: 'tab-1',
        status: TabStatus.OPEN,
        establishment_id: 'est-1',
        tabItems: [],
      };

      const tabItem = {
        id: 'item-1',
        qty: 2,
        unit_price: '10',
        total: '20',
      };

      const updatedItem = { ...tabItem, qty: 3, total: '30' };

      mockTabsRepository.findOne.mockResolvedValue(tab);
      mockTabItemsRepository.findOne.mockResolvedValue(tabItem);
      mockTabItemsRepository.save.mockResolvedValue(updatedItem);
      mockTabsRepository.save.mockResolvedValue(tab);

      await service.updateItemQuantity('tab-1', 'item-1', 3, 'est-1');

      expect(mockTabItemsRepository.save).toHaveBeenCalled();
    });
  });

  describe('getAvailableMonths', () => {
    it('deve retornar meses disponíveis', async () => {
      const tabs = [
        {
          closed_at: new Date('2024-01-15'),
        },
        {
          closed_at: new Date('2024-02-20'),
        },
      ];

      const expenses = [
        { year: 2024, month: 1 },
        { year: 2024, month: 2 },
      ];

      mockTabsRepository.find.mockResolvedValue(tabs);
      mockExpensesService.findByEstablishment.mockResolvedValue(expenses);

      const result = await service.getAvailableMonths('est-1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getConsumptionReport', () => {
    it('deve retornar relatório de consumo', async () => {
      const tabs = [
        {
          id: 'tab-1',
          total: '100',
          tabItems: [
            {
              item: { name: 'Item 1' },
              qty: 2,
              total: '50',
            },
          ],
          payments: [
            {
              method: PaymentMethod.CASH,
              amount: '100',
            },
          ],
        },
      ];

      const expenses = [];

      mockTabsRepository.find.mockResolvedValue(tabs);
      mockExpensesService.findByPeriod.mockResolvedValue(expenses);

      const result = await service.getConsumptionReport(2024, 1, 'est-1');

      expect(result).toBeDefined();
    });
  });
});

