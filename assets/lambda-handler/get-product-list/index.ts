import { products } from '/opt/nodejs/products';

export async function handler() {
  return {
    body: JSON.stringify({ data: products }),
    statusCode: 200,
  };
}
