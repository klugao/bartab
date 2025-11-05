import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function TermosUso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Voltar
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📜 Termos de Uso
          </h1>
          <p className="text-gray-600">
            Última atualização: 05 de novembro de 2025
          </p>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 prose prose-sm max-w-none">
          
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar o sistema <strong>BarTab</strong> ("Sistema", "Plataforma", "Serviço"), 
            você ("Usuário", "você") concorda em cumprir estes Termos de Uso. Se você não concordar com 
            qualquer parte destes termos, não utilize o Sistema.
          </p>

          <h2>2. Descrição do Serviço</h2>
          <p>
            O BarTab é um sistema de <strong>Ponto de Venda (PDV)</strong> destinado a estabelecimentos 
            comerciais (bares, restaurantes, lanchonetes) que oferece:
          </p>
          <ul>
            <li>✅ Gestão de mesas e contas</li>
            <li>✅ Cadastro de clientes e produtos</li>
            <li>✅ Registro de vendas e pagamentos</li>
            <li>✅ Controle de contas fiadas (pagamento posterior)</li>
            <li>✅ Relatórios de vendas e débitos</li>
          </ul>

          <h2>3. Cadastro e Conta de Usuário</h2>
          
          <h3>3.1 Requisitos</h3>
          <p>Para utilizar o Sistema, você deve:</p>
          <ul>
            <li>Ter <strong>18 anos ou mais</strong></li>
            <li>Possuir uma conta Google válida (autenticação OAuth)</li>
            <li>Fornecer informações verdadeiras e completas</li>
            <li>Ser proprietário ou responsável legal por um estabelecimento comercial</li>
          </ul>

          <h3>3.2 Responsabilidades do Usuário</h3>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
            <p className="font-semibold mb-2">Você é responsável por:</p>
            <ul className="mb-0">
              <li>✅ Manter a confidencialidade das suas credenciais</li>
              <li>✅ Todas as atividades realizadas sob sua conta</li>
              <li>✅ Notificar imediatamente sobre uso não autorizado</li>
              <li>✅ Manter seus dados de cadastro atualizados</li>
            </ul>
          </div>

          <h2>4. Uso Permitido</h2>
          <p>O Sistema deve ser utilizado <strong>exclusivamente</strong> para:</p>
          <ul>
            <li>✅ Gestão legítima de vendas do seu estabelecimento</li>
            <li>✅ Controle financeiro e de estoque</li>
            <li>✅ Registro de transações comerciais</li>
            <li>✅ Geração de relatórios gerenciais</li>
          </ul>

          <h2>5. Uso Proibido</h2>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
            <p className="font-semibold mb-2">É EXPRESSAMENTE PROIBIDO:</p>
            <ul className="mb-0 text-sm">
              <li>❌ Utilizar o Sistema para atividades ilegais</li>
              <li>❌ Tentar acessar áreas restritas ou dados de outros usuários</li>
              <li>❌ Realizar engenharia reversa ou modificar o código</li>
              <li>❌ Introduzir vírus, malware ou códigos maliciosos</li>
              <li>❌ Realizar ataques de negação de serviço (DDoS)</li>
              <li>❌ Coletar dados de outros usuários sem autorização</li>
              <li>❌ Comercializar ou revender o acesso ao Sistema</li>
              <li>❌ Utilizar bots ou automações não autorizadas</li>
              <li>❌ Violar direitos de propriedade intelectual</li>
            </ul>
          </div>

          <p className="text-red-600 font-semibold">
            ⚠️ Consequência: Violações resultarão em suspensão ou exclusão imediata da conta.
          </p>

          <h2>6. Propriedade Intelectual</h2>
          
          <h3>6.1 Direitos do Sistema</h3>
          <p>
            O BarTab, incluindo código-fonte, interface visual, logotipos, marcas e documentação, 
            é protegido por leis de propriedade intelectual.
          </p>

          <h3>6.2 Licença de Uso</h3>
          <p>
            Concedemos a você uma licença <strong>não exclusiva, intransferível e revogável</strong> para 
            utilizar o Sistema conforme estes Termos.
          </p>

          <h3>6.3 Seus Dados</h3>
          <p>
            Você mantém <strong>todos os direitos</strong> sobre os dados que inserir no Sistema 
            (clientes, produtos, vendas). Concedemos apenas o direito de processar esses dados para 
            fornecer o Serviço.
          </p>

          <h2>7. Privacidade e Proteção de Dados</h2>
          <p>
            O tratamento dos seus dados pessoais é regido pela nossa{' '}
            <a href="/politica-privacidade" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>, que faz parte integrante destes Termos.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Resumo de Privacidade:</p>
            <ul className="mb-0 text-sm">
              <li>✅ Coletamos apenas dados necessários</li>
              <li>✅ Utilizamos OAuth do Google (sem armazenar senhas)</li>
              <li>✅ Protegemos dados com criptografia</li>
              <li>✅ Você tem direitos garantidos pela LGPD</li>
            </ul>
          </div>

          <h2>8. Disponibilidade do Serviço</h2>
          
          <h3>8.1 Manutenções</h3>
          <p>O Sistema pode ficar temporariamente indisponível devido a:</p>
          <ul>
            <li>Manutenções programadas (notificadas com antecedência)</li>
            <li>Atualizações de segurança</li>
            <li>Problemas técnicos imprevistos</li>
          </ul>

          <h3>8.2 Sem Garantia de Disponibilidade</h3>
          <p>
            Embora nos esforcemos para manter o Sistema disponível 24/7,{' '}
            <strong>não garantimos</strong> disponibilidade ininterrupta ou livre de erros.
          </p>

          <h2>9. Limitação de Responsabilidade</h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
            <h4 className="font-semibold text-gray-900 mb-2">⚠️ Uso Por Sua Conta e Risco</h4>
            <p className="mb-2">
              O Sistema é fornecido <strong>"COMO ESTÁ"</strong> e <strong>"CONFORME DISPONÍVEL"</strong>, 
              sem garantias de qualquer tipo.
            </p>
            <p className="mb-0 text-sm">
              <strong>NÃO SOMOS RESPONSÁVEIS</strong> por: perda de dados, lucros cessantes, 
              interrupções no serviço, erros no Sistema, ações de terceiros, decisões comerciais 
              tomadas com base no Sistema.
            </p>
          </div>

          <h2>10. Modelo de Cobrança</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">💰 Atualmente:</p>
            <p className="mb-0">
              O Sistema é <strong>gratuito</strong> para uso. Reservamo-nos o direito de introduzir 
              planos pagos no futuro, com notificação prévia de 30 dias.
            </p>
          </div>

          <h2>11. Suspensão e Encerramento</h2>
          
          <h3>11.1 Suspensão por Violação</h3>
          <p>Podemos suspender ou encerrar sua conta se:</p>
          <ul>
            <li>Você violar estes Termos</li>
            <li>Houver suspeita de atividade fraudulenta</li>
            <li>Houver ordem judicial ou exigência legal</li>
          </ul>

          <h3>11.2 Encerramento Voluntário</h3>
          <p>Você pode encerrar sua conta através de:</p>
          <ul>
            <li>
              <a href="/privacy-settings" className="text-blue-600 hover:underline">
                Configurações de Privacidade
              </a> → Excluir Conta
            </li>
            <li>E-mail: eduardo.klug7@gmail.com</li>
          </ul>

          <h3>11.3 Efeitos do Encerramento</h3>
          <ul>
            <li>✅ Você perderá acesso ao Sistema</li>
            <li>✅ Seus dados serão excluídos conforme Política de Privacidade</li>
            <li>✅ Dados fiscais serão mantidos pelo prazo legal (5 anos)</li>
          </ul>

          <h2>12. Modificações nos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. 
            Alterações significativas serão notificadas com <strong>30 dias de antecedência</strong> por:
          </p>
          <ul>
            <li>📧 E-mail cadastrado</li>
            <li>🔔 Notificação no Sistema</li>
          </ul>

          <h2>13. Legislação Aplicável</h2>
          <p>Estes Termos são regidos pelas <strong>leis brasileiras</strong>, especialmente:</p>
          <ul>
            <li>Código Civil (Lei nº 10.406/2002)</li>
            <li>Código de Defesa do Consumidor (Lei nº 8.078/1990)</li>
            <li>Marco Civil da Internet (Lei nº 12.965/2014)</li>
            <li>LGPD (Lei nº 13.709/2018)</li>
          </ul>

          <h2>14. Contato</h2>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">📞 Para dúvidas ou suporte:</p>
            <ul className="mb-0">
              <li>📧 <strong>E-mail:</strong> eduardo.klug7@gmail.com</li>
              <li>⏱️ <strong>Prazo de resposta:</strong> 48 horas úteis</li>
            </ul>
          </div>

          <hr className="my-8" />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ✅ Declaração de Aceitação
            </h3>
            <p className="text-sm mb-0">
              <strong>Ao utilizar o Sistema BarTab, você declara que:</strong>
            </p>
            <ul className="text-sm text-left mt-2 mb-0">
              <li>✅ Leu, compreendeu e concorda com estes Termos de Uso</li>
              <li>✅ Leu e concorda com a Política de Privacidade</li>
              <li>✅ Tem capacidade legal para aceitar estes termos</li>
              <li>✅ Utilizará o Sistema apenas para fins lícitos</li>
            </ul>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            Última atualização: 05 de novembro de 2025 | Versão: 1.0
          </p>
        </div>
      </div>
    </div>
  );
}

