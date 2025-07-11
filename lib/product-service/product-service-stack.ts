import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';

const ASSETS_PATH = '/../../assets';

function buildAssetPath(assetName: string, assetType?: string) {
  if (assetType === 'layer') {
    return path.join(__dirname, `${ASSETS_PATH}/layers/${assetName}/dist`);
  }

  return path.join(__dirname, `${ASSETS_PATH}/lambda-handler/${assetName}/dist/index.zip`);
}

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsLayer = new lambda.LayerVersion(this, 'products-layer', {
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      code: lambda.Code.fromAsset(buildAssetPath('products', 'layer')),
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
  }
}
