import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../common/enums';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-1',
    email: 'joao@test.com',
    name: 'João Silva',
    role: UserRole.PROPRIETARIO,
    active: true,
    establishment_id: 'est-1',
    establishment: {
      id: 'est-1',
      name: 'Bar do João',
      active: true,
    },
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return user data', async () => {
      const payload = {
        sub: 'user-1',
        email: 'joao@test.com',
        establishmentId: 'est-1',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: ['establishment'],
      });
      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        establishmentId: mockUser.establishment_id,
        establishment: mockUser.establishment,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const payload = {
        sub: 'invalid-id',
        email: 'invalid@test.com',
        establishmentId: 'est-1',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Usuário não autorizado',
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const payload = {
        sub: 'user-1',
        email: 'joao@test.com',
        establishmentId: 'est-1',
      };

      const inactiveUser = { ...mockUser, active: false };
      mockUserRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should validate with optional role in payload', async () => {
      const payload = {
        sub: 'user-1',
        email: 'joao@test.com',
        establishmentId: 'est-1',
        role: UserRole.PROPRIETARIO,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result.role).toBe(UserRole.PROPRIETARIO);
    });
  });
});

