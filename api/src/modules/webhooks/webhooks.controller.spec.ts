import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { ConversationsService } from '../conversations/conversations.service';
import { ConfigService } from '@nestjs/config';

describe('WebhooksController', () => {
  let controller: WebhooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: ConversationsService,
          useValue: {
            handleIncomingMessage: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
