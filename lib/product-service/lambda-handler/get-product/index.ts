import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { products } from './products';

export async function handler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  const { pathParameters } = event;
  const product = products.find((productEntry) => productEntry.id === pathParameters?.product_id);

  if (!product) {
    return {
      body: JSON.stringify({ message: 'Product not found' }),
      statusCode: 404,
    };
  }

  return {
    body: JSON.stringify(product),
    statusCode: 200,
  };
}
