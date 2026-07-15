const request = require('supertest');
const app = require('./index');
const mongoose = require('mongoose');
const User = require('./models/User');
const Habit = require('./models/Habit');
const Goal = require('./models/Goal');
const Badge = require('./models/Badge');
const UserBadge = require('./models/UserBadge');
const HabitLog = require('./models/HabitLog');

// No need to connect/disconnect here as jest.setup.js handles it

beforeEach(async () => {
  // Clean up database before each test
  await User.deleteMany({});
  await Habit.deleteMany({});
  await Goal.deleteMany({});
  await Badge.deleteMany({});
  await UserBadge.deleteMany({});
  await HabitLog.deleteMany({});
});

describe('Gamification System', () => {
  let userId;

  beforeEach(async () => {
    // Create a user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      xp: 0,
      level: 1
    });
    await user.save();
    userId = user._id.toString();
  });

  it('should award XP when logging a habit', async () => {
    // Create a habit
    const habit = new Habit({
      user_id: userId,
      title: 'Test Habit',
      frequency: 'daily'
    });
    await habit.save();

    // Log habit
    const res = await request(app)
      .post(`/api/habits/${habit._id}/log`)
      .send({ user_id: userId });

    expect(res.status).toBe(201);
    expect(res.body.data.gamification).toBeDefined();
    expect(res.body.data.gamification.xp_gained).toBe(5);
    expect(res.body.data.gamification.new_xp).toBe(5);

    // Verify user in DB
    const updatedUser = await User.findById(userId);
    expect(updatedUser.xp).toBe(5);
  });

  it('should award badge for 7 days streak', async () => {
    // Create a habit
    const habit = new Habit({
      user_id: userId,
      title: 'Streak Habit',
      frequency: 'daily',
      current_streak: 6,
      best_streak: 6
    });
    await habit.save();

    // Insert 6 past logs to make calculateStreak return 7
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    
    const logs = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      logs.push({
        habit_id: habit._id,
        date: d,
        is_completed: true
      });
    }
    await HabitLog.insertMany(logs);

    // Log today
    const res = await request(app)
      .post(`/api/habits/${habit._id}/log`)
      .send({ user_id: userId });

    expect(res.status).toBe(201);
    expect(res.body.data.current_streak).toBe(7);
    expect(res.body.data.gamification).toBeDefined();
    
    // Check if badge was awarded
    const badges = res.body.data.gamification.new_badges;
    expect(badges).toBeDefined();
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].code).toBe('STREAK_7_DAYS');

    // Verify UserBadge in DB
    const userBadges = await UserBadge.find({ user_id: userId });
    expect(userBadges.length).toBe(1);
    expect(userBadges[0].badge_code).toBe('STREAK_7_DAYS');
  });

  it('should award XP and badge when completing a goal', async () => {
    // Create a goal
    const goal = new Goal({
      user_id: userId,
      title: 'Test Goal',
      startDate: new Date(),
      dueDate: new Date(),
      status: 'active'
    });
    await goal.save();

    // Update goal to completed
    const res = await request(app)
      .put(`/api/goals/${goal._id}`)
      .send({ 
        user_id: userId,
        status: 'completed'
      });

    if (res.status !== 200) {
      throw new Error(`Goal update failed: ${JSON.stringify(res.body)}`);
    }
    expect(res.status).toBe(200);
    expect(res.body.gamification).toBeDefined();
    expect(res.body.gamification.xp_gained).toBe(50);
    
    // Check for Goal Achiever badge
    const badges = res.body.gamification.new_badges;
    expect(badges).toBeDefined();
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].code).toBe('GOAL_ACHIEVER');
  });
});
