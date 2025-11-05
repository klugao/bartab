import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { TabStatus } from '../../tabs/entities/tab.entity';
import { Payment, PaymentMethod } from '../../payments/entities/payment.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, establishmentId: string): Promise<Customer> {
    try {
      const customer = this.customersRepository.create({
        ...createCustomerDto,
        balance_due: '0', // Garantir que balance_due seja inicializado
        establishment_id: establishmentId,
      });
      const savedCustomer = await this.customersRepository.save(customer);
      // Log sem dados pessoais (LGPD)
      console.log('Cliente criado com sucesso', { customerId: savedCustomer.id });
      return savedCustomer;
    } catch (error) {
      console.error('Erro ao criar cliente:', error.message);
      throw error;
    }
  }

  async findAll(establishmentId: string): Promise<any[]> {
    const customers = await this.customersRepository.find({
      where: { establishment_id: establishmentId },
      order: { name: 'ASC' }
    });
    
    // Adicionar campo calculado days_in_negative_balance
    return customers.map(customer => this.addDaysInNegativeBalance(customer));
  }

  private addDaysInNegativeBalance(customer: Customer): any {
    let days_in_negative_balance: number | null = null;
    
    if (customer.negative_balance_since) {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - customer.negative_balance_since.getTime());
      days_in_negative_balance = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return {
      ...customer,
      days_in_negative_balance
    };
  }

  async findOne(id: string, establishmentId: string): Promise<any> {
    const customer = await this.customersRepository.findOne({ 
      where: { id, establishment_id: establishmentId } 
    });
    if (!customer) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return this.addDaysInNegativeBalance(customer);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, establishmentId: string): Promise<any> {
    const customerData = await this.findOne(id, establishmentId);
    // findOne já retorna com days_in_negative_balance, então precisamos pegar a entidade real
    const customer = await this.customersRepository.findOne({ 
      where: { id, establishment_id: establishmentId } 
    });
    if (!customer) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    Object.assign(customer, updateCustomerDto);
    const updated = await this.customersRepository.save(customer);
    return this.addDaysInNegativeBalance(updated);
  }

  async remove(id: string, establishmentId: string): Promise<void> {
    const customer = await this.customersRepository.findOne({ 
      where: { id, establishment_id: establishmentId } 
    });
    if (!customer) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    await this.customersRepository.remove(customer);
  }

  async updateBalanceDue(id: string, amount: string, establishmentId: string): Promise<void> {
    const customer = await this.customersRepository.findOne({ 
      where: { id, establishment_id: establishmentId } 
    });
    if (!customer) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    
    const currentBalance = parseFloat(customer.balance_due || '0');
    const amountToAdd = parseFloat(amount);
    const newBalance = currentBalance + amountToAdd;
    
    console.log('💰 ATUALIZANDO SALDO DO CLIENTE:');
    console.log('  Cliente:', customer.name);
    console.log('  Saldo atual:', currentBalance);
    console.log('  Valor a adicionar:', amountToAdd);
    console.log('  Novo saldo:', newBalance);
    
    // Gerenciar negative_balance_since
    const wasNegative = currentBalance < 0;
    const isNowNegative = newBalance < 0;
    
    if (!wasNegative && isNowNegative) {
      // Ficou negativo agora - registrar a data
      customer.negative_balance_since = new Date();
      console.log('🔴 Cliente entrou em saldo negativo:', customer.negative_balance_since);
    } else if (wasNegative && !isNowNegative) {
      // Voltou a zero ou positivo - resetar
      customer.negative_balance_since = undefined;
      console.log('✅ Cliente saiu do saldo negativo');
    }
    
    customer.balance_due = newBalance.toString();
    await this.customersRepository.save(customer);
    
    console.log('✅ Saldo atualizado no banco:', customer.balance_due);
  }

  async findCustomersWithDebts(establishmentId: string): Promise<Customer[]> {
    console.log('🔍 BUSCANDO CLIENTES COM DÍVIDAS...');
    
    // Buscar clientes com balance_due negativo (que devem dinheiro)
    const customers = await this.customersRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.tabs', 'tabs')
      .leftJoinAndSelect('tabs.tabItems', 'tabItems')
      .leftJoinAndSelect('tabItems.item', 'item')
      .leftJoinAndSelect('tabs.payments', 'payments')
      .where('customer.establishment_id = :establishmentId', { establishmentId })
      .andWhere('CAST(customer.balance_due AS DECIMAL) < 0')
      .orderBy('customer.name', 'ASC')
      .getMany();
    
    console.log(`📋 Encontrados ${customers.length} cliente(s) com balance_due < 0`);
    customers.forEach(c => {
      console.log(`  - ${c.name}: balance_due = ${c.balance_due}`);
    });
    
    // Filtrar apenas contas fechadas e calcular se realmente tem saldo devedor
    const customersWithDebts = customers.map(customer => {
      // Filtrar apenas contas fechadas
      const closedTabs = customer.tabs?.filter(tab => tab.status === TabStatus.CLOSED) || [];
      
      // Calcular saldo devedor de cada conta
      const tabsWithDebt = closedTabs.filter(tab => {
        const total = tab.tabItems?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0;
        // NÃO contar pagamentos LATER como efetivamente pagos (consistente com tabs.service.ts)
        const paid = tab.payments?.reduce((sum, payment) => {
          if (payment.method === 'LATER') {
            return sum; // Não adiciona pagamentos fiados ao cálculo de "pago"
          }
          return sum + parseFloat(payment.amount);
        }, 0) || 0;
        
        const hasDebt = total > paid;
        if (hasDebt) {
          console.log(`📊 Conta ${tab.id}:`, { total, paid, remaining: total - paid });
        }
        return hasDebt;
      });
      
      return {
        ...customer,
        tabs: tabsWithDebt
      };
    }).filter(customer => customer.tabs.length > 0); // Só retornar clientes que têm contas com dívida
    
    console.log(`✅ Retornando ${customersWithDebts.length} cliente(s) com contas em dívida`);
    customersWithDebts.forEach(c => {
      console.log(`  ✓ ${c.name}: ${c.tabs.length} conta(s) com saldo devedor`);
    });
    
    return customersWithDebts;
  }

  async payDebt(id: string, amount: string, method: string, establishmentId: string, note?: string): Promise<any> {
    const customer = await this.customersRepository.findOne({
      where: { id, establishment_id: establishmentId },
      relations: ['tabs', 'tabs.tabItems', 'tabs.payments']
    });
    
    if (!customer) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    
    const currentBalance = parseFloat(customer.balance_due || '0');
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount <= 0) {
      throw new Error('O valor do pagamento deve ser maior que zero');
    }
    
    console.log('💳 PAGAMENTO DE DÍVIDA:');
    console.log('  Cliente:', customer.name);
    console.log('  Saldo devedor atual:', currentBalance);
    console.log('  Valor do pagamento:', paymentAmount);
    console.log('  Método:', method);
    
    // Se o pagamento for maior que a dívida, pagar apenas o valor da dívida
    const actualPayment = Math.min(paymentAmount, Math.abs(currentBalance));
    
    // Buscar contas fechadas com dívida (ordenadas pela mais antiga)
    const closedTabsWithDebt = customer.tabs
      ?.filter(tab => tab.status === TabStatus.CLOSED)
      .map(tab => {
        const total = tab.tabItems?.reduce((sum, item) => sum + parseFloat(item.total), 0) || 0;
        const paid = tab.payments?.reduce((sum, payment) => {
          if (payment.method === PaymentMethod.LATER) {
            return sum; // Não conta pagamentos LATER como efetivamente pagos
          }
          return sum + parseFloat(payment.amount);
        }, 0) || 0;
        const remaining = total - paid;
        
        return {
          tab,
          total,
          paid,
          remaining,
          hasDebt: remaining > 0.01
        };
      })
      .filter(item => item.hasDebt)
      .sort((a, b) => new Date(a.tab.closed_at || a.tab.opened_at).getTime() - new Date(b.tab.closed_at || b.tab.opened_at).getTime()) || [];
    
    console.log(`  📋 Encontradas ${closedTabsWithDebt.length} conta(s) com dívida`);
    
    // Distribuir o pagamento entre as contas com dívida (começando pelas mais antigas)
    let remainingPayment = actualPayment;
    
    for (const tabInfo of closedTabsWithDebt) {
      if (remainingPayment <= 0.01) break;
      
      const paymentForThisTab = Math.min(remainingPayment, tabInfo.remaining);
      
      console.log(`  💰 Aplicando R$ ${paymentForThisTab.toFixed(2)} na conta ${tabInfo.tab.id}`);
      
      // Criar registro de pagamento nesta conta
      const payment = this.paymentsRepository.create({
        tab: { id: tabInfo.tab.id },
        method: method as PaymentMethod,
        amount: paymentForThisTab.toString(),
        note: note || 'Pagamento de dívida registrado',
      });
      
      await this.paymentsRepository.save(payment);
      console.log(`  ✅ Pagamento registrado na conta ${tabInfo.tab.id}`);
      
      remainingPayment -= paymentForThisTab;
    }
    
    // Atualizar saldo devedor do cliente e gerenciar negative_balance_since
    const newBalance = currentBalance + actualPayment;
    const wasNegative = currentBalance < 0;
    const isNowNegative = newBalance < 0;
    
    if (wasNegative && !isNowNegative) {
      // Voltou a zero ou positivo - resetar
      customer.negative_balance_since = undefined;
      console.log('✅ Cliente saiu do saldo negativo');
    }
    
    customer.balance_due = newBalance.toString();
    const updated = await this.customersRepository.save(customer);
    
    console.log(`  ✅ Novo saldo devedor: ${newBalance.toFixed(2)}`);
    
    return this.addDaysInNegativeBalance(updated);
  }
}
