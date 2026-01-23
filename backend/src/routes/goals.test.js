const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Goal = require('../models/Goal');
const Step = require('../models/Step');

describe('Goals API', () => {
  let testUserId;

  beforeAll(async () => {
    // Create a test user ID
    testUserId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    // Clean up test data
    await Goal.deleteMany({ user_id: testUserId });
  });

  beforeEach(async () => {
    // Clean up before each test
    const goalIds = await Goal.find({ user_id: testUserId }).distinct('_id');
    if (goalIds.length > 0) {
      await Step.deleteMany({ goal_id: { $in: goalIds } });
    }
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
      expect(response.body.details).toBeDefined();
      expect(response.body.details.some(detail => detail.includes('Due date must be after start date'))).toBe(true);
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
      expect(response.body.details).toBeDefined();
      expect(response.body.details.some(detail => detail.toLowerCase().includes('required'))).toBe(true);
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
      expect(response.body.details).toBeDefined();
      expect(response.body.details.some(detail => detail.includes('Status must be one of'))).toBe(true);
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

  describe('Step Routes Integration', () => {
    let goalId;

    beforeEach(async () => {
      const goal = await Goal.create({
        user_id: testUserId,
        title: 'Goal for Steps',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
      });
      goalId = goal._id.toString();
    });

    it('should add a step and update goal progress', async () => {
      // Add first step
      await request(app)
        .post(`/api/goals/${goalId}/steps`)
        .send({ title: 'Step 1' })
        .expect(201);

      let goal = await Goal.findById(goalId);
      expect(goal.progress).toBe(0); // 0/1 completed

      // Add second step
      const response = await request(app)
        .post(`/api/goals/${goalId}/steps`)
        .send({ title: 'Step 2' })
        .expect(201);

      const stepId = response.body.data._id;

      // Mark second step as completed
      await request(app)
        .put(`/api/goals/${goalId}/steps/${stepId}`)
        .send({ is_completed: true })
        .expect(200);

      goal = await Goal.findById(goalId);
      expect(goal.progress).toBe(50); // 1/2 completed
    });

    it('should get all steps for a goal', async () => {
      await request(app)
        .post(`/api/goals/${goalId}/steps`)
        .send({ title: 'Step 1' });

      const response = await request(app)
        .get(`/api/goals/${goalId}/steps`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Step 1');
    });

    it('should delete a step and update goal progress', async () => {
      const res1 = await request(app)
        .post(`/api/goals/${goalId}/steps`)
        .send({ title: 'Step 1' });
      
      const stepId = res1.body.data._id;

      await request(app)
        .put(`/api/goals/${goalId}/steps/${stepId}`)
        .send({ is_completed: true });

      let goal = await Goal.findById(goalId);
      expect(goal.progress).toBe(100);

      await request(app)
        .delete(`/api/goals/${goalId}/steps/${stepId}`)
        .expect(200);

      goal = await Goal.findById(goalId);
      expect(goal.progress).toBe(0); // No steps left
    });
  });

  describe('POST /api/goals/:id/duplicate', () => {
    it('should duplicate a goal with its steps (Deep Copy)', async () => {
      // Create a goal with steps
      const goal = await Goal.create({
        user_id: testUserId,
        title: 'Original Goal',
        description: 'Original description',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-06-30'),
        priority: 'high',
        category: 'Work',
        status: 'active',
      });

      await Step.insertMany([
        { goal_id: goal._id, title: 'Step 1', is_completed: true },
        { goal_id: goal._id, title: 'Step 2', is_completed: false },
        { goal_id: goal._id, title: 'Step 3', is_completed: false },
      ]);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const newDueDate = new Date(today);
      newDueDate.setUTCDate(newDueDate.getUTCDate() + 180);

      const response = await request(app)
        .post(`/api/goals/${goal._id}/duplicate`)
        .send({
          user_id: testUserId.toString(),
          startDate: today.toISOString().split('T')[0],
          dueDate: newDueDate.toISOString().split('T')[0],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.goal).toBeDefined();
      expect(response.body.data.goal.title).toBe('Original Goal (Copy)');
      expect(response.body.data.goal.status).toBe('active');
      expect(response.body.data.goal.progress).toBe(0); // Progress should be reset
      expect(response.body.data.steps).toBeDefined();
      expect(response.body.data.steps.length).toBe(3);

      // Verify all steps are not completed (reset)
      const allStepsCompleted = response.body.data.steps.every(step => step.is_completed === false);
      expect(allStepsCompleted).toBe(true);

      // Verify steps have correct titles
      const stepTitles = response.body.data.steps.map(s => s.title);
      expect(stepTitles).toContain('Step 1');
      expect(stepTitles).toContain('Step 2');
      expect(stepTitles).toContain('Step 3');
    });

    it('should return 404 for non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/goals/${fakeId}/duplicate`)
        .send({
          user_id: testUserId.toString(),
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should require user_id', async () => {
      const goal = await Goal.create({
        user_id: testUserId,
        title: 'Test Goal',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
      });

      const response = await request(app)
        .post(`/api/goals/${goal._id}/duplicate`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('user_id');
    });
  });
});
