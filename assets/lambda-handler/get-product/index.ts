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
    body: JSON.stringify(product),
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET'
    },
    statusCode: 200,
  };
}
