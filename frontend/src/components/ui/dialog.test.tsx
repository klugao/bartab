import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';

describe('Dialog Components', () => {
  it('deve renderizar DialogTrigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Abrir</DialogTrigger>
      </Dialog>
    );
    expect(screen.getByText(/abrir/i)).toBeInTheDocument();
  });

  it('deve renderizar DialogTitle', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título do Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText(/título do dialog/i)).toBeInTheDocument();
  });

  it('deve renderizar DialogDescription', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>Descrição do dialog</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText(/descrição do dialog/i)).toBeInTheDocument();
  });

  it('deve renderizar DialogFooter', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogFooter>
            <button>Cancelar</button>
            <button>Confirmar</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText(/cancelar/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmar/i)).toBeInTheDocument();
  });
});

