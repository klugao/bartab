import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './table';

describe('Table Components', () => {
  it('deve renderizar tabela com header e body', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Idade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>João</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByText(/nome/i)).toBeInTheDocument();
    expect(screen.getByText(/idade/i)).toBeInTheDocument();
    expect(screen.getByText(/joão/i)).toBeInTheDocument();
    expect(screen.getByText(/30/i)).toBeInTheDocument();
  });

  it('deve renderizar múltiplas linhas na tabela', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Item 1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Item 2</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Item 3</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByText(/item 1/i)).toBeInTheDocument();
    expect(screen.getByText(/item 2/i)).toBeInTheDocument();
    expect(screen.getByText(/item 3/i)).toBeInTheDocument();
  });

  it('deve renderizar TableHead corretamente', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coluna 1</TableHead>
            <TableHead>Coluna 2</TableHead>
            <TableHead>Coluna 3</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    
    expect(screen.getByText(/coluna 1/i)).toBeInTheDocument();
    expect(screen.getByText(/coluna 2/i)).toBeInTheDocument();
    expect(screen.getByText(/coluna 3/i)).toBeInTheDocument();
  });
});

