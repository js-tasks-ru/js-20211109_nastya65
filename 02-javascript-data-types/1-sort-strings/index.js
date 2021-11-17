/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const collator = new Intl.Collator(['ru', 'en'], {caseFirst: "upper"})
  let newArr = arr.slice();

  if (param === 'asc') {
    return newArr.sort((a, b) => collator.compare(a, b));
  } else if (param === 'desc') {
    return newArr.sort((a, b) => collator.compare(b, a));
  }
}
