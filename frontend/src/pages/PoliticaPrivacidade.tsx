import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function PoliticaPrivacidade() {
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
            🔒 Política de Privacidade
          </h1>
          <p className="text-gray-600">
            Última atualização: 05 de novembro de 2025
          </p>
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 prose prose-sm max-w-none">
          
          <h2>1. Introdução</h2>
          <p>
            O <strong>BarTab</strong> ("nós", "nosso" ou "Sistema") respeita a privacidade dos seus usuários 
            e está comprometido com a proteção dos seus dados pessoais. Esta Política de Privacidade descreve 
            como coletamos, usamos, armazenamos e protegemos suas informações, em conformidade com a{' '}
            <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
          </p>

          <h2>2. Dados Coletados</h2>
          
          <h3>2.1 Dados de Usuários do Sistema</h3>
          <ul>
            <li><strong>Nome completo</strong></li>
            <li><strong>E-mail</strong> (via Google OAuth)</li>
            <li><strong>Foto de perfil</strong> (via Google)</li>
            <li><strong>Google ID</strong> (identificador único)</li>
            <li><strong>Nome do estabelecimento</strong></li>
          </ul>

          <h3>2.2 Dados de Clientes do PDV</h3>
          <ul>
            <li><strong>Nome completo</strong></li>
            <li><strong>Telefone</strong> (opcional)</li>
            <li><strong>Saldo devedor</strong></li>
            <li><strong>Histórico de compras</strong></li>
          </ul>

          <h3>2.3 Dados que NÃO Coletamos</h3>
          <ul>
            <li>❌ Senhas (autenticação via Google OAuth)</li>
            <li>❌ Dados de cartão de crédito</li>
            <li>❌ Dados sensíveis (origem racial, opiniões políticas, dados de saúde)</li>
          </ul>

          <h2>3. Finalidade do Tratamento</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
            <h4 className="font-semibold text-gray-900 mb-2">Utilizamos seus dados para:</h4>
            <ul className="mb-0">
              <li>Autenticação e controle de acesso ao sistema</li>
              <li>Gestão de estabelecimentos e equipes</li>
              <li>Registro de vendas e pagamentos</li>
              <li>Controle de contas fiadas ("pagar depois")</li>
              <li>Segurança e prevenção de fraudes</li>
              <li>Cumprimento de obrigações legais e fiscais</li>
            </ul>
          </div>

          <h2>4. Base Legal (LGPD)</h2>
          <ul>
            <li><strong>Execução de contrato</strong> (Art. 7º, V) - Autenticação e funcionalidades</li>
            <li><strong>Legítimo interesse</strong> (Art. 7º, IX) - Controle financeiro e comercial</li>
            <li><strong>Obrigação legal</strong> (Art. 7º, II) - Dados fiscais e tributários</li>
            <li><strong>Consentimento</strong> (Art. 7º, I) - Comunicações sobre o sistema</li>
          </ul>

          <h2>5. Compartilhamento de Dados</h2>
          
          <h3>5.1 Com Quem Compartilhamos</h3>
          <ul>
            <li>
              <strong>Google LLC</strong> - Para autenticação via OAuth
              <br />
              <span className="text-xs text-gray-600">
                Política: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  policies.google.com/privacy
                </a>
              </span>
            </li>
            <li><strong>Google Cloud Platform</strong> - Hospedagem e banco de dados (armazenamento em nuvem)</li>
            <li><strong>Autoridades Públicas</strong> - Quando exigido por lei ou ordem judicial</li>
          </ul>

          <h3>5.2 Transferência Internacional</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
            <p className="mb-0">
              ⚠️ Seus dados podem ser armazenados em servidores nos Estados Unidos (Google Cloud Platform). 
              Estas transferências são realizadas com garantias de segurança adequadas e conformidade 
              com leis locais de proteção de dados.
            </p>
          </div>

          <h2>6. Segurança</h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <h4 className="font-semibold text-gray-900 mb-2">🔒 Medidas Implementadas:</h4>
            <ul className="mb-0 text-sm">
              <li>✅ Criptografia em trânsito (HTTPS/TLS)</li>
              <li>✅ Autenticação segura (OAuth 2.0 + JWT)</li>
              <li>✅ Controle de acesso baseado em roles (RBAC)</li>
              <li>✅ Isolamento de dados por estabelecimento</li>
              <li>✅ Validação e sanitização de inputs</li>
              <li>✅ Proteção contra SQL Injection</li>
              <li>✅ Backups regulares</li>
            </ul>
          </div>

          <h2>7. Prazo de Armazenamento</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo de Dado</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Prazo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Usuários ativos</td>
                  <td className="border border-gray-300 px-4 py-2">Enquanto conta ativa</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Clientes (PDV)</td>
                  <td className="border border-gray-300 px-4 py-2">Enquanto relacionamento ativo</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Histórico de vendas</td>
                  <td className="border border-gray-300 px-4 py-2">5 anos (obrigação legal)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Logs de acesso</td>
                  <td className="border border-gray-300 px-4 py-2">6 meses</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Contas excluídas</td>
                  <td className="border border-gray-300 px-4 py-2">30 dias (backup)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>8. Seus Direitos (LGPD - Art. 18)</h2>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
            <p className="font-semibold mb-2">Como titular dos dados, você tem direito a:</p>
            <ul className="text-sm">
              <li><strong>✅ Confirmação e Acesso</strong> - Saber se tratamos seus dados e acessá-los</li>
              <li><strong>✅ Correção</strong> - Corrigir dados incompletos ou desatualizados</li>
              <li><strong>✅ Anonimização/Bloqueio</strong> - Solicitar anonimização de dados desnecessários</li>
              <li><strong>✅ Exclusão</strong> - Solicitar exclusão de dados não obrigatórios</li>
              <li><strong>✅ Portabilidade</strong> - Receber seus dados em formato estruturado (JSON)</li>
              <li><strong>✅ Revogação de Consentimento</strong> - Retirar consentimento dado anteriormente</li>
              <li><strong>✅ Oposição</strong> - Se opor a tratamentos baseados em legítimo interesse</li>
            </ul>
          </div>

          <h3>8.1 Como Exercer Seus Direitos</h3>
          <p>
            Para exercer qualquer um desses direitos, acesse a página{' '}
            <a href="/privacy-settings" className="text-blue-600 hover:underline">
              Configurações de Privacidade
            </a>
            {' '}ou entre em contato:
          </p>
          <ul>
            <li>📧 <strong>E-mail:</strong> eduardo.klug7@gmail.com</li>
            <li>⏱️ <strong>Prazo de resposta:</strong> Até 15 dias úteis</li>
          </ul>

          <h2>9. Cookies e Tecnologias</h2>
          <p>Utilizamos as seguintes tecnologias:</p>
          <ul>
            <li><strong>Token JWT</strong> - Manter sessão autenticada (7 dias)</li>
            <li><strong>localStorage</strong> - Armazenar preferências e dados offline</li>
            <li><strong>Cookies do Google</strong> - Autenticação OAuth</li>
          </ul>

          <h2>10. Menores de Idade</h2>
          <p>
            O BarTab <strong>não é destinado a menores de 18 anos</strong>. Não coletamos 
            intencionalmente dados de menores. Se tomarmos conhecimento de coleta acidental, 
            os dados serão excluídos imediatamente.
          </p>

          <h2>11. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política periodicamente. Alterações significativas serão notificadas por:
          </p>
          <ul>
            <li>E-mail cadastrado</li>
            <li>Aviso no sistema</li>
            <li>Atualização da data no topo deste documento</li>
          </ul>

          <h2>12. Incidentes de Segurança</h2>
          <p>
            Em caso de incidente que possa gerar risco aos seus dados, você será{' '}
            <strong>notificado em até 72 horas</strong>. A ANPD também será comunicada conforme exigido por lei.
          </p>

          <h2>13. Contato</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
            <p className="mb-2"><strong>Para dúvidas sobre privacidade:</strong></p>
            <ul className="mb-0">
              <li>📧 <strong>E-mail:</strong> eduardo.klug7@gmail.com</li>
              <li>⏱️ <strong>Prazo de resposta:</strong> 15 dias úteis</li>
            </ul>
            <p className="mt-4 mb-0 text-sm">
              <strong>ANPD:</strong>{' '}
              <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                www.gov.br/anpd
              </a>
            </p>
          </div>

          <hr className="my-8" />

          <p className="text-center text-sm text-gray-600">
            ✅ <strong>Documento elaborado em conformidade com a LGPD (Lei 13.709/2018)</strong>
            <br />
            Última atualização: 05 de novembro de 2025
          </p>
        </div>
      </div>
    </div>
  );
}

