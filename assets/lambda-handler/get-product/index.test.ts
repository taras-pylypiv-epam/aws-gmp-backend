import { APIGatewayEvent } from 'aws-lambda';
import { handler } from './';
import { products } from '../../layers/products/products';

describe('Get product lambda handler', () => {
  test('should return product by id', async () => {
    const event: Partial<APIGatewayEvent> = { pathParameters: { product_id: products[0].id } };
    const { body, statusCode } = await handler(event as APIGatewayEvent);
    const product = JSON.parse(body);

    expect(statusCode).toBe(200);
    expect(product).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      price: expect.any(Number),
    });
  });

  test('should return 404 if product not found', async () => {
    const event: Partial<APIGatewayEvent> = { pathParameters: { product_id: 'test' } };
    const { body, statusCode } = await handler(event as APIGatewayEvent);
    const { message } = JSON.parse(body);

    expect(statusCode).toBe(404);
    expect(message).toBe('Product not found');
  });
});
