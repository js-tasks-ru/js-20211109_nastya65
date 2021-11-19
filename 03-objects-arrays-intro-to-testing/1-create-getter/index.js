/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const getter = function (obj) {
    const pathArray = path.split('.');
    let newObj = obj;

    pathArray.forEach(item => {
      if (!newObj) {
        return undefined;
      }
      newObj = newObj[item];
    })

    return newObj;
  };

  return getter;
}
