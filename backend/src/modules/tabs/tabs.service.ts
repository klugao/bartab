import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Tab, TabStatus } from './entities/tab.entity';
import { TabItem } from '../tab-items/entities/tab-item.entity';
import { Payment, PaymentMethod } from '../payments/entities/payment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Item } from '../items/entities/item.entity';
import { CreateTabDto } from './dto/create-tab.dto';
import { UpdateTabDto } from './dto/update-tab.dto';
import { AddItemDto } from './dto/add-item.dto';
import { AddPaymentDto } from '../payments/dto/add-payment.dto';
import { CustomersService } from '../customers/services/customers.service';
import { ItemsService } from '../items/items.service';
import { ExpensesService } from '../expenses/expenses.service';

@Injectable()
export class TabsService {
  constructor(
    @InjectRepository(Tab)
    private tabsRepository: Repository<Tab>,
    @InjectRepository(TabItem)
    private tabItemsRepository: Repository<TabItem>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private customersService: CustomersService,
    private itemsService: ItemsService,
    private expensesService: ExpensesService,
    private dataSource: DataSource,
  ) {}

  async open(createTabDto: CreateTabDto, establishmentId: string): Promise<Tab> {
    const tab = this.tabsRepository.create({
      status: TabStatus.OPEN,
      customer: createTabDto.customerId ? { id: createTabDto.customerId } : null,
      establishment_id: establishmentId,
    });
    
    return await this.tabsRepository.save(tab);
  }

  async findOpen(establishmentId: string): Promise<Tab[]> {
    return await this.tabsRepository.find({
      where: { status: TabStatus.OPEN, establishment_id: establishmentId },
      relations: ['customer', 'tabItems', 'tabItems.item'],
      order: { opened_at: 'DESC' }
    });
  }

  async findClosed(establishmentId: string, startDate?: Date, endDate?: Date): Promise<Tab[]> {
    // Por padrão, buscar apenas contas fechadas do dia atual
    if (!startDate && !endDate) {
      const today = new Date();
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    }
    
    const whereCondition: any = { status: TabStatus.CLOSED, establishment_id: establishmentId };
    
    // Se houver filtro de data, adicionar ao where
    if (startDate && endDate) {
      whereCondition.closed_at = Between(startDate, endDate);
    }
    
    return await this.tabsRepository.find({
      where: whereCondition,
      relations: ['customer', 'tabItems', 'tabItems.item', 'payments'],
      order: { closed_at: 'DESC' }
    });
  }

  async findOne(id: string, establishmentId: string): Promise<Tab> {
    const tab = await this.tabsRepository.findOne({
      where: { id, establishment_id: establishmentId },
      relations: ['customer', 'tabItems', 'tabItems.item', 'payments']
    });
    if (!tab) {
      throw new NotFoundException(`Tab com ID ${id} não encontrada`);
    }
    return tab;
  }

  async update(id: string, updateTabDto: UpdateTabDto, establishmentId: string): Promise<Tab> {
    const tab = await this.findOne(id, establishmentId);
    
    // Se customerId for null, remove o cliente
    // Se customerId for fornecido, valida e atualiza
    if (updateTabDto.customerId !== undefined) {
      if (updateTabDto.customerId === null) {
        tab.customer = null;
      } else {
        // Validar se o cliente existe
        await this.customersService.findOne(updateTabDto.customerId, establishmentId);
        tab.customer = { id: updateTabDto.customerId } as Customer;
      }
    }
    
    return await this.tabsRepository.save(tab);
  }

  async addItem(tabId: string, addItemDto: AddItemDto, establishmentId: string): Promise<TabItem> {
    const tab = await this.findOne(tabId, establishmentId);
    if (tab.status !== TabStatus.OPEN) {
      throw new BadRequestException('Não é possível adicionar itens em uma conta fechada');
    }

    const item = await this.itemsService.findOne(addItemDto.itemId, establishmentId);
    const unitPrice = addItemDto.unitPrice || item.price;
    const total = (parseFloat(unitPrice) * addItemDto.qty).toString();

    const tabItem = this.tabItemsRepository.create({
      tab: { id: tabId },
      item: { id: addItemDto.itemId },
      qty: addItemDto.qty,
      unit_price: unitPrice,
      total,
    });

    return await this.tabItemsRepository.save(tabItem);
  }

