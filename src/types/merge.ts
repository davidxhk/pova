export type Merge<T1 extends object, T2 extends object> = Omit<T1, keyof T2> & T2

export type Merge3<T1 extends object, T2 extends object, T3 extends object> = Merge<Merge<T1, T2>, T3>

export type Merge4<T1 extends object, T2 extends object, T3 extends object, T4 extends object> = Merge<Merge3<T1, T2, T3>, T4>

export type Merge5<T1 extends object, T2 extends object, T3 extends object, T4 extends object, T5 extends object> = Merge<Merge4<T1, T2, T3, T4>, T5>

export type Merge6<T1 extends object, T2 extends object, T3 extends object, T4 extends object, T5 extends object, T6 extends object> = Merge<Merge5<T1, T2, T3, T4, T5>, T6>
