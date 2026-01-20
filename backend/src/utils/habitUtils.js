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
  currentDate.setHours(0, 0, 0, 0);

  // Check if the most recent log is today or yesterday
  const latestLogDate = new Date(sortedLogs[0].date);
  latestLogDate.setHours(0, 0, 0, 0);

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
    logDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (checkDate - logDate) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (diffDays > 0) {
      // Gap found
      break;
    }
    // If diffDays < 0, it means multiple logs on same day, ignore and continue
  }

  return streak;
}

module.exports = {
  calculateStreak,
};
