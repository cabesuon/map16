/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "__rp" }] */
const __rp = (function () {
  // methods

  /**
   * Returns a random number between the specified values.
   * The returned value is no lower than (and may possibly equal) min,
   * and is less than (and not equal) max.
   *
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
   *
   * @param {number} min - Lowest range value (included)
   * @param {number} max - Highest range value (not included)
   * @return {number} The random value
   */
  function randomNumber (min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Returns a random integer between the specified values.
   * The returned value is no lower than (and may possibly equal) min,
   * and is less than (and not equal) max.
   *
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
   *
   * @param {number} min - Lowest range value (included)
   * @param {number} max - Highest range value (not included)
   * @return {number} The random integer
   */
  function randomInt (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  const _MS_PER_DAY = 1000 * 60 * 60 * 24;

  /**
   * Returns the difference in days between the specified values.
   *
   * https://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript#3224854
   *
   * @param {date} a - First value
   * @param {date} b - Second value
   * @return {number} The difference in days
   */
  function dateDiffInDays (a, b) {
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  /**
   * Returns a random date between the specified values.
   * The returned value is no lower than (and may possibly equal) min,
   * and is less than (and not equal) max.
   *
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
   *
   * @param {date} min - Lowest range value (included)
   * @param {date} max - Highest range value (not included)
   * @return {date} The random date
   */
  function randomDate (min, max) {
    const d = new Date(min);
    d.setDate(d.getDate() + randomInt(1, dateDiffInDays(min, max)));
    return d;
  }

  /**
   * Returns a random point inside the specified extent.
   * The returned point is no lower than (and may possibly equal) (xmin, ymin),
   * and is less than (and not equal) (xmax, ymax).
   *
   * @param {number} xmin - Lowest x value (included)
   * @param {number} ymin - Lowest y value (included)
   * @param {number} xmax - Highest x value (not included)
   * @param {number} ymax - Highest y value (not included)
   * @return {Array<number>} The random point
   */
  function randomPoint (xmin, ymin, xmax, ymax) {
    return [
      randomNumber(xmin, xmax),
      randomNumber(ymin, ymax)
    ];
  }

  /**
   * Returns n random points inside the specified extent.
   * The returned points are no lower than (and may possibly equal) (xmin, ymin),
   * and are less than (and not equal) (xmax, ymax).
   *
   * @param {number} n - Number of points
   * @param {number} xmin - Lowest x value (included)
   * @param {number} ymin - Lowest y value (included)
   * @param {number} xmax - Highest x value (not included)
   * @param {number} ymax - Highest y value (not included)
   * @return {Array<Array<number>>} The random points
   */
  function randomPoints (xmin, ymin, xmax, ymax, n) {
    const points = [];
    for (let i = 0; i < n; i++) {
      points.push(randomPoint(xmin, ymin, xmax, ymax));
    }
    return points;
  }

  // exports

  return {
    randomNumber,
    randomInt,
    randomDate,
    randomPoint,
    randomPoints
  };
})();
