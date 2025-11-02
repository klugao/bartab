import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Mail, AlertCircle } from 'lucide-react';

export default function PendingApproval() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isRejected = user.establishment.statusAprovacao === 'Rejeitado';
  const isInactive = user.establishment.active === false;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          {isInactive ? (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-gray-600" />
              </div>
              <CardTitle className="text-2xl text-gray-700">
                Conta Inativa
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Seu estabelecimento foi inativado pelo administrador
              </CardDescription>
            </>
          ) : isRejected ? (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Cadastro Não Aprovado
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Infelizmente, seu estabelecimento não foi aprovado no momento.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl text-yellow-700">
                Aguardando Aprovação
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Seu estabelecimento está em análise pelo administrador
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações do Estabelecimento */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">
              Informações do Cadastro
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Nome do Estabelecimento:</span>
                <p className="font-medium text-gray-900">
                  {user.establishment.name}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Responsável:</span>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <span className="text-gray-500">E-mail:</span>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className={`font-medium inline-flex items-center gap-1 ${
                  isRejected ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {isRejected ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Rejeitado
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      Pendente
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Mensagem */}
          {isInactive ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Conta Inativa</AlertTitle>
              <AlertDescription>
                Seu estabelecimento foi inativado pelo administrador. 
                Se você acredita que houve um erro ou deseja reativar sua conta, 
                entre em contato com o suporte.
              </AlertDescription>
            </Alert>
          ) : isRejected ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cadastro Rejeitado</AlertTitle>
              <AlertDescription>
                Seu cadastro foi analisado mas não foi aprovado no momento. 
                Se você acredita que houve um erro, entre em contato com o suporte.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertTitle>O que acontece agora?</AlertTitle>
              <AlertDescription className="space-y-2 mt-2">
                <p>
                  Seu estabelecimento foi cadastrado e está aguardando aprovação do 
                  administrador do sistema.
                </p>
                <p className="font-medium">
                  Você receberá um e-mail em <span className="text-blue-600">{user.email}</span> assim 
                  que seu estabelecimento for aprovado.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Ações */}
          <div className="space-y-3">
            {!isRejected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                  ⏱️ Tempo de Aprovação
                </h4>
                <p className="text-sm text-blue-700">
                  Normalmente, o processo de aprovação leva até 24 horas úteis. 
                  Fique atento ao seu e-mail!
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <button
                onClick={logout}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="pt-4 border-t space-y-3">
            <h4 className="font-semibold text-gray-700">
              Perguntas Frequentes
            </h4>
            
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                Por que preciso de aprovação?
              </summary>
              <p className="mt-2 text-sm text-gray-600 ml-4">
                Para garantir a segurança e qualidade do sistema, todos os estabelecimentos 
                passam por uma análise antes de começarem a usar o BarTab.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                Quanto tempo demora?
              </summary>
              <p className="mt-2 text-sm text-gray-600 ml-4">
                O processo de aprovação geralmente leva até 24 horas úteis. Você receberá 
                um e-mail assim que for aprovado.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                O que fazer se não receber o e-mail?
              </summary>
              <p className="mt-2 text-sm text-gray-600 ml-4">
                Verifique sua caixa de spam. Se ainda assim não encontrar, entre em 
                contato com o suporte.
              </p>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

