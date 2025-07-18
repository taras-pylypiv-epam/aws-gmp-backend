import { SQSRecord } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import * as uuid from 'uuid';

import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { handler } from './';

const snsMock = mockClient(SNSClient);

describe('Catalog batch process lambda handler', () => {
  beforeEach(() => {
    snsMock.reset();
    process.env = {};
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should throw an error if a required environment variable is missing', async () => {
    await expect(handler({Records: []}))
      .rejects
      .toThrow('Missing required environment variable: TOPIC_ARN');
  });

  test('should call uuidv4 for new records', async () => {
    process.env.TOPIC_ARN = 'TOPIC_ARN';

    const uuidSpy = jest.spyOn(uuid, 'v4');
    const mockRecordBody = { title: 'Product 1' };
    const mockRecords: Partial<SQSRecord>[] = [
      {body: JSON.stringify(mockRecordBody)}
    ];

    snsMock.on(PublishCommand).resolves({
      MessageId: '12345678-1111-2222-3333-111122223333',
    });

    await handler({ Records: mockRecords as SQSRecord[] });
    expect(uuidSpy).toHaveBeenCalled();
  });

  test('should send push message to SNS', async () => {
    process.env.TOPIC_ARN = 'TOPIC_ARN';

    const mockRecordBody = { title: 'Product 1' };
    const mockRecords: Partial<SQSRecord>[] = [
      {body: JSON.stringify(mockRecordBody)}
    ];

    snsMock.on(PublishCommand).resolves({
      MessageId: '12345678-1111-2222-3333-111122223333',
    });

    await handler({ Records: mockRecords as SQSRecord[] });
    expect(snsMock).toHaveReceivedCommand(PublishCommand);
  });
});
