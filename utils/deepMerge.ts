const isObject = (val) => val && typeof val === 'object';
const mergeArrayWithDedupe = (a, b) => Array.from(new Set([...a, ...b]));

/**
 * 递归的合并 obj 中字段合并到 target
 */
export default function deepMerge(target, obj) {
  for (const key of Object.keys(obj)) {
    const oldVal = target[key];
    const newVal = obj[key];

    // 如果均是数组/对象则 merge，原始值则覆盖
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      target[key] = mergeArrayWithDedupe(oldVal, newVal);
    } else if (isObject(oldVal) && isObject(newVal)) {
      target[key] = deepMerge(oldVal, newVal);
    } else {
      target[key];
    }

    return target;
  }
}
