import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { buildAssetPath, AssetType } from '../../utils/assets';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsLayer = new lambda.LayerVersion(this, 'products-layer', {
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      code: lambda.Code.fromAsset(buildAssetPath('products', AssetType.Layer)),
    });

    const getProductListLambda = new lambda.Function(this, 'get-product-list', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(buildAssetPath('get-product-list')),
      layers: [productsLayer],
    });

    const getProductByIdLambda = new lambda.Function(this, 'get-product-by-id', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(buildAssetPath('get-product')),
      layers: [productsLayer],
    });

    const api = new apigateway.RestApi(this, 'products-api', {
      restApiName: 'Product Service API',
      description: 'API serves lambda functions from Product Service'
    });

    const productListIntegration = new apigateway.LambdaIntegration(getProductListLambda, {});
    const productListResource = api.root.addResource('products');
    productListResource.addMethod('GET', productListIntegration);

    const productByIdIntegration = new apigateway.LambdaIntegration(getProductByIdLambda, {});
    const productByIdResource = productListResource.addResource('{product_id}');
    productByIdResource.addMethod('GET', productByIdIntegration);

    const createProductTopic = new sns.Topic(this, 'create-product-topic');
    const emailSubBooks = process.env.EMAIL_SUB_BOOKS!;
    const emailSubToys = process.env.EMAIL_SUB_TOYS!;

    createProductTopic.addSubscription(new EmailSubscription(emailSubBooks, {
      filterPolicyWithMessageBody: {
        type: sns.FilterOrPolicy.filter(sns.SubscriptionFilter.stringFilter({
          allowlist: ['book']
        }))
      }
    }));
    createProductTopic.addSubscription(new EmailSubscription(emailSubToys, {
      filterPolicyWithMessageBody: {
        type: sns.FilterOrPolicy.filter(sns.SubscriptionFilter.stringFilter({
          allowlist: ['toy']
        }))
      }
    }));

    const catalogBatchProcess = new lambda.Function(this, 'catalog-batch-process', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(buildAssetPath('catalog-batch-process')),
      environment: {
        TOPIC_ARN: createProductTopic.topicArn
      },
    });

    createProductTopic.grantPublish(catalogBatchProcess);

    const catalogItemsQueue = new sqs.Queue(this, 'catalog-items-queue');
    catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, { batchSize: 5 }));

    this.exportValue(catalogItemsQueue.queueArn, { name: 'catalogItemsQueueArn' });
  }
}
