/**
 * Calculates the progress percentage for a goal based on its steps.
 * 
 * @param {Array} steps - Array of step objects { is_completed: boolean }
 * @returns {number} The progress percentage (0-100)
 */
function calculateProgress(steps) {
  if (!steps || steps.length === 0) {
    return 0;
  }

  const completedSteps = steps.filter(step => step.is_completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return Math.round(progress);
}

module.exports = {
  calculateProgress,
};
