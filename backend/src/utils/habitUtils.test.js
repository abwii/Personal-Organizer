const { calculateStreak, calculateWeeklyCompletion } = require('./habitUtils');

describe('habitUtils - calculateStreak', () => {
  let today;
  let yesterday;
  let twoDaysAgo;
  let threeDaysAgo;

  beforeAll(() => {
    today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    today.setUTCMilliseconds(0);

    yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    twoDaysAgo = new Date(today);
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);

    threeDaysAgo = new Date(today);
    threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);
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

describe('habitUtils - calculateWeeklyCompletion', () => {
  let today;
  let dates;

  beforeAll(() => {
    today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    today.setUTCMilliseconds(0);

    dates = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      dates.push(d);
    }
  });

  it('should return 0 for empty logs', () => {
    expect(calculateWeeklyCompletion([])).toBe(0);
  });

  it('should return 14 for 1 completion in last 7 days (1/7 * 100 = 14.28)', () => {
    const logs = [{ date: today, is_completed: true }];
    expect(calculateWeeklyCompletion(logs)).toBe(14);
  });

  it('should return 100 for 7 completions in last 7 days', () => {
    const logs = dates.slice(0, 7).map(date => ({ date, is_completed: true }));
    expect(calculateWeeklyCompletion(logs)).toBe(100);
  });

  it('should ignore logs older than 7 days', () => {
    const logs = [
      { date: today, is_completed: true },
      { date: dates[7], is_completed: true }, // 8 days ago
      { date: dates[8], is_completed: true }, // 9 days ago
    ];
    expect(calculateWeeklyCompletion(logs)).toBe(14);
  });

  it('should handle multiple logs on same day', () => {
    const logs = [
      { date: today, is_completed: true },
      { date: today, is_completed: true },
    ];
    expect(calculateWeeklyCompletion(logs)).toBe(14);
  });

  it('should return 43 for 3 completions in last 7 days (3/7 * 100 = 42.85)', () => {
    const logs = [
      { date: today, is_completed: true },
      { date: dates[2], is_completed: true },
      { date: dates[5], is_completed: true },
    ];
    expect(calculateWeeklyCompletion(logs)).toBe(43);
  });
});
