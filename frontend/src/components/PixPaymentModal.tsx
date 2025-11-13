import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../utils/formatters';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  qrCode?: string;
  amount: number;
}

const PixPaymentModal = ({ isOpen, onClose, onConfirm, qrCode, amount }: PixPaymentModalProps) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Pagamento PIX
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="space-y-6">
          {/* QR Code grande (se disponível) */}
          {qrCode ? (
            <div className="flex justify-center bg-white p-6 rounded-lg border-2 border-gray-200">
              <img
                src={qrCode}
                alt="QR Code PIX"
                className="w-full max-w-80 h-auto object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-900 mb-1">
                    QR Code não configurado
                  </p>
                  <p className="text-sm text-amber-800">
                    O estabelecimento ainda não cadastrou o QR Code PIX. Solicite a chave PIX ou dados bancários para realizar o pagamento manualmente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Valor em destaque */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Valor a pagar:</p>
            <p className="text-4xl font-bold text-blue-600">
              {formatCurrency(amount)}
            </p>
          </div>

          {/* Mensagem de validação */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  ATENÇÃO: Verifique o valor do PIX
                </p>
                <p className="text-sm text-amber-800">
                  Confirme que o valor do PIX está correto antes de registrar o pagamento.
                </p>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2 font-medium">
              {qrCode ? 'Como pagar:' : 'Instruções:'}
            </p>
            {qrCode ? (
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Abra o aplicativo do seu banco</li>
                <li>Escolha a opção PIX e escaneie o QR Code acima</li>
                <li>Verifique se o valor está correto</li>
                <li>Confirme o pagamento no seu banco</li>
                <li>Após o pagamento, clique em "Confirmar Pagamento" abaixo</li>
              </ol>
            ) : (
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Solicite a chave PIX ou dados bancários ao estabelecimento</li>
                <li>Abra o aplicativo do seu banco</li>
                <li>Realize a transferência PIX com o valor informado acima</li>
                <li>Verifique se o valor está correto</li>
                <li>Após o pagamento, clique em "Confirmar Pagamento" abaixo</li>
              </ol>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Confirmar Pagamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixPaymentModal;

