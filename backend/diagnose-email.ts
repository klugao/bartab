#!/usr/bin/env ts-node

/**
 * 🔍 Script de Diagnóstico de Email
 * 
 * Este script testa a configuração de email e identifica problemas.
 * 
 * USO:
 * 1. Em desenvolvimento:
 *    npx ts-node diagnose-email.ts
 * 
 * 2. Em produção (via Render Shell):
 *    - Dashboard > bartab-backend > Shell
 *    - Execute: node diagnose-email.js
 */

import { ConfigService } from '@nestjs/config';
import { NotificationService } from './src/modules/notification/notification.service';
import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';

// Carrega variáveis de ambiente
dotenv.config();

const configService = new ConfigService();

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 DIAGNÓSTICO DE CONFIGURAÇÃO DE EMAIL - BARTAB');
console.log('═══════════════════════════════════════════════════════\n');

// Função auxiliar para mascarar credenciais
function maskCredential(value: string | undefined): string {
  if (!value) return '❌ NÃO CONFIGURADO';
  if (value.length < 4) return '⚠️ MUITO CURTO';
  return `✅ ${value.substring(0, 3)}${'*'.repeat(value.length - 6)}${value.substring(value.length - 3)}`;
}

// 1. Verificar variáveis de ambiente
console.log('📋 ETAPA 1: Verificando Variáveis de Ambiente');
console.log('─────────────────────────────────────────────────────\n');

const smtpHost = configService.get<string>('SMTP_HOST');
const smtpPort = configService.get<number>('SMTP_PORT');
const smtpUser = configService.get<string>('SMTP_USER');
const smtpPass = configService.get<string>('SMTP_PASS');
const smtpFrom = configService.get<string>('SMTP_FROM');
const frontendUrl = configService.get<string>('FRONTEND_URL');

console.log('   SMTP_HOST:', smtpHost || '❌ NÃO CONFIGURADO');
console.log('   SMTP_PORT:', smtpPort || '❌ NÃO CONFIGURADO');
console.log('   SMTP_USER:', maskCredential(smtpUser));
console.log('   SMTP_PASS:', maskCredential(smtpPass));
console.log('   SMTP_FROM:', smtpFrom || '❌ NÃO CONFIGURADO');
console.log('   FRONTEND_URL:', frontendUrl || '❌ NÃO CONFIGURADO');
console.log('');

// Verificar se todas as variáveis críticas estão configuradas
const criticalVars = {
  SMTP_USER: smtpUser,
  SMTP_PASS: smtpPass,
};

let hasErrors = false;
const errors: string[] = [];

for (const [key, value] of Object.entries(criticalVars)) {
  if (!value) {
    errors.push(`❌ ${key} não está configurado`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.log('❌ ERRO: Variáveis críticas não configuradas:\n');
  errors.forEach(err => console.log(`   ${err}`));
  console.log('\n📝 Como corrigir:\n');
  console.log('   1. No Render Dashboard:');
  console.log('      - Vá em Environment');
  console.log('      - Adicione as variáveis faltantes');
  console.log('      - Clique em "Save Changes"\n');
  console.log('   2. Em desenvolvimento local:');
  console.log('      - Edite o arquivo .env');
  console.log('      - Adicione as variáveis faltantes');
  console.log('      - Reinicie o servidor\n');
  process.exit(1);
}

console.log('✅ Todas as variáveis críticas estão configuradas!\n');

// 2. Testar conexão SMTP
console.log('📋 ETAPA 2: Testando Conexão SMTP');
console.log('─────────────────────────────────────────────────────\n');

async function testSmtpConnection(): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    host: smtpHost || 'smtp.gmail.com',
    port: smtpPort || 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    console.log('   Conectando ao servidor SMTP...');
    await transporter.verify();
    console.log('   ✅ Conexão SMTP bem-sucedida!\n');
    return true;
  } catch (error: any) {
    console.log('   ❌ ERRO ao conectar ao SMTP:\n');
    console.log(`   Mensagem: ${error.message}\n`);
    
    // Diagnóstico específico baseado no erro
    if (error.message.includes('Invalid login')) {
      console.log('   🔍 DIAGNÓSTICO: Credenciais inválidas');
      console.log('   📝 Soluções possíveis:');
      console.log('      1. Verifique se SMTP_USER está correto');
      console.log('      2. Gere uma nova "Senha de App" no Gmail:');
      console.log('         https://myaccount.google.com/apppasswords');
      console.log('      3. Certifique-se que a "Verificação em 2 etapas" está ativa');
      console.log('      4. Atualize SMTP_PASS com a nova senha (16 dígitos)\n');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      console.log('   🔍 DIAGNÓSTICO: Não foi possível conectar ao servidor');
      console.log('   📝 Soluções possíveis:');
      console.log('      1. Verifique SMTP_HOST e SMTP_PORT');
      console.log('      2. Verifique se o firewall está bloqueando a porta 587');
      console.log('      3. Tente usar porta 465 (SMTP_PORT=465, secure=true)\n');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('   🔍 DIAGNÓSTICO: Servidor SMTP não encontrado');
      console.log('   📝 Solução: Verifique se SMTP_HOST está correto\n');
    }
    
    return false;
  }
}

// 3. Testar envio de email
async function testEmailSending(): Promise<boolean> {
  console.log('📋 ETAPA 3: Testando Envio de Email');
  console.log('─────────────────────────────────────────────────────\n');

  const notificationService = new NotificationService(configService);
  
  try {
    console.log('   Enviando email de teste para eduardo.klug7@gmail.com...');
    
    await notificationService.sendAdminNewSignupAlert(
      'Bar de Teste - Script de Diagnóstico',
      'diagnostico@teste.com'
    );
    
    console.log('   ✅ Email enviado com sucesso!\n');
    console.log('   📧 Verifique a caixa de entrada (e spam) de eduardo.klug7@gmail.com\n');
    return true;
  } catch (error: any) {
    console.log('   ❌ ERRO ao enviar email:\n');
    console.log(`   Mensagem: ${error.message}\n`);
    return false;
  }
}

// 4. Executar diagnóstico completo
async function runDiagnostic() {
  try {
    const smtpOk = await testSmtpConnection();
    
    if (!smtpOk) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ DIAGNÓSTICO FALHOU');
      console.log('═══════════════════════════════════════════════════════');
      console.log('\nResolva os problemas acima e execute o diagnóstico novamente.\n');
      process.exit(1);
    }
    
    const emailOk = await testEmailSending();
    
    console.log('═══════════════════════════════════════════════════════');
    if (emailOk) {
      console.log('✅ DIAGNÓSTICO CONCLUÍDO COM SUCESSO!');
      console.log('═══════════════════════════════════════════════════════');
      console.log('\n✨ Tudo está configurado corretamente!');
      console.log('   Os emails devem ser enviados normalmente.\n');
      console.log('📝 Se ainda não receber emails:');
      console.log('   1. Verifique a pasta de SPAM');
      console.log('   2. Adicione noreply@bartab.com aos contatos');
      console.log('   3. Verifique os logs do servidor\n');
    } else {
      console.log('⚠️ DIAGNÓSTICO PARCIAL');
      console.log('═══════════════════════════════════════════════════════');
      console.log('\n⚠️ Conexão SMTP OK, mas envio de email falhou.');
      console.log('   Verifique os erros acima para mais detalhes.\n');
    }
  } catch (error: any) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('❌ ERRO CRÍTICO NO DIAGNÓSTICO');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Erro: ${error.message}`);
    console.log(`\nStack trace:\n${error.stack}\n`);
    process.exit(1);
  }
}

// Executar
runDiagnostic();

