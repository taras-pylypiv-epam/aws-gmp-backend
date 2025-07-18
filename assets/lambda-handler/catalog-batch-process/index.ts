import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { v4 as uuidv4 } from 'uuid';

interface ProductRecord {
  id: string;
  title: string;
  description: string;
  price: number
};

const sns = new SNSClient({ region: process.env.AWS_REGION });
const topicArn = process.env.TOPIC_ARN;

function validateEnv() {
  if (!process.env.TOPIC_ARN) {
    throw new Error('Missing required environment variable: TOPIC_ARN');
  }
}

async function sendSnsMessage(data: ProductRecord) {
  const params = {
    Message: JSON.stringify(data),
    TopicArn: topicArn,
  };

  try {
    const { MessageId: messageId } = await sns.send(new PublishCommand(params));
    console.log('Topic message sent', messageId);
  } catch (error) {
    const errMsg = `Error sending topic message for record ${data.title}`;
    console.log(errMsg);
    console.log(error);

    throw new Error(errMsg);
  }
}

async function processRecord(record: SQSRecord) {
  const parsedBody = JSON.parse(record.body);
  const newRecord = { ...parsedBody };
  newRecord.id = uuidv4();

  await sendSnsMessage(newRecord);
}

export async function handler(event: SQSEvent) {
  validateEnv();

  const processPromises = event.Records.map((record) => processRecord(record));
  await Promise.all(processPromises).catch((error) => {
    const errMsg = 'Error processing catalog products';
    console.log(errMsg);
    console.log(error);

    throw new Error(errMsg);
  });
}
