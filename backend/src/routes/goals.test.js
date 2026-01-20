const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Goal = require('../models/Goal');

describe('Goals API', () => {
  let testUserId;

  beforeAll(async () => {
    // Create a test user ID
    testUserId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    // Clean up test data
    await Goal.deleteMany({ user_id: testUserId });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Goal.deleteMany({ user_id: testUserId });
  });

  describe('POST /api/goals', () => {
    it('should create a new goal', async () => {
      const goalData = {
        user_id: testUserId.toString(),
        title: 'Test Goal',
        description: 'Test Description',
        startDate: '2024-01-01',
        dueDate: '2024-12-31',
        priority: 'high',
        category: 'Work',
        status: 'active',
      };

      const response = await request(app)
        .post('/api/goals')
        .send(goalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(goalData.title);
      expect(response.body.data.priority).toBe(goalData.priority);
    });

    it('should reject goal with dueDate before startDate', async () => {
      const goalData = {
        user_id: testUserId.toString(),
        title: 'Test Goal',
        startDate: '2024-12-31',
        dueDate: '2024-01-01', // Invalid: dueDate before startDate
        priority: 'medium',
      };

      const response = await request(app)
        .post('/api/goals')
        .send(goalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Due date must be after start date');
    });

    it('should require title, startDate, and dueDate', async () => {
      const goalData = {
        user_id: testUserId.toString(),
        priority: 'high',
      };

      const response = await request(app)
        .post('/api/goals')
        .send(goalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/goals', () => {
    beforeEach(async () => {
      // Create test goals
      await Goal.create([
        {
          user_id: testUserId,
          title: 'Goal 1',
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-06-30'),
          priority: 'high',
          status: 'active',
        },
        {
          user_id: testUserId,
          title: 'Goal 2',
          startDate: new Date('2024-02-01'),
          dueDate: new Date('2024-07-31'),
          priority: 'medium',
          status: 'completed',
        },
      ]);
    });

    it('should get all goals for a user', async () => {
      const response = await request(app)
        .get('/api/goals')
        .query({ user_id: testUserId.toString() })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter goals by status', async () => {
      const response = await request(app)
        .get('/api/goals')
        .query({ user_id: testUserId.toString(), status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(goal => goal.status === 'completed')).toBe(true);
    });

    it('should filter goals by priority', async () => {
      const response = await request(app)
        .get('/api/goals')
        .query({ user_id: testUserId.toString(), priority: 'high' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(goal => goal.priority === 'high')).toBe(true);
    });
  });

  describe('GET /api/goals/:id', () => {
    let goalId;

    beforeEach(async () => {
      const goal = await Goal.create({
        user_id: testUserId,
        title: 'Test Goal',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        priority: 'medium',
      });
      goalId = goal._id.toString();
    });

    it('should get a goal by ID', async () => {
      const response = await request(app)
        .get(`/api/goals/${goalId}?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(goalId);
      expect(response.body.data.title).toBe('Test Goal');
    });

    it('should return 404 for non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/goals/${fakeId}?user_id=${testUserId.toString()}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Goal not found');
    });
  });

  describe('PUT /api/goals/:id', () => {
    let goalId;

    beforeEach(async () => {
      const goal = await Goal.create({
        user_id: testUserId,
        title: 'Original Title',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        priority: 'low',
        status: 'active',
      });
      goalId = goal._id.toString();
    });

    it('should update a goal', async () => {
      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .send({
          user_id: testUserId.toString(),
          title: 'Updated Title',
          priority: 'high',
          status: 'completed',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.status).toBe('completed');
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .send({
          user_id: testUserId.toString(),
          status: 'invalid_status',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Status must be one of');
    });
  });

  describe('DELETE /api/goals/:id', () => {
    let goalId;

    beforeEach(async () => {
      const goal = await Goal.create({
        user_id: testUserId,
        title: 'Goal to Delete',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        priority: 'medium',
      });
      goalId = goal._id.toString();
    });

    it('should delete a goal', async () => {
      const response = await request(app)
        .delete(`/api/goals/${goalId}?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Goal deleted successfully');

      // Verify goal is deleted
      const goal = await Goal.findById(goalId);
      expect(goal).toBeNull();
    });

    it('should return 404 for non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/api/goals/${fakeId}?user_id=${testUserId.toString()}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Goal not found');
    });
  });

  describe('Goal Progress Integration', () => {
    it('should calculate progress when creating a goal with steps', async () => {
      const goalData = {
        user_id: testUserId.toString(),
        title: 'Goal with Steps',
        startDate: '2024-01-01',
        dueDate: '2024-12-31',
        steps: [
          { title: 'Step 1', is_completed: true },
          { title: 'Step 2', is_completed: false },
        ],
      };

      const response = await request(app)
        .post('/api/goals')
        .send(goalData)
        .expect(201);

      expect(response.body.data.progress).toBe(50);
      expect(response.body.data.steps).toHaveLength(2);
    });

    it('should update progress when updating steps', async () => {
      const goal = await Goal.create({
        user_id: testUserId,
        title: 'Update Progress Goal',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        steps: [
          { title: 'Step 1', is_completed: false },
        ],
      });

      const response = await request(app)
        .put(`/api/goals/${goal._id}`)
        .send({
          user_id: testUserId.toString(),
          steps: [
            { title: 'Step 1', is_completed: true },
            { title: 'Step 2', is_completed: true },
          ],
        })
        .expect(200);

      expect(response.body.data.progress).toBe(100);
      expect(response.body.data.steps).toHaveLength(2);
    });
  });
});
