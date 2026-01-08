import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return status ok and timestamp', () => {
      const result = controller.healthCheck();

      // We check the structure of the response
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');

      // We check that the timestamp is indeed a valid date
      const timestampDate = new Date(result.timestamp);
      expect(timestampDate.toString()).not.toBe('Invalid Date');
    });
  });
});