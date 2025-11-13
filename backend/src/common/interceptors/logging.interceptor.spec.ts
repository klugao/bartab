import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({
          method: 'GET',
          url: '/test',
          body: { test: 'data' },
        }),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ result: 'success' })),
    };

    jest.spyOn(interceptor['logger'], 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log request information', (done) => {
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
      expect(interceptor['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('GET /test'),
      );
      done();
    });
  });

  it('should log response time', (done) => {
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
      expect(interceptor['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('Response Time:'),
      );
      expect(interceptor['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('ms'),
      );
      done();
    });
  });

  it('should pass through the request', (done) => {
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({ result: 'success' });
      done();
    });
  });

  it('should handle different HTTP methods', (done) => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    methods.forEach((method, index) => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: () => ({
            method,
            url: `/test-${method}`,
            body: {},
          }),
        }),
      } as any;

      interceptor.intercept(context, mockCallHandler).subscribe(() => {
        expect(interceptor['logger'].log).toHaveBeenCalledWith(
          expect.stringContaining(method),
        );
        if (index === methods.length - 1) {
          done();
        }
      });
    });
  });

  it('should log request body as JSON string', (done) => {
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
      expect(interceptor['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining('{"test":"data"}'),
      );
      done();
    });
  });
});

