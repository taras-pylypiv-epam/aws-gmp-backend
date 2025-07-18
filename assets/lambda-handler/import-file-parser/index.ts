import { S3Event, S3EventRecord } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

interface ProductRecord {
  title: string;
  description: string;
  type: string;
  price: number
};

const s3 = new S3Client({ region: process.env.AWS_REGION });
const sqs = new SQSClient({ region: process.env.AWS_REGION });
const queueUrl = process.env.QUEUE_URL;

function validateEnv() {
  if (!process.env.QUEUE_URL) {
    throw new Error('Missing required environment variable: QUEUE_URL');
  }
}

async function getReadStream(eventRecord: S3EventRecord): Promise<Readable> {
  const bucket = eventRecord.s3.bucket.name;
  const key = decodeURIComponent(eventRecord.s3.object.key.replace(/\+/g, ' '));
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const response = await s3.send(new GetObjectCommand(params));
    const stream = response.Body as Readable;

    return stream;
  } catch (error) {
    const errMsg = `Error getting file ${key} from S3 bucket ${bucket}`;
    console.log(errMsg);
    console.log(error);

    throw new Error(errMsg);
  }
}

async function sendSqsMessage(data: ProductRecord): Promise<void> {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(data)
  };

  try {
    const { MessageId: messageId } = await sqs.send(new SendMessageCommand(params));
    console.log('Sent message', messageId);
  } catch (error) {
    const errMsg = `Error sending message for record ${data.title}`;
    console.log(errMsg);
    console.log(error);

    throw new Error(errMsg);
  }
}

export async function handler(event: S3Event): Promise<void> {
  validateEnv();

  const stream = await getReadStream(event.Records[0]);
  const csvOptions = {
    delimiter: ';',
    columns: ['title', 'description', 'type', 'price'],
    from_line: 2,
    cast: (value, context) => {
      if (context.column === 'price') {
        return parseInt(value);
      }

      return value;
    },
  };

  const results: Promise<void>[] = await new Promise((resolve, reject) => {
    const messagePromises: Promise<void>[] = [];

    stream
      .pipe(parse(csvOptions))
      .on('data', (record) => {
        const messagePromise = sendSqsMessage(record);
        messagePromises.push(messagePromise);
      })
      .on('end', () => resolve(messagePromises))
      .on('error', (error) => reject(error));
  });

  await Promise.all(results).catch((error) => {
    const errMsg = 'Error parsing imported file';
    console.log(errMsg);
    console.log(error);

    throw new Error(errMsg);
  });
}
