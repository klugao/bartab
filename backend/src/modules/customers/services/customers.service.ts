import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { TabStatus } from '../../tabs/entities/tab.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, establishmentId: string): Promise<Customer> {
    try {
      console.log('CustomersService.create - DTO recebido:', createCustomerDto);
      const customer = this.customersRepository.create({
        ...createCustomerDto,
        balance_due: '0', // Garantir que balance_due seja inicializado
        establishment_id: establishmentId,
      });
      console.log('CustomersService.create - Entidade criada:', customer);
      const savedCustomer = await this.customersRepository.save(customer);
      console.log('CustomersService.create - Cliente salvo:', savedCustomer);
      return savedCustomer;
    } catch (error) {
      console.error('CustomersService.create - Erro:', error);
      throw error;
    }
  }

  async findAll(establishmentId: string): Promise<Customer[]> {
    return await this.customersRepository.find({
      where: { establishment_id: establishmentId },
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string, establishmentId: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ 
      where: { id, establishment_id: establishmentId } 
    });
    if (!customer) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, establishmentId: string): Promise<Customer> {
    const customer = await this.findOne(id, establishmentId);
    Object.assign(customer, updateCustomerDto);
    return await this.customersRepository.save(customer);
  }

  async remove(id: string, establishmentId: string): Promise<void> {
    const customer = await this.findOne(id, establishmentId);
    await this.customersRepository.remove(customer);
  }

  async updateBalanceDue(id: string, amount: string, establishmentId: string): Promise<void> {
    const customer = await this.findOne(id, establishmentId);
    const currentBalance = parseFloat(customer.balance_due || '0');
    const amountToAdd = parseFloat(amount);
    const newBalance = currentBalance + amountToAdd;
    
    console.log('💰 ATUALIZANDO SALDO DO CLIENTE:');
    console.log('  Cliente:', customer.name);
    console.log('  Saldo atual:', currentBalance);
    console.log('  Valor a adicionar:', amountToAdd);
    console.log('  Novo saldo:', newBalance);
    
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

  async payDebt(id: string, amount: string, establishmentId: string): Promise<Customer> {
    const customer = await this.findOne(id, establishmentId);
    const currentBalance = parseFloat(customer.balance_due || '0');
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount <= 0) {
      throw new Error('O valor do pagamento deve ser maior que zero');
    }
    
    // Se o pagamento for maior que a dívida, pagar apenas o valor da dívida
    const actualPayment = Math.min(paymentAmount, Math.abs(currentBalance));
    const newBalance = currentBalance + actualPayment;
    
    customer.balance_due = newBalance.toString();
    return await this.customersRepository.save(customer);
  }
}
