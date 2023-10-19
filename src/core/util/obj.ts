export class Obj {
  static filter(object: object, condition?) {
    const cloneObject = { ...object };
    Object.keys(cloneObject).forEach(key => {
      if (typeof condition === 'function' && condition(cloneObject[key], key)) {
        delete cloneObject[key];
      } else if (cloneObject[key] === condition) {
        delete cloneObject[key];
      } else if (cloneObject[key] === null) {
        delete cloneObject[key];
      }
    });

    return cloneObject;
  }

  static clone(object, excepts?: string[]) {
    const newObject = object ? JSON.parse(JSON.stringify(object)) : null;
    if (excepts) {
      excepts.forEach(key => {
        delete newObject[key];
      });
    }

    return newObject;
  }

  static isNotNullObject(value) {
    return value !== null && typeof value === 'object';
  }

  static isDifferentObj(obj1: object, obj2: object, excludeProps: string[] = []) {
    if (obj1 === null || typeof obj1 !== 'object') {
      throw new Error('Object 1 must be is object');
    }
    if (obj2 === null || typeof obj2 !== 'object') {
      throw new Error('Object 2 must be is object');
    }
    const props1 = Object.keys(obj1);
    const props2 = Object.keys(obj2);
    if (props1.length !== props2.length) {
      return true;
    }
    for (const prop of props1) {
      if (excludeProps.includes(prop)) continue;
      if (
        typeof obj1[prop] === 'object' &&
        obj1[prop] !== null &&
        typeof obj2[prop] === 'object' &&
        obj2[prop] !== null
      ) {
        if (JSON.stringify(obj1[prop]) !== JSON.stringify(obj2[prop])) return true;
        continue;
      }
      if (obj1[prop] !== obj2[prop]) return true;
    }

    return false;
  }
}
