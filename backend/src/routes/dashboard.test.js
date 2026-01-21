const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

describe('Dashboard API', () => {
  let testUserId;

  beforeAll(async () => {
    // Create a test user ID
    testUserId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    // Clean up test data - delete logs first to avoid foreign key issues
    const habitIds = await Habit.find({ user_id: testUserId }).distinct('_id');
    await HabitLog.deleteMany({ habit_id: { $in: habitIds } });
    await Habit.deleteMany({ user_id: testUserId });
    await Goal.deleteMany({ user_id: testUserId });
    // Final cleanup of any remaining logs
    await HabitLog.deleteMany({});
  });

  beforeEach(async () => {
    // Clean up before each test - ensure all related data is removed
    // Get habit IDs first, then delete logs, then habits
    const habitIds = await Habit.find({ user_id: testUserId }).distinct('_id');
    if (habitIds.length > 0) {
      await HabitLog.deleteMany({ habit_id: { $in: habitIds } });
    }
    await Habit.deleteMany({ user_id: testUserId });
    await Goal.deleteMany({ user_id: testUserId });
  });

  describe('GET /api/dashboard', () => {
    it('should return dashboard data with completed goals count and best streak', async () => {
      // Create completed goals
      await Goal.create({
        user_id: testUserId,
        title: 'Completed Goal 1',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        status: 'completed',
      });
      await Goal.create({
        user_id: testUserId,
        title: 'Completed Goal 2',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        status: 'completed',
      });
      await Goal.create({
        user_id: testUserId,
        title: 'Active Goal',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        status: 'active',
      });

      // Create habits with streaks
      const habit1 = await Habit.create({
        user_id: testUserId,
        title: 'Habit 1',
        frequency: 'daily',
        status: 'active',
        best_streak: 5,
      });
      const habit2 = await Habit.create({
        user_id: testUserId,
        title: 'Habit 2',
        frequency: 'daily',
        status: 'active',
        best_streak: 10,
      });

      const response = await request(app)
        .get(`/api/dashboard?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completed_goals_count).toBe(2);
      expect(response.body.data.best_streak).toBe(10);
      expect(Array.isArray(response.body.data.habits_today)).toBe(true);
    });

    it('should return 0 for completed goals count when no completed goals exist', async () => {
      await Goal.create({
        user_id: testUserId,
        title: 'Active Goal',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-12-31'),
        status: 'active',
      });

      const response = await request(app)
        .get(`/api/dashboard?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.data.completed_goals_count).toBe(0);
    });

    it('should return 0 for best streak when no habits exist', async () => {
      const response = await request(app)
        .get(`/api/dashboard?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.data.best_streak).toBe(0);
      expect(response.body.data.habits_today).toHaveLength(0);
    });

    it('should return only daily active habits for today', async () => {
      const dailyHabit1 = await Habit.create({
        user_id: testUserId,
        title: 'Daily Habit 1',
        frequency: 'daily',
        status: 'active',
      });
      const dailyHabit2 = await Habit.create({
        user_id: testUserId,
        title: 'Daily Habit 2',
        frequency: 'daily',
        status: 'active',
      });
      const weeklyHabit = await Habit.create({
        user_id: testUserId,
        title: 'Weekly Habit',
        frequency: 'weekly',
        status: 'active',
      });
      const archivedHabit = await Habit.create({
        user_id: testUserId,
        title: 'Archived Habit',
        frequency: 'daily',
        status: 'archived',
      });

      const response = await request(app)
        .get(`/api/dashboard?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.data.habits_today).toHaveLength(2);
      expect(response.body.data.habits_today.every(h => h.title.includes('Daily'))).toBe(true);
      expect(response.body.data.habits_today.some(h => h.title === 'Weekly Habit')).toBe(false);
      expect(response.body.data.habits_today.some(h => h.title === 'Archived Habit')).toBe(false);
    });

    it('should mark habits as completed today if they have a log for today', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Completed Today Habit',
        frequency: 'daily',
        status: 'active',
      });

      // Create a log for today
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      today.setUTCMilliseconds(0);
      await HabitLog.create({
        habit_id: habit._id,
        date: today,
        is_completed: true,
      });

      const response = await request(app)
        .get(`/api/dashboard?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.data.habits_today).toHaveLength(1);
      expect(response.body.data.habits_today[0].is_completed_today).toBe(true);
    });

    it('should mark habits as not completed today if they do not have a log for today', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Not Completed Today Habit',
        frequency: 'daily',
        status: 'active',
      });

      // Create a log for yesterday
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);
      await HabitLog.create({
        habit_id: habit._id,
        date: yesterday,
        is_completed: true,
      });

      const response = await request(app)
        .get(`/api/dashboard?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.data.habits_today).toHaveLength(1);
      expect(response.body.data.habits_today[0].is_completed_today).toBe(false);
    });

    it('should include habit details in habits_today array', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Test Habit',
        description: 'Test Description',
        category: 'Health',
        frequency: 'daily',
        status: 'active',
      });

      // Create logs to match expected streak values
      // For current_streak: 5, we need 5 consecutive days ending today
      // For best_streak: 5, the current streak will also be 5
      // For weekly_completion_rate: 71, we need 5 out of 7 days
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      today.setUTCMilliseconds(0);
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCMilliseconds(0);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);
      twoDaysAgo.setUTCMilliseconds(0);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);
      threeDaysAgo.setUTCMilliseconds(0);
      const fourDaysAgo = new Date(today);
      fourDaysAgo.setUTCDate(fourDaysAgo.getUTCDate() - 4);
      fourDaysAgo.setUTCMilliseconds(0);
      
      // Create logs for 5 consecutive days (current streak will be 5)
      await HabitLog.create({ habit_id: habit._id, date: fourDaysAgo, is_completed: true });
      await HabitLog.create({ habit_id: habit._id, date: threeDaysAgo, is_completed: true });
      await HabitLog.create({ habit_id: habit._id, date: twoDaysAgo, is_completed: true });
      await HabitLog.create({ habit_id: habit._id, date: yesterday, is_completed: true });
      await HabitLog.create({ habit_id: habit._id, date: today, is_completed: true });

      const response = await request(app)
        .get(`/api/dashboard?user_id=${testUserId.toString()}`)
        .expect(200);

      expect(response.body.data.habits_today).toHaveLength(1);
      const habitData = response.body.data.habits_today[0];
      expect(habitData.title).toBe('Test Habit');
      expect(habitData.description).toBe('Test Description');
      expect(habitData.category).toBe('Health');
      expect(habitData.current_streak).toBe(5);
      expect(habitData.best_streak).toBe(5);
      expect(habitData.weekly_completion_rate).toBe(71);
    });

    it('should require user_id', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('user_id');
    });

    it('should update streaks when fetching dashboard', async () => {
      const habit = await Habit.create({
        user_id: testUserId,
        title: 'Streak Habit',
        frequency: 'daily',
        status: 'active',
        current_streak: 0,
        best_streak: 0,
      });

      // Create logs for yesterday and today
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      today.setUTCMilliseconds(0);
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCMilliseconds(0);

      await HabitLog.create({
        habit_id: habit._id,
        date: yesterday,
        is_completed: true,
      });
      await HabitLog.create({
        habit_id: habit._id,
        date: today,
        is_completed: true,
      });

      const response = await request(app)
        .get(`/api/dashboard?user_id=${testUserId.toString()}`)
        .expect(200);

      // Verify streak was updated
      const updatedHabit = await Habit.findById(habit._id);
      expect(updatedHabit.current_streak).toBeGreaterThan(0);
      expect(response.body.data.best_streak).toBeGreaterThanOrEqual(updatedHabit.current_streak);
    });
  });
});
