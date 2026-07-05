import request from 'supertest';
import app from '../src/app';
import { db, pool } from '../src/config/db';
import { users, items } from '../src/db/schema';

describe('CRUD Items Endpoints', () => {
  let userToken: string;
  let userId: number;
  let otherUserToken: string;
  let createdItemId: number;

  beforeAll(async () => {
    // Clear tables
    await db.delete(items);
    await db.delete(users);

    // Register primary test user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'owner@example.com', password: 'password123' });
    userId = userRes.body.user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@example.com', password: 'password123' });
    userToken = loginRes.body.token;

    // Register another user to test isolation
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'other@example.com', password: 'password123' });

    const otherLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'other@example.com', password: 'password123' });
    otherUserToken = otherLoginRes.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/items', () => {
    it('should fail to create item without token', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Laptop', price: 999.99 });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Authentication token required');
    });

    it('should create a new item for authenticated user', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Laptop',
          description: 'A powerful coding laptop',
          price: 1299.50,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Item created successfully');
      expect(response.body.item).toHaveProperty('id');
      expect(response.body.item).toHaveProperty('name', 'Laptop');
      expect(response.body.item).toHaveProperty('price', 1299.50);
      expect(response.body.item).toHaveProperty('userId', userId);
      createdItemId = response.body.item.id;
    });

    it('should fail to create item with invalid price', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Invalid Item',
          price: -50,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Price must be a positive number');
    });
  });

  describe('GET /api/items', () => {
    it('should get all items owned by the authenticated user', async () => {
      const response = await request(app)
        .get('/api/items')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].id).toBe(createdItemId);
    });

    it('should return empty list of items for the other user', async () => {
      const response = await request(app)
        .get('/api/items')
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(0);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should retrieve item by ID if owned by user', async () => {
      const response = await request(app)
        .get(`/api/items/${createdItemId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.item).toHaveProperty('name', 'Laptop');
    });

    it('should fail to retrieve item owned by someone else', async () => {
      const response = await request(app)
        .get(`/api/items/${createdItemId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Item not found');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update item successfully if owned by user', async () => {
      const response = await request(app)
        .put(`/api/items/${createdItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Gaming Laptop',
          price: 1599.99,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Item updated successfully');
      expect(response.body.item).toHaveProperty('name', 'Gaming Laptop');
      expect(response.body.item).toHaveProperty('price', 1599.99);
    });

    it('should fail to update item owned by someone else', async () => {
      const response = await request(app)
        .put(`/api/items/${createdItemId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          name: 'Hacked Laptop',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Item not found or unauthorized');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should fail to delete item owned by someone else', async () => {
      const response = await request(app)
        .delete(`/api/items/${createdItemId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Item not found or unauthorized');
    });

    it('should delete item successfully if owned by user', async () => {
      const response = await request(app)
        .delete(`/api/items/${createdItemId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Item deleted successfully');

      // Verify it's gone
      const verifyResponse = await request(app)
        .get(`/api/items/${createdItemId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(verifyResponse.status).toBe(404);
    });
  });
});
