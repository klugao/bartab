import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CardTab from './CardTab';
import type { Tab } from '../types';

// Mock dos formatters
vi.mock('../utils/formatters', () => ({
  formatCurrency: (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 'R$ 0.00' : `R$ ${num.toFixed(2)}`;
  },
  formatShortDate: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
  formatFullDate: (date: string) => new Date(date).toLocaleString('pt-BR'),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CardTab', () => {
  const mockTab: Tab = {
    id: 'tab-1',
    status: 'OPEN' as const,
    opened_at: '2025-11-02T10:00:00.000Z',
    customer: {
      id: 'customer-1',
      name: 'João Silva',
      cpf: '',
      phone: '',
      email: '',
      balance_due: '0',
      establishment_id: '',
      tabs: [],
    },
    tabItems: [
      {
        id: 'item-1',
        qty: 2,
        unit_price: '5.00',
        total: '10.00',
        item: {
          id: 'item-1',
          name: 'Cerveja',
          price: '5.00',
          active: true,
          establishment_id: '',
          tabItems: [],
        },
      },
      {
        id: 'item-2',
        qty: 1,
        unit_price: '15.00',
        total: '15.00',
        item: {
          id: 'item-2',
          name: 'Porção',
          price: '15.00',
          active: true,
          establishment_id: '',
          tabItems: [],
        },
      },
    ],
    payments: [],
    establishment_id: '',
  };

  const mockOnDelete = vi.fn();
  const mockOnAddItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar informações básicas da conta', () => {
    renderWithRouter(<CardTab tab={mockTab} />);
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Aberta')).toBeInTheDocument();
    expect(screen.getByText(/Itens: 2/)).toBeInTheDocument();
  });

  it('deve calcular e exibir o total corretamente', () => {
    renderWithRouter(<CardTab tab={mockTab} />);
    
    // Total deve ser 10.00 + 15.00 = 25.00
    expect(screen.getByText('R$ 25.00')).toBeInTheDocument();
  });

  it('deve exibir "Mesa sem cliente" quando não houver cliente', () => {
    const tabWithoutCustomer = { ...mockTab, customer: null };
    renderWithRouter(<CardTab tab={tabWithoutCustomer} />);
    
    expect(screen.getByText('Mesa sem cliente')).toBeInTheDocument();
  });

  it('deve exibir itens da conta', () => {
    renderWithRouter(<CardTab tab={mockTab} />);
    
    expect(screen.getByText(/2× Cerveja/)).toBeInTheDocument();
    expect(screen.getByText(/1× Porção/)).toBeInTheDocument();
  });

  it('deve exibir botão de adicionar para contas abertas', () => {
    renderWithRouter(
      <CardTab tab={mockTab} onAddItem={mockOnAddItem} />
    );
    
    const addButton = screen.getByRole('button', { name: /Adicionar item/i });
    expect(addButton).toBeInTheDocument();
  });

  it('deve chamar onAddItem quando clicar no botão adicionar', async () => {
    renderWithRouter(
      <CardTab tab={mockTab} onAddItem={mockOnAddItem} />
    );
    
    const addButton = screen.getByRole('button', { name: /Adicionar item/i });
    await userEvent.click(addButton);
    
    expect(mockOnAddItem).toHaveBeenCalledWith('tab-1');
  });

  it('deve exibir botão de excluir para contas vazias', () => {
    const emptyTab = { ...mockTab, tabItems: [] };
    renderWithRouter(
      <CardTab tab={emptyTab} onDelete={mockOnDelete} />
    );
    
    const deleteButton = screen.getByRole('button', { name: /Excluir conta/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('deve chamar onDelete quando clicar no botão excluir', async () => {
    const emptyTab = { ...mockTab, tabItems: [] };
    renderWithRouter(
      <CardTab tab={emptyTab} onDelete={mockOnDelete} />
    );
    
    const deleteButton = screen.getByRole('button', { name: /Excluir conta/i });
    await userEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('tab-1');
  });

  it('não deve exibir botão de excluir para contas com itens', () => {
    renderWithRouter(
      <CardTab tab={mockTab} onDelete={mockOnDelete} />
    );
    
    const deleteButton = screen.queryByRole('button', { name: /Excluir/i });
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('deve exibir badge "Fechada" para contas fechadas', () => {
    const closedTab = {
      ...mockTab,
      status: 'CLOSED' as const,
      closed_at: '2025-11-02T15:00:00.000Z',
    };
    
    renderWithRouter(<CardTab tab={closedTab} />);
    
    expect(screen.getByText('Fechada')).toBeInTheDocument();
    expect(screen.getByText('Finalizada')).toBeInTheDocument();
  });

  it('não deve exibir botão de adicionar para contas fechadas', () => {
    const closedTab = {
      ...mockTab,
      status: 'CLOSED' as const,
    };
    
    renderWithRouter(
      <CardTab tab={closedTab} onAddItem={mockOnAddItem} />
    );
    
    const addButton = screen.queryByRole('button', { name: /Adicionar/i });
    expect(addButton).not.toBeInTheDocument();
  });

  it('deve exibir data de fechamento para contas fechadas', () => {
    const closedTab = {
      ...mockTab,
      status: 'CLOSED' as const,
      closed_at: '2025-11-02T15:00:00.000Z',
    };
    
    renderWithRouter(<CardTab tab={closedTab} />);
    
    expect(screen.getByText(/Fechada em:/)).toBeInTheDocument();
  });

  it('deve lidar com conta sem itens', () => {
    const emptyTab = { ...mockTab, tabItems: [] };
    renderWithRouter(<CardTab tab={emptyTab} />);
    
    expect(screen.getByText(/Itens: 0/)).toBeInTheDocument();
    expect(screen.getByText('R$ 0.00')).toBeInTheDocument();
  });

  it('deve exibir apenas últimos 3 itens e mostrar contador', () => {
    const manyItemsTab = {
      ...mockTab,
      tabItems: [
        ...mockTab.tabItems,
        {
          id: 'item-3',
          qty: 1,
          unit_price: '5.00',
          total: '5.00',
          item: {
            id: 'item-3',
            name: 'Item 3',
            price: '5.00',
            active: true,
            establishment_id: '',
            tabItems: [],
          },
        },
        {
          id: 'item-4',
          qty: 1,
          unit_price: '5.00',
          total: '5.00',
          item: {
            id: 'item-4',
            name: 'Item 4',
            price: '5.00',
            active: true,
            establishment_id: '',
            tabItems: [],
          },
        },
      ],
    };
    
    renderWithRouter(<CardTab tab={manyItemsTab} />);
    
    expect(screen.getByText('+1 mais...')).toBeInTheDocument();
  });

  it('deve navegar para página de detalhes ao clicar no card', () => {
    const { container } = renderWithRouter(<CardTab tab={mockTab} />);
    
    const link = container.querySelector('a[href="/tab/tab-1"]');
    expect(link).toBeInTheDocument();
  });

  it('deve lidar com tabItems inválidos', () => {
    const invalidTab = {
      ...mockTab,
      tabItems: [
        {
          id: 'item-1',
          qty: 1,
          unit_price: '5.00',
          total: 'invalid',
          item: {
            id: 'item-1',
            name: 'Item',
            price: '5.00',
            active: true,
            establishment_id: '',
            tabItems: [],
          },
        },
      ],
    };
    
    renderWithRouter(<CardTab tab={invalidTab} />);
    
    // Deve tratar valores inválidos como 0
    const totalElements = screen.getAllByText('R$ 0.00');
    expect(totalElements.length).toBeGreaterThan(0);
  });
});

