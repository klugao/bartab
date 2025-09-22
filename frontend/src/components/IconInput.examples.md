# IconInput Component - Exemplos de Uso

O componente `IconInput` permite criar inputs com ícones em cima de forma consistente.

## Importação

```tsx
import IconInput from '../components/IconInput';
import { MagnifyingGlassIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
```

## Exemplos de Uso

### 1. Campo de Busca (Básico)
```tsx
const [searchTerm, setSearchTerm] = useState('');

<IconInput
  icon={<MagnifyingGlassIcon />}
  placeholder="Buscar..."
  value={searchTerm}
  onChange={setSearchTerm}
/>
```

### 2. Campo de Email
```tsx
const [email, setEmail] = useState('');

<IconInput
  icon={<EnvelopeIcon />}
  placeholder="Digite seu email"
  value={email}
  onChange={setEmail}
  type="email"
  required
/>
```

### 3. Campo de Nome com Ícone Pequeno
```tsx
const [name, setName] = useState('');

<IconInput
  icon={<UserIcon />}
  placeholder="Nome completo"
  value={name}
  onChange={setName}
  iconSize="sm"
/>
```

### 4. Campo Desabilitado
```tsx
<IconInput
  icon={<UserIcon />}
  placeholder="Campo desabilitado"
  value="Valor fixo"
  onChange={() => {}}
  disabled
  iconSize="lg"
/>
```

### 5. Com Classes Customizadas
```tsx
<IconInput
  icon={<MagnifyingGlassIcon />}
  placeholder="Busca customizada"
  value={searchTerm}
  onChange={setSearchTerm}
  className="max-w-md"
  iconSize="md"
/>
```

## Props Disponíveis

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| icon | React.ReactNode | - | Ícone a ser exibido (obrigatório) |
| placeholder | string | '' | Placeholder do input |
| value | string | - | Valor do input (obrigatório) |
| onChange | (value: string) => void | - | Função chamada quando valor muda (obrigatório) |
| type | string | 'text' | Tipo do input (text, email, password, etc.) |
| className | string | '' | Classes CSS adicionais |
| iconSize | 'sm' \| 'md' \| 'lg' | 'md' | Tamanho do ícone |
| disabled | boolean | false | Se o input está desabilitado |
| required | boolean | false | Se o input é obrigatório |

## Tamanhos de Ícone

- **sm**: 16x16px (w-4 h-4)
- **md**: 20x20px (w-5 h-5) - padrão
- **lg**: 24x24px (w-6 h-6)
