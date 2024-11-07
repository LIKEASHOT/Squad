// @ts-nocheck
/**
 * 深度克隆一个对象或数组
 * @param obj 要克隆的对象或数组
 * @returns 克隆后的对象或数组
 */
export function cloneDeep<T>(obj: any): T {
  // 如果传入的对象是基本数据类型（如字符串、数字等），则直接返回
  // if(['number', 'string'].includes(typeof obj) || Array.isArray(obj)){
	 //   return obj as T
  // }
  if(typeof obj == 'object'){
	return JSON.parse(JSON.stringify(obj as T)) as T;
  }
  return obj as T
}

