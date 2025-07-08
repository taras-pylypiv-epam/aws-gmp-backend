import { products } from './products';

export async function handler() {
  return {
    body: JSON.stringify(products),
    statusCode: 200,
  };
}
