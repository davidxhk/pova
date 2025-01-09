import type { Merge, Merge3, Merge4, Merge5, Merge6 } from "../types"

export function mergeObjects<T1 extends object, T2 extends object>(obj1: T1, obj2: T2): Merge<T1, T2>
export function mergeObjects<T1 extends object, T2 extends object, T3 extends object>(obj1: T1, obj2: T2, obj3: T3): Merge3<T1, T2, T3>
export function mergeObjects<T1 extends object, T2 extends object, T3 extends object, T4 extends object>(obj1: T1, obj2: T2, obj3: T3, obj4: T4): Merge4<T1, T2, T3, T4>
export function mergeObjects<T1 extends object, T2 extends object, T3 extends object, T4 extends object, T5 extends object>(obj1: T1, obj2: T2, obj3: T3, obj4: T4, obj5: T5): Merge5<T1, T2, T3, T4, T5>
export function mergeObjects<T1 extends object, T2 extends object, T3 extends object, T4 extends object, T5 extends object, T6 extends object>(obj1: T1, obj2: T2, obj3: T3, obj4: T4, obj5: T5, obj6: T6): Merge6<T1, T2, T3, T4, T5, T6>
export function mergeObjects(...objects: any[]): any {
  return Object.assign({}, ...objects)
}
