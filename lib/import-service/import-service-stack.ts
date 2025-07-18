import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { buildAssetPath } from '../../utils/assets';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const importProductsBucket = new s3.Bucket(this, 'import-products-bucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const catalogItemsQueue = sqs.Queue.fromQueueArn(this, 'catalog-items-queue', cdk.Fn.importValue('catalogItemsQueueArn'));

    const importFileParser = new lambda.Function(this, 'import-file-parser', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(buildAssetPath('import-file-parser')),
      environment: {
        QUEUE_URL: catalogItemsQueue.queueUrl
      },
    });

    importFileParser.addEventSource(new S3EventSource(importProductsBucket, { events: [s3.EventType.OBJECT_CREATED_PUT] }));
    importProductsBucket.grantRead(importFileParser);
    catalogItemsQueue.grantSendMessages(importFileParser);
  }
}
