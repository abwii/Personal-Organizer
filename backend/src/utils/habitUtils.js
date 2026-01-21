/**
 * Calculates the current streak for a habit based on its logs.
 * 
 * @param {Array} habitLogs - Array of habit log objects { date: Date, is_completed: boolean }
 * @returns {number} The current streak count
 */
function calculateStreak(habitLogs) {
  // Trier les logs par date décroissante
  const sortedLogs = habitLogs
    .filter(log => log.is_completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedLogs.length === 0) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date();
  currentDate.setUTCHours(0, 0, 0, 0);
  currentDate.setUTCMilliseconds(0);

  // Check if the most recent log is today or yesterday
  const latestLogDate = new Date(sortedLogs[0].date);
  latestLogDate.setUTCHours(0, 0, 0, 0);
  latestLogDate.setUTCMilliseconds(0);

  const diffToToday = Math.floor(
    (currentDate - latestLogDate) / (1000 * 60 * 60 * 24)
  );

  // If the last completion was more than 1 day ago (not today or yesterday), streak is 0
  if (diffToToday > 1) {
    return 0;
  }

  // Start checking from the most recent log date
  let checkDate = new Date(latestLogDate);

  for (const log of sortedLogs) {
    const logDate = new Date(log.date);
    logDate.setUTCHours(0, 0, 0, 0);
    logDate.setUTCMilliseconds(0);

    const diffDays = Math.floor(
      (checkDate - logDate) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      checkDate.setUTCHours(0, 0, 0, 0);
      checkDate.setUTCMilliseconds(0);
    } else if (diffDays > 0) {
      // Gap found
      break;
    }
    // If diffDays < 0, it means multiple logs on same day, ignore and continue
  }

  return streak;
}

/**
 * Calculates the weekly completion rate for a habit based on its logs.
 * 
 * @param {Array} habitLogs - Array of habit log objects { date: Date, is_completed: boolean }
 * @returns {number} The weekly completion rate percentage (0-100)
 */
function calculateWeeklyCompletion(habitLogs) {
  if (!habitLogs || habitLogs.length === 0) {
    return 0;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  today.setUTCMilliseconds(0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6); // Last 7 days including today

  const recentLogs = habitLogs.filter(log => {
    if (!log.is_completed) return false;
    const logDate = new Date(log.date);
    logDate.setUTCHours(0, 0, 0, 0);
    logDate.setUTCMilliseconds(0);
    return logDate >= sevenDaysAgo && logDate <= today;
  });

  // Unique dates to avoid double counting if multiple logs exist for the same day
  const uniqueDates = new Set(recentLogs.map(log => {
    const d = new Date(log.date);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMilliseconds(0);
    return d.getTime();
  }));

  const completionRate = (uniqueDates.size / 7) * 100;
  return Math.round(completionRate);
}

module.exports = {
  calculateStreak,
  calculateWeeklyCompletion,
};
