import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs Components', () => {
  it('deve renderizar tabs com múltiplos triggers', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Conteúdo 1</TabsContent>
        <TabsContent value="tab2">Conteúdo 2</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByText(/tab 1/i)).toBeInTheDocument();
    expect(screen.getByText(/tab 2/i)).toBeInTheDocument();
  });

  it('deve renderizar triggers e conteúdo', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Conteúdo da Tab 1</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByText(/tab 1/i)).toBeInTheDocument();
  });

  it('deve renderizar TabsList com múltiplos triggers', () => {
    render(
      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });
});

