import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  Users, 
  Mail,
  Calendar,
  AlertCircle,
  Power,
  PowerOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { formatDateOnly } from '@/utils/formatters';

interface Establishment {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  active: boolean;
  statusAprovacao: string;
  created_at: string;
  proprietario?: {
    name: string;
    email: string;
  };
}

interface Statistics {
  total: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
  ativos: number;
  inativos: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [pendingEstablishments, setPendingEstablishments] = useState<Establishment[]>([]);
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user?.role === 'AdministradorSistema') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, allRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/establishments/pending'),
        api.get('/admin/establishments'),
      ]);

      setStatistics(statsRes.data);
      setPendingEstablishments(pendingRes.data);
      setAllEstablishments(allRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja aprovar "${name}"?`)) return;

    try {
      await api.post(`/admin/approve/${id}`);
      toast({
        title: '✅ Estabelecimento Aprovado',
        description: `${name} foi aprovado com sucesso! Um e-mail de confirmação foi enviado.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o estabelecimento',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string, name: string) => {
    const motivo = prompt(`Digite o motivo da rejeição de "${name}" (opcional):`);
    if (motivo === null) return; // Cancelou

    try {
      await api.post(`/admin/reject/${id}`, { motivo });
      toast({
        title: 'Estabelecimento Rejeitado',
        description: `${name} foi rejeitado. Um e-mail foi enviado ao proprietário.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o estabelecimento',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja INATIVAR "${name}"?\n\nO estabelecimento não poderá mais acessar o sistema.`)) return;

    try {
      await api.post(`/admin/deactivate/${id}`);
      toast({
        title: '🔴 Estabelecimento Inativado',
        description: `${name} foi inativado com sucesso.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível inativar o estabelecimento',
        variant: 'destructive',
      });
    }
  };

  const handleActivate = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja ATIVAR "${name}"?`)) return;

    try {
      await api.post(`/admin/activate/${id}`);
      toast({
        title: '🟢 Estabelecimento Ativado',
        description: `${name} foi ativado com sucesso.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar o estabelecimento',
        variant: 'destructive',
      });
    }
  };

  if (user?.role !== 'AdministradorSistema') {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600 mt-1">
          Gerencie estabelecimentos e visualize estatísticas do sistema
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statistics?.total || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Estabelecimentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Pendentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {statistics?.pendentes || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Aguardando análise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Aprovados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {statistics?.aprovados || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Aprovados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Rejeitados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {statistics?.rejeitados || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Não aprovados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Power className="w-4 h-4 text-green-600" />
              Ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {statistics?.ativos || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Em operação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <PowerOff className="w-4 h-4 text-gray-600" />
              Inativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {statistics?.inativos || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Desativados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Estabelecimentos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pendentes ({pendingEstablishments.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todos ({allEstablishments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Pendentes */}
        <TabsContent value="pending" className="space-y-4">
          {pendingEstablishments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Nenhum estabelecimento pendente!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Todos os cadastros foram revisados.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingEstablishments.map((est) => (
              <Card key={est.id} className="border-yellow-200 bg-yellow-50/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {est.name}
                      </CardTitle>
                      <CardDescription className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{est.proprietario?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {est.proprietario?.email || est.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Cadastrado em {formatDateOnly(est.created_at)}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-yellow-700 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Pendente
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(est.id, est.name)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => handleReject(est.id, est.name)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab: Todos */}
        <TabsContent value="all" className="space-y-4">
                  {allEstablishments.map((est) => (
            <Card key={est.id} className={!est.active ? 'opacity-60 bg-gray-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {est.name}
                      {!est.active && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          Inativo
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      {est.proprietario && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{est.proprietario.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {est.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDateOnly(est.created_at)}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      est.statusAprovacao === 'Aprovado' 
                        ? 'bg-green-100 border border-green-300 text-green-700'
                        : est.statusAprovacao === 'Pendente'
                        ? 'bg-yellow-100 border border-yellow-300 text-yellow-700'
                        : 'bg-red-100 border border-red-300 text-red-700'
                    }`}>
                      {est.statusAprovacao === 'Aprovado' && <CheckCircle className="w-4 h-4" />}
                      {est.statusAprovacao === 'Pendente' && <Clock className="w-4 h-4" />}
                      {est.statusAprovacao === 'Rejeitado' && <XCircle className="w-4 h-4" />}
                      {est.statusAprovacao}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {est.active ? (
                    <Button
                      onClick={() => handleDeactivate(est.id, est.name)}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                      disabled={user?.establishment?.id === est.id}
                      title={user?.establishment?.id === est.id ? 'Você não pode inativar o seu próprio estabelecimento' : undefined}
                    >
                      <PowerOff className="w-4 h-4 mr-2" />
                      Inativar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleActivate(est.id, est.name)}
                      variant="outline"
                      className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Power className="w-4 h-4 mr-2" />
                      Ativar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

