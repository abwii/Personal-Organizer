const { calculateStreak } = require('./habitUtils');

describe('habitUtils - calculateStreak', () => {
  let today;
  let yesterday;
  let twoDaysAgo;
  let threeDaysAgo;

  beforeAll(() => {
    today = new Date();
    today.setHours(0, 0, 0, 0);

    yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  });

  it('should return 0 for empty logs', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('should return 1 if completed only today', () => {
    const logs = [{ date: today, is_completed: true }];
    expect(calculateStreak(logs)).toBe(1);
  });

  it('should return 1 if completed only yesterday', () => {
    const logs = [{ date: yesterday, is_completed: true }];
    expect(calculateStreak(logs)).toBe(1);
  });

  it('should return 0 if completed only 2 days ago', () => {
    const logs = [{ date: twoDaysAgo, is_completed: true }];
    expect(calculateStreak(logs)).toBe(0);
  });

  it('should return 2 if completed today and yesterday', () => {
    const logs = [
      { date: today, is_completed: true },
      { date: yesterday, is_completed: true },
    ];
    expect(calculateStreak(logs)).toBe(2);
  });

  it('should return 2 if completed yesterday and 2 days ago (active streak)', () => {
    const logs = [
      { date: yesterday, is_completed: true },
      { date: twoDaysAgo, is_completed: true },
    ];
    expect(calculateStreak(logs)).toBe(2);
  });

  it('should return 3 if completed today, yesterday, and 2 days ago', () => {
    const logs = [
      { date: today, is_completed: true },
      { date: yesterday, is_completed: true },
      { date: twoDaysAgo, is_completed: true },
    ];
    expect(calculateStreak(logs)).toBe(3);
  });

  it('should break streak if a day is missed', () => {
    const logs = [
      { date: today, is_completed: true },
      { date: twoDaysAgo, is_completed: true },
    ];
    expect(calculateStreak(logs)).toBe(1);
  });

  it('should handle unsorted logs', () => {
    const logs = [
      { date: yesterday, is_completed: true },
      { date: today, is_completed: true },
      { date: twoDaysAgo, is_completed: true },
    ];
    expect(calculateStreak(logs)).toBe(3);
  });

  it('should ignore uncompleted logs', () => {
    const logs = [
      { date: today, is_completed: true },
      { date: yesterday, is_completed: false },
      { date: twoDaysAgo, is_completed: true },
    ];
    expect(calculateStreak(logs)).toBe(1);
  });

  it('should handle multiple logs on the same day', () => {
    const logs = [
      { date: today, is_completed: true },
      { date: today, is_completed: true },
      { date: yesterday, is_completed: true },
    ];
    expect(calculateStreak(logs)).toBe(2);
  });
});
