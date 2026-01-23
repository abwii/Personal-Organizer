const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../index');
const GoalTemplate = require('../models/GoalTemplate');
const Goal = require('../models/Goal');
const Step = require('../models/Step');

describe('Templates API', () => {
  let testUserId;
  let token;

  beforeAll(async () => {
    testUserId = new mongoose.Types.ObjectId();
    token = jwt.sign({ user: { id: testUserId } }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '1h',
    });
  });

  afterAll(async () => {
    // Clean up test data
    const goalIds = await Goal.find({ user_id: testUserId }).distinct('_id');
    if (goalIds.length > 0) {
      await Step.deleteMany({ goal_id: { $in: goalIds } });
    }
    await Goal.deleteMany({ user_id: testUserId });
    await GoalTemplate.deleteMany({ createdBy: testUserId });
  });

  beforeEach(async () => {
    // Clean up before each test
    const goalIds = await Goal.find({ user_id: testUserId }).distinct('_id');
    if (goalIds.length > 0) {
      await Step.deleteMany({ goal_id: { $in: goalIds } });
    }
    await Goal.deleteMany({ user_id: testUserId });
  });

  describe('GET /api/templates', () => {
    it('should get all templates (system templates)', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should include user templates when user_id is provided', async () => {
      // Create a user template
      const userTemplate = await GoalTemplate.create({
        name: 'User Template',
        description: 'Test user template',
        isSystem: false,
        createdBy: testUserId,
        steps: [{ title: 'Step 1', order: 1 }],
      });

      const response = await request(app)
        .get(`/api/templates?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const templateNames = response.body.data.map(t => t.name);
      expect(templateNames).toContain('User Template');

      await GoalTemplate.findByIdAndDelete(userTemplate._id);
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should get a template by ID', async () => {
      // Create a test template
      const template = await GoalTemplate.create({
        name: 'Test Template',
        description: 'Test description',
        isSystem: true,
        steps: [{ title: 'Step 1', order: 1 }],
      });

      const response = await request(app)
        .get(`/api/templates/${template._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Template');

      await GoalTemplate.findByIdAndDelete(template._id);
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/templates/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/templates/:id/goals', () => {
    it('should create a goal from a template with steps (Deep Copy)', async () => {
      // Create a test template with steps
      const template = await GoalTemplate.create({
        name: 'Learn Language Template',
        description: 'Template for learning a language',
        isSystem: true,
        estimatedDuration: 30,
        steps: [
          { title: 'Install app', order: 1 },
          { title: 'Study daily', order: 2 },
          { title: 'Practice conversation', order: 3 },
        ],
      });

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const dueDate = new Date(today);
      dueDate.setUTCDate(dueDate.getUTCDate() + 30);

      const response = await request(app)
        .post(`/api/templates/${template._id}/goals`)
        .send({
          user_id: testUserId.toString(),
          startDate: today.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.goal).toBeDefined();
      expect(response.body.data.goal.title).toBe('Learn Language Template');
      expect(response.body.data.steps).toBeDefined();
      expect(response.body.data.steps.length).toBe(3);

      // Verify steps were created
      const createdGoal = await Goal.findById(response.body.data.goal._id);
      const steps = await Step.find({ goal_id: createdGoal._id });
      expect(steps.length).toBe(3);
      expect(steps[0].title).toBe('Install app');
      expect(steps[1].title).toBe('Study daily');
      expect(steps[2].title).toBe('Practice conversation');

      await GoalTemplate.findByIdAndDelete(template._id);
    });

    it('should return 404 for non-existent template', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/templates/${fakeId}/goals`)
        .send({
          user_id: testUserId.toString(),
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should require user_id', async () => {
      const template = await GoalTemplate.create({
        name: 'Test Template',
        isSystem: true,
        steps: [],
      });

      const response = await request(app)
        .post(`/api/templates/${template._id}/goals`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('user_id');

      await GoalTemplate.findByIdAndDelete(template._id);
    });
  });
});
