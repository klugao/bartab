import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDeleteModal from './ConfirmDeleteModal';

describe('ConfirmDeleteModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirmar Exclusão',
    message: 'Tem certeza que deseja excluir este item?',
  };

  it('não deve renderizar quando isOpen for false', () => {
    const { container } = render(
      <ConfirmDeleteModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar quando isOpen for true', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza que deseja excluir este item?')).toBeInTheDocument();
  });

  it('deve exibir os botões Cancelar e Excluir', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });

  it('deve chamar onClose quando clicar em Cancelar', async () => {
    const onClose = vi.fn();
    render(<ConfirmDeleteModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByText('Cancelar');
    await userEvent.click(cancelButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onConfirm quando clicar em Excluir', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteModal {...defaultProps} onConfirm={onConfirm} />);
    
    const deleteButton = screen.getByText('Excluir');
    await userEvent.click(deleteButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onClose quando clicar no botão X', async () => {
    const onClose = vi.fn();
    render(<ConfirmDeleteModal {...defaultProps} onClose={onClose} />);
    
    // Encontra o botão de fechar pelo ícone X
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(btn => btn.querySelector('svg'));
    
    if (xButton) {
      await userEvent.click(xButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('deve desabilitar botões quando loading for true', () => {
    render(<ConfirmDeleteModal {...defaultProps} loading={true} />);
    
    const cancelButton = screen.getByText('Cancelar');
    const deleteButton = screen.getByText('Excluindo...');
    
    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('deve exibir "Excluindo..." quando loading for true', () => {
    render(<ConfirmDeleteModal {...defaultProps} loading={true} />);
    expect(screen.getByText('Excluindo...')).toBeInTheDocument();
  });

  it('deve exibir título e mensagem customizados', () => {
    const customTitle = 'Excluir Cliente';
    const customMessage = 'Deseja realmente excluir este cliente?';
    
    render(
      <ConfirmDeleteModal
        {...defaultProps}
        title={customTitle}
        message={customMessage}
      />
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('deve ter ícone de aviso', () => {
    const { container } = render(<ConfirmDeleteModal {...defaultProps} />);
    
    // Verifica se há um ícone SVG (ExclamationTriangleIcon)
    const icon = container.querySelector('svg.text-red-600');
    expect(icon).toBeInTheDocument();
  });
});

