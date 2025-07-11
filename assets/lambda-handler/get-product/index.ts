import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { products } from '/opt/nodejs/products';

const PRODUCTS = [...products];

export async function handler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  const { pathParameters } = event;
  const product = PRODUCTS.find((productEntry) => productEntry.id === pathParameters?.product_id);

  if (!product) {
    return {
      body: JSON.stringify({ message: 'Product not found' }),
      statusCode: 404,
    };
  }

  return {
    body: JSON.stringify({ data: product }),
    statusCode: 200,
  };
}
