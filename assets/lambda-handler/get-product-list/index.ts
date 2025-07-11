import { products } from '/opt/nodejs/products';

const PRODUCTS = [...products];

export async function handler() {
  return {
    body: JSON.stringify({ data: PRODUCTS }),
    statusCode: 200,
  };
}
