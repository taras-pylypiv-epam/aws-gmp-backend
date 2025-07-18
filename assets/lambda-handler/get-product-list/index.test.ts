import { handler } from './';

describe('Get product list lambda handler', () => {
  test('should return product list', async () => {
    const { body, statusCode } = await handler();
    const products = JSON.parse(body);

    expect(statusCode).toBe(200);
    expect(products[0]).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      price: expect.any(Number),
    });
  });
});
