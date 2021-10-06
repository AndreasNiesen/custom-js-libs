/**
 * Generator similar to python's range().
 * Iterates over [start,end) with an step-size of step.
 * 
 * @param {Number} [start=0] - First value to be returned.
 * @param {Number} [end=10] - Finish-condition.
 * @param {Number} [step=1] - Step-size between consecutive numbers.
 * 
 * @example
 * // logs: 0, 1, 2, 3, 4
 * for (let i of range(5)) console.log(i);
 * @example
 * // logs: 2, 2.5, 3, 3.5, 4, 4.5
 * for (let i of range(2, 5, 0.5)) console.log(i);
 */
function* range(start, end, step) {
  let i, e;
  if (end === undefined && start === undefined) {
    i = 0;
    e = 10;
  } else if (end === undefined && start !== undefined) {
    i = 0;
    e = start;
  } else {
    i = start;
    e = end;
  }
  
  step = step ?? 1;

  while(i < e) {
    yield i;
    i += step;
  }
}