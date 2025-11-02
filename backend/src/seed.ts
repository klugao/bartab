import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomersService } from './modules/customers/services/customers.service';
import { ItemsService } from './modules/items/items.service';

// NOTA: Este seed foi desabilitado porque agora requer autenticação
// e um establishment_id. Use o sistema web para criar clientes e itens
// após fazer login.

async function seed() {
  console.log('⚠️  Seed desabilitado - Use o sistema web para criar dados após login');
  console.log('O sistema agora requer autenticação e cada usuário pertence a um estabelecimento.');
  
  /*
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const customersService = app.get(CustomersService);
  const itemsService = app.get(ItemsService);

  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // FIXME: Agora é necessário um establishmentId
    const ESTABLISHMENT_ID = 'seu-establishment-id-aqui';
    
    // Criar clientes
    const customers = [
      { name: 'João Silva', phone: '(11) 99999-9999', email: 'joao@email.com' },
      { name: 'Maria Santos', phone: '(11) 88888-8888', email: 'maria@email.com' },
      { name: 'Pedro Costa', phone: '(11) 77777-7777', email: 'pedro@email.com' },
    ];

    for (const customerData of customers) {
      await customersService.create(customerData, ESTABLISHMENT_ID);
      console.log(`✅ Cliente criado: ${customerData.name}`);
    }

    // Criar itens
    const items = [
      { name: 'Cerveja Heineken', price: 8.5 },
      { name: 'Refrigerante Coca-Cola', price: 6.0 },
      { name: 'Água Mineral', price: 4.0 },
      { name: 'Batata Frita', price: 12.0 },
      { name: 'Hambúrguer', price: 18.0 },
      { name: 'Pizza Margherita', price: 25.0 },
    ];

    for (const itemData of items) {
      await itemsService.create(itemData, ESTABLISHMENT_ID);
      console.log(`✅ Item criado: ${itemData.name} - R$ ${itemData.price}`);
    }

    console.log('🎉 Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await app.close();
  }
  */
}

seed();