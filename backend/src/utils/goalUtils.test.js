const { calculateProgress } = require('./goalUtils');

describe('goalUtils - calculateProgress', () => {
  it('should return 0 for no steps', () => {
    expect(calculateProgress([])).toBe(0);
    expect(calculateProgress(null)).toBe(0);
    expect(calculateProgress(undefined)).toBe(0);
  });

  it('should return 0 if no steps are completed', () => {
    const steps = [
      { title: 'Step 1', is_completed: false },
      { title: 'Step 2', is_completed: false },
    ];
    expect(calculateProgress(steps)).toBe(0);
  });

  it('should return 100 if all steps are completed', () => {
    const steps = [
      { title: 'Step 1', is_completed: true },
      { title: 'Step 2', is_completed: true },
    ];
    expect(calculateProgress(steps)).toBe(100);
  });

  it('should return 50 if half of the steps are completed', () => {
    const steps = [
      { title: 'Step 1', is_completed: true },
      { title: 'Step 2', is_completed: false },
    ];
    expect(calculateProgress(steps)).toBe(50);
  });

  it('should return 33 for 1/3 steps completed (rounded)', () => {
    const steps = [
      { title: 'Step 1', is_completed: true },
      { title: 'Step 2', is_completed: false },
      { title: 'Step 3', is_completed: false },
    ];
    expect(calculateProgress(steps)).toBe(33);
  });

  it('should return 67 for 2/3 steps completed (rounded)', () => {
    const steps = [
      { title: 'Step 1', is_completed: true },
      { title: 'Step 2', is_completed: true },
      { title: 'Step 3', is_completed: false },
    ];
    expect(calculateProgress(steps)).toBe(67);
  });
});
