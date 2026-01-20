const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

describe('Habits API', () => {
  let testUserId;

  beforeAll(async () => {
    // Create a test user ID
    testUserId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    // Clean up test data
    await Habit.deleteMany({ user_id: testUserId });
    await HabitLog.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Habit.deleteMany({ user_id: testUserId });
    await HabitLog.deleteMany({});
  });

  describe('POST /api/habits', () => {
    it('should create a new habit', async () => {
      const habitData = {
        user_id: testUserId.toString(),
        title: 'Test Habit',
        description: 'Test Description',
        frequency: 'daily',
        category: 'Health',
        status: 'active',
      };

      const response = await request(app)
        .post('/api/habits')
        .send(habitData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(habitData.title);
      expect(response.body.data.frequency).toBe(habitData.frequency);
      expect(response.body.data.frequency).toBe(habitData.frequency);
    });

    it('should require title', async () => {
      const habitData = {
        user_id: testUserId.toString(),
        frequency: 'daily',
      };

      const response = await request(app)
        .post('/api/habits')
        .send(habitData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should require user_id', async () => {
      const habitData = {
        title: 'Test Habit',
        frequency: 'daily',
      };

      const response = await request(app)
        .post('/api/habits')
        .send(habitData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('user_id');
    });

    it('should reject invalid frequency', async () => {
      const habitData = {
        user_id: testUserId.toString(),
        title: 'Test Habit',
        frequency: 'invalid',
      };

      const response = await request(app)
        .post('/api/habits')
        .send(habitData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Frequency must be one of');
    });

    it('should default to daily frequency if not provided', async () => {
      const habitData = {
        user_id: testUserId.toString(),
        title: 'Test Habit',
      };

      const response = await request(app)
        .post('/api/habits')
        .send(habitData)
        .expect(201);

      expect(response.body.data.frequency).toBe('daily');
    });
  });

  describe('GET /api/habits', () => {
    it('should get all habits for a user', async () => {
      // Create test habits
      // Create test habits
      await Habit.create({
        user_id: testUserId,
        title: 'Habit 1',
        frequency: 'daily',
      });
      await Habit.create({
        user_id: testUserId,
        title: 'Habit 2',
        frequency: 'weekly',
      });

      const response = await request(app)
        .get(`/api/habits?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter habits by status', async () => {
      await Habit.create({
        user_id: testUserId,
        title: 'Active Habit',
        status: 'active',
      });
      await Habit.create({
        user_id: testUserId,
        title: 'Archived Habit',
        status: 'archived',
      });

      const response = await request(app)
        .get(`/api/habits?user_id=${testUserId.toString()}&status=active`)
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe('active');
    });

    it('should filter habits by frequency', async () => {
      await Habit.create({
        user_id: testUserId,
        title: 'Daily Habit',
        frequency: 'daily',
      });
      await Habit.create({
        user_id: testUserId,
        title: 'Weekly Habit',
        frequency: 'weekly',
      });

      const response = await request(app)
        .get(`/api/habits?user_id=${testUserId.toString()}&frequency=daily`)
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.data[0].frequency).toBe('daily');
    });
  });

  describe('GET /api/habits/:id', () => {
    it('should get a habit by ID', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
        frequency: 'daily',
      });

      const response = await request(app)
        .get(`/api/habits/${habit._id}?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Habit');
    });

    it('should return 404 for non-existent habit', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/habits/${fakeId}?user_id=${testUserId.toString()}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Habit not found');
    });
  });

  describe('PUT /api/habits/:id', () => {
    it('should update a habit', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Original Title',
        frequency: 'daily',
      });

      const response = await request(app)
        .put(`/api/habits/${habit._id}`)
        .send({
          user_id: testUserId.toString(),
          title: 'Updated Title',
          description: 'Updated Description',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.description).toBe('Updated Description');
    });

    it('should reject invalid status', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
      });

      const response = await request(app)
        .put(`/api/habits/${habit._id}`)
        .send({
          user_id: testUserId.toString(),
          status: 'invalid',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Status must be one of');
    });

    it('should allow archiving a habit', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
        status: 'active',
      });

      const response = await request(app)
        .put(`/api/habits/${habit._id}`)
        .send({
          user_id: testUserId.toString(),
          status: 'archived',
        })
        .expect(200);

      expect(response.body.data.status).toBe('archived');
    });
  });

  describe('DELETE /api/habits/:id', () => {
    it('should delete a habit', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
      });

      const response = await request(app)
        .delete(`/api/habits/${habit._id}?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify habit is deleted
      const deletedHabit = await Habit.findById(habit._id);
      expect(deletedHabit).toBeNull();
    });

    it('should delete associated logs when deleting a habit', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
      });

      // Create some logs
      await HabitLog.create({
        habit_id: habit._id,
        date: new Date('2024-01-01'),
        is_completed: true,
      });
      await HabitLog.create({
        habit_id: habit._id,
        date: new Date('2024-01-02'),
        is_completed: true,
      });

      await request(app)
        .delete(`/api/habits/${habit._id}?user_id=${testUserId.toString()}`)
        .expect(200);

      // Verify logs are deleted
      const logs = await HabitLog.find({ habit_id: habit._id });
      expect(logs).toHaveLength(0);
    });

    it('should return 404 for non-existent habit', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/habits/${fakeId}?user_id=${testUserId.toString()}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Habit not found');
    });
  });

  describe('POST /api/habits/:id/log', () => {
    it('should log a habit completion for a specific date', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
        frequency: 'daily',
      });

      const logDate = '2024-01-15';

      const response = await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({
          user_id: testUserId.toString(),
          date: logDate,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.habit_id.toString()).toBe(habit._id.toString());
      expect(response.body.data.is_completed).toBe(true);

      // Verify date is stored at midnight UTC
      const storedDate = new Date(response.body.data.date);
      expect(storedDate.getUTCHours()).toBe(0);
      expect(storedDate.getUTCMinutes()).toBe(0);
    });

    it('should use today if date is not provided', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
      });

      const response = await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({
          user_id: testUserId.toString(),
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      const logDate = new Date(response.body.data.date);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      expect(logDate.getTime()).toBe(today.getTime());
    });

    it('should prevent double counting (same date)', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
      });

      const logDate = '2024-01-15';

      // First log
      await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({
          user_id: testUserId.toString(),
          date: logDate,
        })
        .expect(201);

      // Try to log again for the same date
      const response = await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({
          user_id: testUserId.toString(),
          date: logDate,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already logged');
    });

    it('should allow logging different dates', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
      });

      // Log first date
      await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({
          user_id: testUserId.toString(),
          date: '2024-01-15',
        })
        .expect(201);

      // Log second date (should succeed)
      const response = await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({
          user_id: testUserId.toString(),
          date: '2024-01-16',
        })
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify both logs exist
      const logs = await HabitLog.find({ habit_id: habit._id });
      expect(logs).toHaveLength(2);
    });

    it('should return 404 for non-existent habit', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/habits/${fakeId}/log`)
        .send({
          user_id: testUserId.toString(),
          date: '2024-01-15',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Habit not found');
    });

    it('should reject invalid date format', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
      });

      const response = await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({
          user_id: testUserId.toString(),
          date: 'invalid-date',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid date format');
    });

    it('should normalize dates to UTC midnight', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
      });

      // Send date with time component
      const response = await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({
          user_id: testUserId.toString(),
          date: '2024-01-15T14:30:00Z',
        })
        .expect(201);

      const logDate = new Date(response.body.data.date);
      expect(logDate.getUTCHours()).toBe(0);
      expect(logDate.getUTCMinutes()).toBe(0);
      expect(logDate.getUTCSeconds()).toBe(0);
      expect(logDate.getUTCMilliseconds()).toBe(0);
    });
  });

  describe('Habit Streaks Integration', () => {
    it('should calculate and return streaks when logging', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Streak Habit',
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Log yesterday
      await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({ user_id: testUserId.toString(), date: yesterdayStr })
        .expect(201);

      // Log today
      const response = await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({ user_id: testUserId.toString(), date: todayStr })
        .expect(201);

      expect(response.body.data.current_streak).toBe(2);
      expect(response.body.data.best_streak).toBe(2);

      // Verify habit in DB
      const updatedHabit = await Habit.findById(habit._id);
      expect(updatedHabit.current_streak).toBe(2);
      expect(updatedHabit.best_streak).toBe(2);
    });

    it('should reset streak if a day is missed when fetching', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Missed Habit',
        current_streak: 5, // Manually set a streak
        best_streak: 5,
      });

      // Log 2 days ago
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      await HabitLog.create({
        habit_id: habit._id,
        date: twoDaysAgo,
        is_completed: true,
      });

      // Fetch habit - streak should be recalculated to 0 because yesterday was missed
      const response = await request(app)
        .get(`/api/habits/${habit._id}?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.data.current_streak).toBe(0);
      expect(response.body.data.best_streak).toBe(5); // Best streak preserved
    });

    it('should calculate and return weekly completion rate when logging', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Weekly Rate Habit',
      });

      const todayStr = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .post(`/api/habits/${habit._id}/log`)
        .send({ user_id: testUserId.toString(), date: todayStr })
        .expect(201);

      // 1 completion in 7 days = 14%
      expect(response.body.data.weekly_completion_rate).toBe(14);

      // Verify habit in DB
      const updatedHabit = await Habit.findById(habit._id);
      expect(updatedHabit.weekly_completion_rate).toBe(14);
    });
  });
});
