import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from './google.strategy';
import { ConfigService } from '@nestjs/config';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-client-secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/auth/google/callback',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return user data from Google profile', async () => {
      const mockProfile = {
        id: 'google-id-123',
        emails: [{ value: 'test@gmail.com' }],
        displayName: 'Test User',
        photos: [{ value: 'https://photo.url/test.jpg' }],
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', mockProfile, done);

      expect(done).toHaveBeenCalledWith(null, {
        googleId: 'google-id-123',
        email: 'test@gmail.com',
        name: 'Test User',
        picture: 'https://photo.url/test.jpg',
      });
    });

    it('should handle profile without photo', async () => {
      const mockProfile = {
        id: 'google-id-456',
        emails: [{ value: 'noPhoto@gmail.com' }],
        displayName: 'No Photo User',
        photos: [],
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', mockProfile, done);

      expect(done).toHaveBeenCalledWith(null, {
        googleId: 'google-id-456',
        email: 'noPhoto@gmail.com',
        name: 'No Photo User',
        picture: undefined,
      });
    });
  });
});

