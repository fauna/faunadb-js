declare module 'fn-annotate' {
  const getParameterNames: (_: Function) => Array<string>
  export = getParameterNames
}
