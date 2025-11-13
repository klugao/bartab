import { Test, TestingModule } from '@nestjs/testing';
import { EstablishmentAccessGuard } from './establishment-access.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../enums';

describe('EstablishmentAccessGuard', () => {
  let guard: EstablishmentAccessGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstablishmentAccessGuard],
    }).compile();

    guard = module.get<EstablishmentAccessGuard>(EstablishmentAccessGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockExecutionContext = (user?: any, params?: any, query?: any, body?: any): ExecutionContext => ({
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params: params || {},
          query: query || {},
          body: body || {},
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any);

    it('should throw ForbiddenException if user is not authenticated', () => {
      const context = mockExecutionContext();

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Usuário não autenticado');
    });

    it('should allow access for system administrators', () => {
      const user = {
        id: 'user-1',
        role: UserRole.ADMINISTRADOR_SISTEMA,
        establishmentId: 'est-1',
      };
      const context = mockExecutionContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access if no establishment ID in request', () => {
      const user = {
        id: 'user-1',
        role: UserRole.PROPRIETARIO,
        establishmentId: 'est-1',
      };
      const context = mockExecutionContext(user);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access if establishment IDs match (from params)', () => {
      const user = {
        id: 'user-1',
        role: UserRole.PROPRIETARIO,
        establishmentId: 'est-1',
      };
      const params = { establishmentId: 'est-1' };
      const context = mockExecutionContext(user, params);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access if establishment IDs match (from query)', () => {
      const user = {
        id: 'user-1',
        role: UserRole.PROPRIETARIO,
        establishmentId: 'est-1',
      };
      const query = { establishmentId: 'est-1' };
      const context = mockExecutionContext(user, {}, query);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access if establishment IDs match (from body)', () => {
      const user = {
        id: 'user-1',
        role: UserRole.PROPRIETARIO,
        establishmentId: 'est-1',
      };
      const body = { establishmentId: 'est-1' };
      const context = mockExecutionContext(user, {}, {}, body);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if establishment IDs do not match', () => {
      const user = {
        id: 'user-1',
        role: UserRole.PROPRIETARIO,
        establishmentId: 'est-1',
      };
      const params = { establishmentId: 'est-2' };
      const context = mockExecutionContext(user, params);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Você não tem permissão para acessar dados deste estabelecimento',
      );
    });

    it('should prioritize params over query and body', () => {
      const user = {
        id: 'user-1',
        role: UserRole.PROPRIETARIO,
        establishmentId: 'est-1',
      };
      const params = { establishmentId: 'est-1' };
      const query = { establishmentId: 'est-2' };
      const body = { establishmentId: 'est-3' };
      const context = mockExecutionContext(user, params, query, body);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow gerente with matching establishment', () => {
      const user = {
        id: 'user-1',
        role: UserRole.GERENTE,
        establishmentId: 'est-1',
      };
      const params = { establishmentId: 'est-1' };
      const context = mockExecutionContext(user, params);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny gerente with non-matching establishment', () => {
      const user = {
        id: 'user-1',
        role: UserRole.GERENTE,
        establishmentId: 'est-1',
      };
      const params = { establishmentId: 'est-2' };
      const context = mockExecutionContext(user, params);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});

