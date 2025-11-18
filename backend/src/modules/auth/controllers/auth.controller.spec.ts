import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Establishment } from '../entities/establishment.entity';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole, ApprovalStatus } from '../../../common/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userRepository: Repository<User>;
  let establishmentRepository: Repository<Establishment>;

  const mockUser = {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@test.com',
    picture: 'photo.jpg',
    role: UserRole.PROPRIETARIO,
    active: true,
    establishment: {
      id: 'est-1',
      name: 'Bar do João',
      active: true,
      statusAprovacao: ApprovalStatus.APROVADO,
    },
  };

  const mockAuthService = {
    validateGoogleUser: jest.fn(),
    login: jest.fn(),
    registerUser: jest.fn(),
    getUserById: jest.fn(),
    getEstablishmentProfile: jest.fn(),
    updateEstablishmentProfile: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockEstablishmentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: 'user-1',
      establishmentId: 'est-1',
      establishment: {
        id: 'est-1',
        name: 'Bar do João',
        active: true,
        statusAprovacao: ApprovalStatus.APROVADO,
      },
    },
  } as any;

  const mockResponse = {
    redirect: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Establishment),
          useValue: mockEstablishmentRepository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    establishmentRepository = module.get<Repository<Establishment>>(
      getRepositoryToken(Establishment),
    );

    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'http://localhost:5173';
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuth', () => {
    it('should handle google authentication', async () => {
      const result = await controller.googleAuth(mockRequest);
      expect(result).toBeUndefined();
    });
  });

  describe('googleAuthRedirect', () => {
    it('should redirect to register if user not found', async () => {
      const req = { user: { email: 'new@test.com', name: 'New User' } } as any;
      mockAuthService.validateGoogleUser.mockResolvedValue(null);

      await controller.googleAuthRedirect(req, mockResponse);

      expect(authService.validateGoogleUser).toHaveBeenCalledWith(req.user);
      expect(mockResponse.redirect).toHaveBeenCalled();
      expect(mockResponse.redirect.mock.calls[0][0]).toContain('/register?data=');
    });

    it('should redirect to callback with token if user exists', async () => {
      const req = { user: mockUser } as any;
      mockAuthService.validateGoogleUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue({ access_token: 'test-token' });

      await controller.googleAuthRedirect(req, mockResponse);

      expect(authService.validateGoogleUser).toHaveBeenCalledWith(req.user);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?token=test-token',
      );
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const googleData = Buffer.from(
        JSON.stringify({ email: 'new@test.com' }),
      ).toString('base64');
      const body = {
        googleData,
        establishmentName: 'New Bar',
      };

      mockAuthService.registerUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue({ access_token: 'test-token' });

      const result = await controller.register(body);

      expect(authService.registerUser).toHaveBeenCalled();
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ access_token: 'test-token' });
    });

    it('should throw UnauthorizedException on error', async () => {
      const invalidData = Buffer.from('invalid-json-{{{').toString('base64');
      const body = {
        googleData: invalidData,
        establishmentName: 'New Bar',
      };

      await expect(controller.register(body)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(authService.getUserById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        picture: mockUser.picture,
        role: mockUser.role,
        establishment: {
          id: mockUser.establishment.id,
          name: mockUser.establishment.name,
          active: mockUser.establishment.active,
          statusAprovacao: mockUser.establishment.statusAprovacao,
        },
      });
    });
  });

  describe('checkAuth', () => {
    it('should return authenticated true', async () => {
      const result = await controller.checkAuth();

      expect(result).toEqual({ authenticated: true });
    });
  });

  describe('devLogin', () => {
    it('should login user by email', async () => {
      const body = { email: 'joao@test.com' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue({ access_token: 'test-token' });

      const result = await controller.devLogin(body);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: body.email },
        relations: ['establishment'],
      });
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ access_token: 'test-token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const body = { email: 'notfound@test.com' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(controller.devLogin(body)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on error', async () => {
      const body = { email: 'joao@test.com' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(controller.devLogin(body)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getEstablishmentProfile', () => {
    it('should return establishment profile', async () => {
      const establishment = { id: 'est-1', name: 'Bar do João' };
      mockAuthService.getEstablishmentProfile.mockResolvedValue(establishment);

      const result = await controller.getEstablishmentProfile(mockRequest);

      expect(authService.getEstablishmentProfile).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(establishment);
    });
  });

  describe('updateEstablishmentProfile', () => {
    it('should update establishment profile', async () => {
      const updateData = { name: 'Bar do João Updated' };
      const updatedEstablishment = { id: 'est-1', name: 'Bar do João Updated' };
      mockAuthService.updateEstablishmentProfile.mockResolvedValue(
        updatedEstablishment,
      );

      const result = await controller.updateEstablishmentProfile(
        mockRequest,
        updateData,
      );

      expect(authService.updateEstablishmentProfile).toHaveBeenCalledWith(
        'est-1',
        updateData,
      );
      expect(result).toEqual(updatedEstablishment);
    });
  });

  describe('fixAdmin', () => {
    it('should fix admin user', async () => {
      const adminUser = {
        ...mockUser,
        email: 'eduardo.klug7@gmail.com',
        role: UserRole.PROPRIETARIO,
        establishment: {
          id: 'est-1',
          name: 'Admin Est',
          statusAprovacao: ApprovalStatus.PENDENTE,
        },
      };
      mockUserRepository.findOne.mockResolvedValue(adminUser);
      mockUserRepository.save.mockResolvedValue({
        ...adminUser,
        role: UserRole.ADMINISTRADOR_SISTEMA,
      });
      mockEstablishmentRepository.save.mockResolvedValue({
        ...adminUser.establishment,
        statusAprovacao: ApprovalStatus.APROVADO,
      });

      const result = await controller.fixAdmin();

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'eduardo.klug7@gmail.com' },
        relations: ['establishment'],
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('corrigido com sucesso');
    });

    it('should return error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await controller.fixAdmin();

      expect(result.error).toBeDefined();
      expect(result.error).toContain('não encontrado');
    });

    it('should handle errors', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await controller.fixAdmin();

      expect(result.error).toBeDefined();
    });

    it('should handle user without establishment', async () => {
      const adminUser = {
        ...mockUser,
        email: 'eduardo.klug7@gmail.com',
        role: UserRole.PROPRIETARIO,
        establishment: null,
      };
      mockUserRepository.findOne.mockResolvedValue(adminUser);
      mockUserRepository.save.mockResolvedValue({
        ...adminUser,
        role: UserRole.ADMINISTRADOR_SISTEMA,
      });

      const result = await controller.fixAdmin();

      expect(result.success).toBe(true);
      expect(establishmentRepository.save).not.toHaveBeenCalled();
    });
  });
});

