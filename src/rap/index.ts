export const enhanceJSODtsWithRuntimeData = (
  jsoName: string,
  originalDts: string,
  runtimeDts: string,
) => `
type AnyFunction = (...args: any) => any
type AsyncFunction = (...args: any) => Promise<any>

type EnhanceJSOFunction<F> = F extends AnyFunction
  ? F & (F extends AsyncFunction
    ? Awaited<ReturnType<F>> extends void ? { loading: boolean, error?: Error } : { data?: Awaited<ReturnType<F>>, loading: boolean, error?: Error }
    : ReturnType<F> extends void ? F : { data?: ReturnType<F> })
  : F

type EnhanceJSO<T extends Record<string, any>> = {
  [K in keyof T]: EnhanceJSOFunction<T[K]>
}

type PickJSOFunctionRuntimeData<T extends any, K extends string> = {
  [key in K]: key extends keyof T ? T[key] : never
}

type MergeJSOFunction<A extends AnyFunction, B extends any> = A extends AsyncFunction
  ? Awaited<ReturnType<A>> extends void
  ? A & PickJSOFunctionRuntimeData<B, 'loading' | 'error'> : A & PickJSOFunctionRuntimeData<B, 'loading' | 'data' | 'error'>
  : ReturnType<A> extends void
  ? A : A & PickJSOFunctionRuntimeData<B, 'data'>


type MergeJSOType<A extends Record<string, unknown>, B extends Record<string, unknown>> = {
  [K in keyof A]: K extends keyof B
  ? A[K] extends AnyFunction
  ? MergeJSOFunction<A[K], B[K]>
  : A[K] | B[K]
  : A[K]
}

${originalDts.replace(`declare const ${jsoName}Original:`, `type ${jsoName}OriginalType =`)}

${runtimeDts.replace(`declare const ${jsoName}RunTimeData:`, `type ${jsoName}RuntimeType =`)}

type ${jsoName}Type = MergeJSOType<EnhanceJSO<${jsoName}OriginalType>, ${jsoName}RuntimeType>
declare const ${jsoName}: ${jsoName}Type
`
