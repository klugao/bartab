import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Establishment } from '../entities/establishment.entity';
import { NotificationService } from '../../notification/notification.service';
import { UserRole, ApprovalStatus } from '../../../common/enums';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let establishmentRepository: Repository<Establishment>;
  let jwtService: JwtService;
  let notificationService: NotificationService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEstablishmentRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockNotificationService = {
    sendAdminNewSignupAlert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Establishment),
          useValue: mockEstablishmentRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    establishmentRepository = module.get<Repository<Establishment>>(getRepositoryToken(Establishment));
    jwtService = module.get<JwtService>(JwtService);
    notificationService = module.get<NotificationService>(NotificationService);

    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    
    // Silenciar logs do console durante os testes
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateGoogleUser', () => {
    it('deve retornar usuário existente e atualizar suas informações', async () => {
      const googleProfile = {
        googleId: '123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'http://example.com/pic.jpg',
      };

      const existingUser = {
        id: '1',
        googleId: '123',
        email: 'old@example.com',
        name: 'Old Name',
        picture: 'old.jpg',
        establishment_id: 'est-1',
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({ ...existingUser, ...googleProfile });

      const result = await service.validateGoogleUser(googleProfile);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { googleId: '123' },
        relations: ['establishment'],
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...existingUser,
        email: googleProfile.email,
        name: googleProfile.name,
        picture: googleProfile.picture,
      });
      expect(result).toBeDefined();
    });

    it('deve retornar null se usuário não existir', async () => {
      const googleProfile = {
        googleId: '123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'http://example.com/pic.jpg',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateGoogleUser(googleProfile);

      expect(result).toBeNull();
    });
  });

  describe('registerUser', () => {
    it('deve registrar um novo proprietário com status pendente', async () => {
      const googleProfile = {
        googleId: '123',
        email: 'owner@example.com',
        name: 'Owner User',
        picture: 'http://example.com/pic.jpg',
      };
      const establishmentName = 'Test Bar';

      const newEstablishment = {
        id: 'est-1',
        name: establishmentName,
        email: googleProfile.email,
        statusAprovacao: ApprovalStatus.PENDENTE,
      };

      const newUser = {
        id: 'user-1',
        googleId: googleProfile.googleId,
        email: googleProfile.email,
        name: googleProfile.name,
        picture: googleProfile.picture,
        establishment_id: newEstablishment.id,
        role: UserRole.PROPRIETARIO,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(null); // Usuário não existe
      mockEstablishmentRepository.create.mockReturnValue(newEstablishment);
      mockEstablishmentRepository.save.mockResolvedValue(newEstablishment);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockUserRepository.findOne.mockResolvedValueOnce({
        ...newUser,
        establishment: newEstablishment,
      });
      mockNotificationService.sendAdminNewSignupAlert.mockResolvedValue(undefined);

      const result = await service.registerUser(googleProfile, establishmentName);

      // Aguarda a execução do setImmediate usado no envio do email
      await new Promise(resolve => setImmediate(resolve));

      expect(mockEstablishmentRepository.create).toHaveBeenCalledWith({
        name: establishmentName,
        email: googleProfile.email,
        statusAprovacao: ApprovalStatus.PENDENTE,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        googleId: googleProfile.googleId,
        email: googleProfile.email,
        name: googleProfile.name,
        picture: googleProfile.picture,
        establishment_id: newEstablishment.id,
        role: UserRole.PROPRIETARIO,
      });
      expect(mockNotificationService.sendAdminNewSignupAlert).toHaveBeenCalledWith(
        establishmentName,
        googleProfile.email,
      );
      expect(result).toBeDefined();
      expect(result.role).toBe(UserRole.PROPRIETARIO);
    });

    it('deve registrar admin do sistema com status aprovado', async () => {
      const googleProfile = {
        googleId: '456',
        email: 'eduardo.klug7@gmail.com',
        name: 'Admin User',
        picture: 'http://example.com/admin.jpg',
      };
      const establishmentName = 'Admin Establishment';

      const adminEstablishment = {
        id: 'est-admin',
        name: establishmentName,
        email: googleProfile.email,
        statusAprovacao: ApprovalStatus.APROVADO,
      };

      const adminUser = {
        id: 'user-admin',
        googleId: googleProfile.googleId,
        email: googleProfile.email,
        name: googleProfile.name,
        picture: googleProfile.picture,
        establishment_id: adminEstablishment.id,
        role: UserRole.ADMINISTRADOR_SISTEMA,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockEstablishmentRepository.create.mockReturnValue(adminEstablishment);
      mockEstablishmentRepository.save.mockResolvedValue(adminEstablishment);
      mockUserRepository.create.mockReturnValue(adminUser);
      mockUserRepository.save.mockResolvedValue(adminUser);
      mockUserRepository.findOne.mockResolvedValueOnce({
        ...adminUser,
        establishment: adminEstablishment,
      });

      const result = await service.registerUser(googleProfile, establishmentName);

      expect(result.role).toBe(UserRole.ADMINISTRADOR_SISTEMA);
      expect(result.establishment.statusAprovacao).toBe(ApprovalStatus.APROVADO);
      expect(mockNotificationService.sendAdminNewSignupAlert).not.toHaveBeenCalled();
    });

    it('deve lançar erro se usuário já existir', async () => {
      const googleProfile = {
        googleId: '123',
        email: 'existing@example.com',
        name: 'Existing User',
        picture: 'http://example.com/pic.jpg',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: '1', googleId: '123' });

      await expect(service.registerUser(googleProfile, 'Test Bar')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('deve gerar token JWT e retornar dados do usuário', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'pic.jpg',
        establishment_id: 'est-1',
        role: UserRole.PROPRIETARIO,
        establishment: {
          id: 'est-1',
          name: 'Test Bar',
          statusAprovacao: ApprovalStatus.APROVADO,
        },
      } as User;

      mockJwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        establishmentId: user.establishment_id,
        role: user.role,
      });
      expect(result.access_token).toBe('jwt-token-123');
      expect(result.user.id).toBe(user.id);
      expect(result.user.establishment.name).toBe('Test Bar');
    });
  });

  describe('getUserById', () => {
    it('deve retornar usuário por ID', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        establishment: {
          id: 'est-1',
          name: 'Test Bar',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.getUserById('user-1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: ['establishment'],
      });
      expect(result).toEqual(user);
    });

    it('deve lançar UnauthorizedException se usuário não existir', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserById('invalid-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

