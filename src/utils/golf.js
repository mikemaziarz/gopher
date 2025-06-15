/**
 * Calculates the score differential using USGA formula:
 * (Adjusted Gross Score - Course Rating) x 113 / Slope Rating
 *
 * @param {number} score - The final score (Adjusted Gross Score)
 * @param {number} courseRating - The course rating
 * @param {number} slopeRating - The slope rating
 * @returns {number} Score differential rounded to one decimal
 */
export function calculateScoreDifferential(score, courseRating, slopeRating) {
  console.log("🧮 Calculating differential with", { score, courseRating, slopeRating });
  if (
    typeof score !== 'number' ||
    typeof courseRating !== 'number' ||
    typeof slopeRating !== 'number' ||
    slopeRating === 0
  ) {
    return null;
  }

  const differential = ((score - courseRating) * 113) / slopeRating;
  return Math.round(differential * 10) / 10;
}
