import { handler } from '../assets/lambda-handler/get-product-list';

describe('Get product list lambda handler', () => {
  test('should return product list', async () => {
    const { body, statusCode } = await handler();
    const { data } = JSON.parse(body);

    expect(statusCode).toBe(200);
    expect(data[0]).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      price: expect.any(Number),
    });
  });
});
