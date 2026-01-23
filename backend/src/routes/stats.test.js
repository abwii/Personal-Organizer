const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

describe('Stats API', () => {
  let testUserId;

  beforeAll(async () => {
    // Create a test user ID
    testUserId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    // Clean up test data
    const habitIds = await Habit.find({ user_id: testUserId }).distinct('_id');
    if (habitIds.length > 0) {
      await HabitLog.deleteMany({ habit_id: { $in: habitIds } });
    }
    await Habit.deleteMany({ user_id: testUserId });
    await Goal.deleteMany({ user_id: testUserId });
  });

  beforeEach(async () => {
    // Clean up before each test
    const habitIds = await Habit.find({ user_id: testUserId }).distinct('_id');
    if (habitIds.length > 0) {
      await HabitLog.deleteMany({ habit_id: { $in: habitIds } });
    }
    await Habit.deleteMany({ user_id: testUserId });
    await Goal.deleteMany({ user_id: testUserId });
  });

  describe('GET /api/stats', () => {
    it('should return stats data with goal progression, heatmap, and category stats', async () => {
      // Create test goals
      const goal1 = await Goal.create({
        user_id: testUserId,
        title: 'Test Goal 1',
        category: 'Health',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        status: 'active',
        progress: 50,
        priority: 'high',
      });

      const goal2 = await Goal.create({
        user_id: testUserId,
        title: 'Test Goal 2',
        category: 'Health',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-06-30'),
        status: 'completed',
        progress: 100,
        priority: 'medium',
      });

      // Create test habits
      const habit1 = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit 1',
        category: 'Health',
        frequency: 'daily',
        status: 'active',
        current_streak: 5,
        weekly_completion_rate: 85,
      });

      const habit2 = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit 2',
        category: 'Fitness',
        frequency: 'daily',
        status: 'active',
        current_streak: 3,
        weekly_completion_rate: 71,
      });

      // Create some habit logs
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      today.setUTCMilliseconds(0);
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCMilliseconds(0);

      await HabitLog.create({ habit_id: habit1._id, date: today, is_completed: true });
      await HabitLog.create({ habit_id: habit1._id, date: yesterday, is_completed: true });
      await HabitLog.create({ habit_id: habit2._id, date: today, is_completed: true });

      const response = await request(app)
        .get(`/api/stats?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('goalProgression');
      expect(response.body.data).toHaveProperty('habitHeatmap');
      expect(response.body.data).toHaveProperty('categoryStats');

      // Check goal progression
      expect(response.body.data.goalProgression).toHaveLength(2);
      expect(response.body.data.goalProgression[0]).toHaveProperty('title');
      expect(response.body.data.goalProgression[0]).toHaveProperty('category');
      expect(response.body.data.goalProgression[0]).toHaveProperty('currentProgress');
      expect(response.body.data.goalProgression[0]).toHaveProperty('expectedProgress');

      // Check heatmap
      expect(Array.isArray(response.body.data.habitHeatmap)).toBe(true);
      expect(response.body.data.habitHeatmap.length).toBeGreaterThan(0);
      expect(response.body.data.habitHeatmap[0]).toHaveProperty('date');
      expect(response.body.data.habitHeatmap[0]).toHaveProperty('count');

      // Check category stats
      expect(response.body.data.categoryStats).toHaveProperty('goals');
      expect(response.body.data.categoryStats).toHaveProperty('habits');
      expect(response.body.data.categoryStats.goals).toHaveProperty('Health');
      expect(response.body.data.categoryStats.habits).toHaveProperty('Health');
      expect(response.body.data.categoryStats.habits).toHaveProperty('Fitness');
    });

    it('should require user_id', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('user_id');
    });

    it('should handle empty data gracefully', async () => {
      const response = await request(app)
        .get(`/api/stats?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.goalProgression).toHaveLength(0);
      expect(response.body.data.habitHeatmap).toHaveLength(0);
      expect(Object.keys(response.body.data.categoryStats.goals)).toHaveLength(0);
      expect(Object.keys(response.body.data.categoryStats.habits)).toHaveLength(0);
    });

    it('should calculate correct category statistics', async () => {
      // Create goals in different categories
      await Goal.create({
        user_id: testUserId,
        title: 'Goal 1',
        category: 'Health',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        status: 'completed',
        progress: 100,
      });

      await Goal.create({
        user_id: testUserId,
        title: 'Goal 2',
        category: 'Health',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        status: 'active',
        progress: 50,
      });

      await Goal.create({
        user_id: testUserId,
        title: 'Goal 3',
        category: 'Career',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        status: 'completed',
        progress: 100,
      });

      // Create habits
      await Habit.create({
        user_id: testUserId,
        title: 'Habit 1',
        category: 'Health',
        frequency: 'daily',
        status: 'active',
        current_streak: 10,
        weekly_completion_rate: 100,
      });

      await Habit.create({
        user_id: testUserId,
        title: 'Habit 2',
        category: 'Health',
        frequency: 'daily',
        status: 'active',
        current_streak: 5,
        weekly_completion_rate: 85,
      });

      const response = await request(app)
        .get(`/api/stats?user_id=${testUserId.toString()}`)
        .expect(200);

      // Check Health category stats
      const healthGoals = response.body.data.categoryStats.goals.Health;
      expect(healthGoals.total).toBe(2);
      expect(healthGoals.completed).toBe(1);
      expect(healthGoals.active).toBe(1);
      expect(healthGoals.successRate).toBe(50); // 1 completed out of 2

      // Check Career category stats
      const careerGoals = response.body.data.categoryStats.goals.Career;
      expect(careerGoals.total).toBe(1);
      expect(careerGoals.completed).toBe(1);
      expect(careerGoals.successRate).toBe(100);

      // Check habit category stats
      const healthHabits = response.body.data.categoryStats.habits.Health;
      expect(healthHabits.total).toBe(2);
      expect(healthHabits.active).toBe(2);
      expect(healthHabits.averageStreak).toBe(8); // (10 + 5) / 2 = 7.5 rounded to 8
      expect(healthHabits.averageWeeklyCompletion).toBe(93); // (100 + 85) / 2 = 92.5 rounded to 93
    });
  });
});
