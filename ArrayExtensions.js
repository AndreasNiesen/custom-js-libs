/**
 * Strictly compares this array with the target array.
 * That means each element of either array needs to exist in both arrays an equal amount of times.
 * Set ordered to true, to ensure that the same elements also have the same indices.
 * 
 * @param {Array} target - Array for comparision with this array.
 * @param {Boolean} ordered - Set to true if order of elements is importent.
 * @return {Boolean} true if equal, false if not.
 * 
 * @example
 * [1, 2, 3].strictCompare([1, 3, 2], true)  // false
 * [1, 2, 3].strictCompare([1, 2, 3], true)  // true
 * [1, 2, 3].strictCompare([1, 3, 2], false) // true
 */
Array.prototype.strictCompare = function(target, ordered) {
  if (!Array.isArray(target) || this.length !== target.length) {
    if (!Array.isArray(target)) console.warn(`Array::strictCompare - target parameter is of type "${typeof(target)}" instead of Array.`);
    return false;
  }
  
  if (ordered) return this.every((val, i) => val === target[i]);
  
  // if !ordered
  let thisArray = {};
  let targetArray = {};

  this.forEach(a => {
    if (thisArray[a] === undefined) thisArray[a] = 1;
    else thisArray[a]++;
  });

  target.forEach(a => {
    if (targetArray[a] === undefined) targetArray[a] = 1;
    else targetArray[a]++;
  });

  if (Object.keys(targetArray).length !== Object.keys(thisArray).length) return false;
  return Object.keys(thisArray).every(key => thisArray[key] === targetArray[key]);
}

/**
 * Simply compares this array with the target array.
 * That means each element of each array, has to be in the other array at least once.
 * 
 * 
 * @param {Array} target - Array for comparision with this array.
 * @return {Boolean} true if equal, false if not.
 * 
 * @example
 * [1, 2, 3].compare([1, 1, 2, 3, 2])  // true
 * [1, 1, 2].compare([1, 2, 2])        // true
 * [1, 2].compare([1, 2, 3])           // false
 * [1, 3].compare([1, 2, 3])           // false
 */
Array.prototype.compare = function(target) {
  if (!Array.isArray(target)) {
    console.warn(`Array::compare - target parameter is of type "${typeof(target)}" instead of Array.`);
    return false;
  }

  for (let val of this) {
    if (!target.some(tval => tval === val)) return false;
  }

  for (let val of target) {
    if (!this.some(tval => tval === val)) return false;
  }

  return true;
}