  async removeItem(tabId: string, tabItemId: string, establishmentId: string): Promise<void> {
    // Primeiro verifica se a tab pertence ao estabelecimento
    await this.findOne(tabId, establishmentId);
    
    const tabItem = await this.tabItemsRepository.findOne({
      where: { id: tabItemId, tab: { id: tabId } }
    });
    if (!tabItem) {
      throw new NotFoundException('Item não encontrado na conta');
    }

    await this.tabItemsRepository.remove(tabItem);
  }

  async updateItemQuantity(tabId: string, tabItemId: string, newQuantity: number, establishmentId: string): Promise<TabItem> {
    // Primeiro verifica se a tab pertence ao estabelecimento
    const tab = await this.findOne(tabId, establishmentId);
    
    if (tab.status !== TabStatus.OPEN) {
      throw new BadRequestException('Não é possível atualizar itens em uma conta fechada');
    }
    
    const tabItem = await this.tabItemsRepository.findOne({
      where: { id: tabItemId, tab: { id: tabId } },
      relations: ['item']
    });
    
    if (!tabItem) {
      throw new NotFoundException('Item não encontrado na conta');
    }

    // Atualizar quantidade e total
    tabItem.qty = newQuantity;
    tabItem.total = (parseFloat(tabItem.unit_price) * newQuantity).toString();

    return await this.tabItemsRepository.save(tabItem);
  }

  async calculateTotal(tabId: string): Promise<string> {
    const tabItems = await this.tabItemsRepository.find({
      where: { tab: { id: tabId } }
    });

    const total = tabItems.reduce((sum, item) => {
      return sum + parseFloat(item.total);
    }, 0);

    return total.toString();
  }

