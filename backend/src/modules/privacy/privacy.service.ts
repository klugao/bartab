import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Establishment } from '../auth/entities/establishment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Tab } from '../tabs/entities/tab.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Item } from '../items/entities/item.entity';

@Injectable()
export class PrivacyService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Establishment)
    private establishmentRepository: Repository<Establishment>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Tab)
    private tabRepository: Repository<Tab>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  /**
   * LGPD Art. 18, I e V - Exporta todos os dados do usuário
   */
  async exportUserData(userId: string, establishmentId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['establishment'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const establishment = await this.establishmentRepository.findOne({
      where: { id: establishmentId },
    });

    const customers = await this.customerRepository.find({
      where: { establishment_id: establishmentId },
      order: { name: 'ASC' },
    });

    const tabs = await this.tabRepository.find({
      where: { establishment_id: establishmentId },
      relations: ['customer', 'tabItems', 'payments'],
      order: { created_at: 'DESC' },
    });

    const items = await this.itemRepository.find({
      where: { establishment_id: establishmentId },
      order: { name: 'ASC' },
    });

    return {
      export_info: {
        exported_at: new Date().toISOString(),
        export_version: '1.0',
        format: 'JSON',
        lgpd_reference: 'Art. 18, I e V - Lei 13.709/2018',
      },
      user_data: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        active: user.active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      establishment_data: establishment ? {
        id: establishment.id,
        name: establishment.name,
        email: establishment.email,
        phone: establishment.phone,
        address: establishment.address,
        status_aprovacao: establishment.statusAprovacao,
        created_at: establishment.created_at,
        updated_at: establishment.updated_at,
      } : null,
      customers_data: customers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        balance_due: c.balance_due,
        negative_balance_since: c.negative_balance_since,
        created_at: c.created_at,
        updated_at: c.updated_at,
      })),
      items_data: items.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        active: i.active,
        created_at: i.created_at,
        updated_at: i.updated_at,
      })),
      sales_history: tabs.map(t => ({
        id: t.id,
        name: t.name,
        status: t.status,
        total: t.total,
        customer: t.customer ? {
          name: t.customer.name,
          phone: t.customer.phone,
        } : null,
        items: t.tabItems?.map(ti => ({
          item_name: ti.name,
          quantity: ti.qty,
          unit_price: ti.unit_price,
          total: ti.total,
        })) || [],
        payments: t.payments?.map(p => ({
          method: p.method,
          amount: p.amount,
          created_at: p.created_at,
        })) || [],
        created_at: t.created_at,
        closed_at: t.closed_at,
      })),
      statistics: {
        total_customers: customers.length,
        total_items: items.length,
        total_tabs: tabs.length,
        total_sales_value: tabs.reduce((sum, tab) => sum + parseFloat(tab.total || '0'), 0),
      },
      data_retention_info: {
        active_data: 'Mantido enquanto a conta estiver ativa',
        after_deletion: 'Backup mantido por 30 dias',
        fiscal_data: 'Dados fiscais anonimizados mantidos por 5 anos conforme legislação',
      },
      your_rights: {
        access: 'Você está exercendo este direito agora ao exportar seus dados',
        correction: 'Você pode corrigir seus dados através das páginas de edição',
        deletion: 'Você pode excluir sua conta através da opção "Excluir Conta"',
        portability: 'Este arquivo JSON pode ser importado em outros sistemas',
        revocation: 'Você pode revogar seu consentimento a qualquer momento nas configurações',
      },
    };
  }

  /**
   * LGPD Art. 18, VI - Exclui conta do usuário e dados associados
   * Mantém dados fiscais anonimizados por 5 anos conforme legislação
   */
  async deleteUserAccount(userId: string, establishmentId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['establishment'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se há débitos pendentes
    const customersWithDebt = await this.customerRepository.find({
      where: { establishment_id: establishmentId },
    });

    const totalDebt = customersWithDebt.reduce(
      (sum, customer) => sum + parseFloat(customer.balance_due || '0'),
      0
    );

    if (totalDebt > 0) {
      throw new BadRequestException(
        `Não é possível excluir a conta pois há R$ ${totalDebt.toFixed(2)} em débitos pendentes. ` +
        'Regularize a situação ou entre em contato com o suporte.'
      );
    }

    // Anonimizar dados fiscais (manter por 5 anos conforme legislação)
    const tabs = await this.tabRepository.find({
      where: { establishment_id: establishmentId },
    });

    for (const tab of tabs) {
      // Anonimizar mas manter estrutura para fins fiscais
      tab.name = `CONTA_ANONIMIZADA_${tab.id.substring(0, 8)}`;
      await this.tabRepository.save(tab);
    }

    // Anonimizar clientes
    const customers = await this.customerRepository.find({
      where: { establishment_id: establishmentId },
    });

    for (const customer of customers) {
      customer.name = `CLIENTE_ANONIMIZADO_${customer.id.substring(0, 8)}`;
      customer.phone = null;
      await this.customerRepository.save(customer);
    }

    // Excluir itens (não são dados pessoais nem fiscais críticos)
    await this.itemRepository.delete({ establishment_id: establishmentId });

    // Anonimizar estabelecimento
    const establishment = await this.establishmentRepository.findOne({
      where: { id: establishmentId },
    });

    if (establishment) {
      establishment.name = `ESTABELECIMENTO_EXCLUIDO_${establishmentId.substring(0, 8)}`;
      establishment.email = `excluido_${establishmentId.substring(0, 8)}@anonimizado.local`;
      establishment.phone = null;
      establishment.address = null;
      await this.establishmentRepository.save(establishment);
    }

    // Excluir usuário (após anonimizar estabelecimento)
    await this.userRepository.remove(user);

    // Log da exclusão (sem dados pessoais)
    console.log(`Conta excluída - LGPD Art. 18, VI - UserID: ${userId.substring(0, 8)}... - Data: ${new Date().toISOString()}`);

    return {
      success: true,
      message: 'Conta excluída com sucesso',
      note: 'Dados fiscais foram anonimizados e serão mantidos pelo prazo legal'
    };
  }
}

