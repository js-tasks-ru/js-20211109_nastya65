/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return ('');
  }

  const array = string.split('');
  let count = 1;
  let newString = '';

  for (let i = 0; i < array.length; i++) {
    if (array[i] === array[i + 1]) {
      count++;
      if (count > size) {
        continue;
      }
    }
    else {
      count = 1;
    }
    newString += array[i];
  }

  return newString;
}
