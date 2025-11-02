/**
 * Script de teste para verificar configuração de e-mail
 * 
 * Uso:
 *   npx ts-node test-email.ts
 */

import { NotificationService } from './src/modules/notification/notification.service';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const configService = new ConfigService();
const notificationService = new NotificationService(configService);

async function testAdminAlert() {
  console.log('📧 Testando envio de alerta para admin...');
  console.log('Para:', 'eduardo.klug7@gmail.com');
  console.log('');
  
  try {
    await notificationService.sendAdminNewSignupAlert(
      'Bar de Teste - Script',
      'teste@example.com'
    );
    console.log('✅ E-mail de alerta enviado com sucesso!');
    console.log('   Verifique a caixa de entrada de eduardo.klug7@gmail.com');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de alerta:', error.message);
    return false;
  }
}

async function testApprovalEmail() {
  console.log('\n📧 Testando envio de e-mail de aprovação...');
  
  const testEmail = process.argv[2] || 'seu-email-teste@gmail.com';
  console.log('Para:', testEmail);
  console.log('');
  
  try {
    await notificationService.sendApprovalEmail(
      testEmail,
      'Bar de Teste - Script'
    );
    console.log('✅ E-mail de aprovação enviado com sucesso!');
    console.log(`   Verifique a caixa de entrada de ${testEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de aprovação:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 ========================================');
  console.log('   Teste de Configuração de E-mail');
  console.log('   Sistema BarTab RBAC');
  console.log('========================================\n');
  
  // Verificar configuração
  console.log('📋 Verificando configuração...');
  console.log('   SMTP_HOST:', configService.get('SMTP_HOST') || '❌ NÃO CONFIGURADO');
  console.log('   SMTP_PORT:', configService.get('SMTP_PORT') || '❌ NÃO CONFIGURADO');
  console.log('   SMTP_USER:', configService.get('SMTP_USER') || '❌ NÃO CONFIGURADO');
  console.log('   SMTP_PASS:', configService.get('SMTP_PASS') ? '✅ Configurado' : '❌ NÃO CONFIGURADO');
  console.log('');
  
  if (!configService.get('SMTP_USER') || !configService.get('SMTP_PASS')) {
    console.error('❌ Erro: Configure as variáveis SMTP no arquivo .env');
    console.log('\nVariáveis necessárias:');
    console.log('  SMTP_HOST=smtp.gmail.com');
    console.log('  SMTP_PORT=587');
    console.log('  SMTP_USER=seu-email@gmail.com');
    console.log('  SMTP_PASS=<sua-senha-de-app-aqui>');
    console.log('\n⚠️  IMPORTANTE: Nunca faça commit de credenciais reais!');
    console.log('   Use o arquivo .env (já está no .gitignore)');
    process.exit(1);
  }
  
  // Teste 1: Alerta para admin
  const test1 = await testAdminAlert();
  
  // Aguarda 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Teste 2: E-mail de aprovação
  const test2 = await testApprovalEmail();
  
  console.log('\n========================================');
  console.log('📊 Resultado dos Testes:');
  console.log('   Alerta Admin:', test1 ? '✅ OK' : '❌ FALHOU');
  console.log('   E-mail Aprovação:', test2 ? '✅ OK' : '❌ FALHOU');
  console.log('========================================\n');
  
  if (test1 && test2) {
    console.log('🎉 Todos os testes passaram!');
    console.log('   O sistema de e-mail está configurado corretamente.');
  } else {
    console.log('⚠️  Alguns testes falharam.');
    console.log('   Verifique a configuração SMTP no arquivo .env');
  }
}

// Executar
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

