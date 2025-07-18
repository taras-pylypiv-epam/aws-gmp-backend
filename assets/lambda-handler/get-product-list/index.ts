import { products } from '/opt/nodejs/products';

const PRODUCTS = [...products];

export async function handler() {
  return {
    body: JSON.stringify(PRODUCTS),
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET'
    },
    statusCode: 200,
  };
}
