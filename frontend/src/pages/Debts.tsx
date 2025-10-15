import { useState, useEffect } from 'react';
import { CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { customersApi } from '../services/api';
import type { Customer, Tab } from '../types';
import { useToast } from '../hooks/use-toast';
import { formatCurrency, formatFullDate } from '../utils/formatters';
import PayDebtModal from '../components/PayDebtModal';

interface DebtCustomer extends Customer {
  tabs: Tab[];
}

const Debts = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<DebtCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [selectedCustomer, setSelectedCustomer] = useState<DebtCustomer | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    loadCustomersWithDebts();
  }, []);

  const loadCustomersWithDebts = async () => {
    try {
      setLoading(true);
      const response = await customersApi.getCustomersWithDebts();
      console.log('📥 Resposta da API:', response);
      console.log('📋 Número de clientes:', response.length);
      response.forEach((customer, index) => {
        console.log(`Cliente ${index + 1}: ${customer.name}`);
        console.log('  - balance_due:', customer.balance_due);
        console.log('  - tabs:', customer.tabs?.length || 0);
        customer.tabs?.forEach((tab, tabIndex) => {
          console.log(`  Conta ${tabIndex + 1}:`, {
            id: tab.id,
            status: tab.status,
            items: tab.tabItems?.length || 0,
            payments: tab.payments?.length || 0
          });
        });
      });
      setCustomers(response);
    } catch (error) {
      console.error('Erro ao carregar clientes com dívidas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar clientes com dívidas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerExpanded = (customerId: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const handlePayDebt = (customer: DebtCustomer) => {
    setSelectedCustomer(customer);
    setShowPayModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayModal(false);
    setSelectedCustomer(null);
    loadCustomersWithDebts();
    toast({
      title: 'Sucesso!',
      description: 'Pagamento registrado com sucesso!',
    });
  };

  const calculateTabTotal = (tab: Tab): number => {
    if (!tab.tabItems) return 0;
    return tab.tabItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
  };

  const calculateTabPaid = (tab: Tab): number => {
    if (!tab.payments) return 0;
    // NÃO contar pagamentos LATER como efetivamente pagos
    return tab.payments.reduce((sum, payment) => {
      if (payment.method === 'LATER') {
        return sum; // Não adiciona pagamentos fiados
      }
      return sum + parseFloat(payment.amount);
    }, 0);
  };

  const calculateTabRemaining = (tab: Tab): number => {
    const total = calculateTabTotal(tab);
    const paid = calculateTabPaid(tab);
    const remaining = total - paid;
    console.log('💰 Calculando restante da conta:', { total, paid, remaining });
    return remaining;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Dívidas</h1>
          <p className="text-sm text-gray-600 mt-1">
            Clientes com pagamento pendente (fiado ou pagamento parcial)
          </p>
        </div>
      </div>

      {/* Lista de clientes com dívidas */}
      {customers.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma dívida pendente</h3>
            <p className="mt-1 text-sm text-gray-500">
              Todos os clientes estão com as contas em dia! 🎉
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((customer) => {
            const isExpanded = expandedCustomers.has(customer.id);
            const debtAmount = parseFloat(customer.balance_due);
            const closedTabsWithDebt = customer.tabs?.filter(tab => {
              const isClosedTab = tab.status === 'CLOSED';
              const remaining = calculateTabRemaining(tab);
              const hasDebt = remaining > 0;
              
              console.log(`🔍 Filtrando conta ${tab.id}:`, {
                status: tab.status,
                isClosed: isClosedTab,
                remaining: remaining,
                hasDebt: hasDebt,
                includeInList: isClosedTab && hasDebt
              });
              
              return isClosedTab && hasDebt;
            }) || [];
            
            console.log(`👤 Cliente ${customer.name}: ${closedTabsWithDebt.length} conta(s) com dívida`);

            return (
              <div key={customer.id} className="card hover:shadow-md transition-shadow">
                {/* Header do cliente */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleCustomerExpanded(customer.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {customer.name}
                        </h3>
                        {customer.phone && (
                          <p className="text-sm text-gray-500">{customer.phone}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-4">
                          <div>
                            <span className="text-sm text-gray-600">Dívida Total: </span>
                            <span className="text-lg font-bold text-red-600">
                              {formatCurrency(Math.abs(debtAmount))}
                            </span>
                          </div>
                          {closedTabsWithDebt.length > 0 && (
                            <div className="text-sm text-gray-600">
                              {closedTabsWithDebt.length} conta(s) com saldo devedor
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <svg
                          className={`h-6 w-6 text-gray-400 transform transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handlePayDebt(customer)}
                      className="btn-primary inline-flex items-center"
                    >
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Registrar Pagamento
                    </button>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {isExpanded && closedTabsWithDebt.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Contas com Saldo Devedor:</h4>
                    <div className="space-y-3">
                      {closedTabsWithDebt.map((tab) => {
                        const total = calculateTabTotal(tab);
                        const paid = calculateTabPaid(tab);
                        const remaining = calculateTabRemaining(tab);

                        return (
                          <div
                            key={tab.id}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Fechada em: {formatFullDate(tab.closed_at || tab.opened_at)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Itens da conta */}
                            {tab.tabItems && tab.tabItems.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Itens:</p>
                                {tab.tabItems.map((tabItem) => (
                                  <div key={tabItem.id} className="text-xs text-gray-600 flex justify-between">
                                    <span>
                                      {tabItem.qty}x {tabItem.item?.name || 'Item'} @ {formatCurrency(tabItem.unit_price)}
                                    </span>
                                    <span className="font-medium">{formatCurrency(tabItem.total)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Pagamentos */}
                            {tab.payments && tab.payments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Pagamentos:</p>
                                {tab.payments.map((payment) => (
                                  <div key={payment.id} className="text-xs text-gray-600 flex justify-between">
                                    <span>
                                      {payment.method === 'LATER' ? 'Fiado' : payment.method} - {formatFullDate(payment.paid_at)}
                                    </span>
                                    <span className="font-medium text-green-600">{formatCurrency(payment.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Totalizadores */}
                            <div className="mt-3 pt-3 border-t border-gray-300 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Total da Conta:</span>
                                <span className="font-semibold">{formatCurrency(total)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Já Pago:</span>
                                <span className="font-semibold text-green-600">{formatCurrency(paid)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Restante:</span>
                                <span className="font-bold text-red-600">{formatCurrency(remaining)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de pagamento */}
      {showPayModal && selectedCustomer && (
        <PayDebtModal
          customer={selectedCustomer}
          onClose={() => {
            setShowPayModal(false);
            setSelectedCustomer(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Debts;