  async addPayment(tabId: string, addPaymentDto: AddPaymentDto, establishmentId: string): Promise<Payment> {
    const tab = await this.findOne(tabId, establishmentId);
    if (tab.status !== TabStatus.OPEN) {
      throw new BadRequestException('Não é possível adicionar pagamentos em uma conta fechada');
    }

    const payment = this.paymentsRepository.create({
      tab: { id: tabId },
      method: addPaymentDto.method,
      amount: addPaymentDto.amount,
      note: addPaymentDto.note,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Calcular valores atuais
    const total = await this.calculateTotal(tabId);
    const paidAmount = await this.calculatePaidAmount(tabId);
    const remaining = parseFloat(total) - parseFloat(paidAmount);

    console.log('💳 PROCESSANDO PAGAMENTO:');
    console.log('  Método:', addPaymentDto.method);
    console.log('  Valor pago:', addPaymentDto.amount);
    console.log('  Total da conta:', total);
    console.log('  Total pago (exceto LATER):', paidAmount);
    console.log('  Restante:', remaining);

    // Se for pagamento LATER, atualizar saldo devedor do cliente e fechar
    if (addPaymentDto.method === PaymentMethod.LATER && tab.customer) {
      const debtAmount = `-${remaining}`;
      console.log('🔴 PAGAMENTO FIADO TOTAL - Criando dívida:');
      console.log('  Cliente ID:', tab.customer.id);
      console.log('  Valor da dívida (negativo):', debtAmount);
      await this.customersService.updateBalanceDue(tab.customer.id, debtAmount, establishmentId);
      await this.close(tabId, establishmentId);
      console.log('✅ Dívida registrada e conta fechada');
    } 
    // Se for outro método e ainda sobrar valor, criar dívida automática do restante
    else if (remaining > 0.01) {
      console.log('⚠️ PAGAMENTO PARCIAL DETECTADO');
      
      // Se tem cliente e sobrou valor, criar dívida do restante
      if (tab.customer) {
        const debtAmount = `-${remaining}`;
        console.log('🔴 Criando dívida do valor restante:');
        console.log('  Cliente ID:', tab.customer.id);
        console.log('  Valor restante não pago:', remaining);
        console.log('  Valor da dívida (negativo):', debtAmount);
        
        // Criar pagamento LATER automático com o valor restante
        const laterPayment = this.paymentsRepository.create({
          tab: { id: tabId },
          method: PaymentMethod.LATER,
          amount: remaining.toString(),
          note: 'Pagamento parcial - restante registrado como dívida',
        });
        await this.paymentsRepository.save(laterPayment);
        console.log('💾 Pagamento LATER automático criado:', remaining);
        
        // Atualizar saldo devedor
        await this.customersService.updateBalanceDue(tab.customer.id, debtAmount, establishmentId);
        await this.close(tabId, establishmentId);
        console.log('✅ Dívida do restante registrada e conta fechada');
      } else {
        console.log('⚠️ Conta sem cliente - não pode criar dívida. Conta permanece aberta.');
      }
    } 
    // Se pagou tudo, apenas fechar
    else if (remaining <= 0.01) {
      console.log('✅ PAGAMENTO COMPLETO - Fechando conta');
      await this.close(tabId, establishmentId);
    }

    return savedPayment;
  }

  private async calculatePaidAmount(tabId: string): Promise<string> {
    const payments = await this.paymentsRepository.find({
      where: { tab: { id: tabId } }
    });

    // Não contar pagamentos do tipo LATER (fiado) como efetivamente pagos
    const total = payments.reduce((sum, payment) => {
      if (payment.method === PaymentMethod.LATER) {
        return sum; // Não adiciona pagamentos fiados
      }
      return sum + parseFloat(payment.amount);
    }, 0);

    return total.toString();
  }

  private async calculateRemainingAmount(tabId: string): Promise<string> {
    const total = await this.calculateTotal(tabId);
    const paidAmount = await this.calculatePaidAmount(tabId);
    const remaining = parseFloat(total) - parseFloat(paidAmount);
    
    console.log('📊 CALCULANDO VALOR RESTANTE:');
    console.log('  Total da conta:', total);
    console.log('  Valor pago (exceto LATER):', paidAmount);
    console.log('  Restante:', remaining);
    
    return Math.max(0, remaining).toString();
  }

  async close(tabId: string, establishmentId: string): Promise<Tab> {
    const tab = await this.findOne(tabId, establishmentId);
    tab.status = TabStatus.CLOSED;
    tab.closed_at = new Date();
    return await this.tabsRepository.save(tab);
  }

  async delete(tabId: string, establishmentId: string): Promise<void> {
    console.log('TabsService.delete - Iniciando exclusão da conta:', tabId);
    
    // Buscar a conta para verificar se existe
    const tab = await this.findOne(tabId, establishmentId);
    console.log('TabsService.delete - Conta encontrada:', { id: tab.id, status: tab.status });
    
    // Verificar se a conta pode ser excluída (deve estar vazia)
    if (tab.tabItems && tab.tabItems.length > 0) {
      throw new BadRequestException('Não é possível excluir uma conta que possui itens. Remova todos os itens primeiro.');
    }
    
    if (tab.payments && tab.payments.length > 0) {
      throw new BadRequestException('Não é possível excluir uma conta que possui pagamentos.');
    }
    
    // Excluir a conta
    await this.tabsRepository.remove(tab);
    console.log('TabsService.delete - Conta excluída com sucesso:', tabId);
  }

  async getAvailableMonths(establishmentId: string) {
    console.log('TabsService.getAvailableMonths - Buscando meses disponíveis');
    
    // Buscar todas as tabs fechadas do estabelecimento
    const tabs = await this.tabsRepository.find({
      where: {
        status: TabStatus.CLOSED,
        establishment_id: establishmentId,
      },
      select: ['closed_at'],
      order: { closed_at: 'DESC' },
    });
    
    // Também buscar despesas do estabelecimento
    const allExpenses = await this.expensesService.findByEstablishment(establishmentId);
    
    console.log('TabsService.getAvailableMonths - Tabs encontradas:', tabs.length);
    console.log('TabsService.getAvailableMonths - Despesas encontradas:', allExpenses.length);
    
    // Criar um Set para armazenar os meses únicos no formato "YYYY-MM"
    const monthsSet = new Set<string>();
    
    // Adicionar meses das tabs fechadas
    for (const tab of tabs) {
      if (tab.closed_at) {
        const year = tab.closed_at.getFullYear();
        const month = String(tab.closed_at.getMonth() + 1).padStart(2, '0');
        monthsSet.add(`${year}-${month}`);
      }
    }
    
    // Adicionar meses das despesas
    for (const expense of allExpenses) {
      const year = expense.year;
      const month = String(expense.month).padStart(2, '0');
      monthsSet.add(`${year}-${month}`);
    }
    
    // Converter para array e ordenar (do mais recente para o mais antigo)
    const months = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
    
    console.log('TabsService.getAvailableMonths - Meses únicos encontrados:', months.length);
    
    // Converter para formato mais detalhado
    return months.map(monthStr => {
      const [year, month] = monthStr.split('-');
      return {
        year: parseInt(year),
        month: parseInt(month),
        value: monthStr,
      };
    });
  }

  async getConsumptionReport(year: number, month: number, establishmentId: string) {
    console.log('TabsService.getConsumptionReport - Buscando relatório para:', { year, month });
    
    // Criar datas de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    console.log('TabsService.getConsumptionReport - Período:', { startDate, endDate });
    
    // Buscar todas as tabs fechadas no período
    const tabs = await this.tabsRepository.find({
      where: {
        status: TabStatus.CLOSED,
        closed_at: Between(startDate, endDate),
        establishment_id: establishmentId,
      },
      relations: ['tabItems', 'tabItems.item'],
    });
    
    console.log('TabsService.getConsumptionReport - Tabs encontradas:', tabs.length);
    
    // Agrupar itens por ID e somar quantidade e valor
    const itemsMap = new Map<string, {
      id: string;
      name: string;
      quantity: number;
      totalValue: number;
    }>();
    
    for (const tab of tabs) {
      for (const tabItem of tab.tabItems) {
        const itemId = tabItem.item.id;
        const existing = itemsMap.get(itemId);
        
        if (existing) {
          existing.quantity += tabItem.qty;
          existing.totalValue += parseFloat(tabItem.total);
        } else {
          itemsMap.set(itemId, {
            id: itemId,
            name: tabItem.item.name,
            quantity: tabItem.qty,
            totalValue: parseFloat(tabItem.total),
          });
        }
      }
    }
    
    // Converter para array e ordenar por quantidade (do maior para o menor)
    const items = Array.from(itemsMap.values()).sort((a, b) => b.quantity - a.quantity);
    
    // Calcular o total faturado (receita de vendas)
    const totalRevenue = items.reduce((sum, item) => sum + item.totalValue, 0);
    
    // Buscar despesas do período
    const expenses = await this.expensesService.findByPeriod(year, month, establishmentId);
    
    // Calcular o total gasto (despesas)
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Calcular o lucro
    const profit = totalRevenue - totalExpenses;
    
    console.log('TabsService.getConsumptionReport - Itens processados:', items.length);
    console.log('TabsService.getConsumptionReport - Total faturado:', totalRevenue);
    console.log('TabsService.getConsumptionReport - Total gasto:', totalExpenses);
    console.log('TabsService.getConsumptionReport - Lucro:', profit);
    
    return {
      year,
      month,
      items,
      expenses,
      totalRevenue,
      totalExpenses,
      profit,
    };
  }
}
