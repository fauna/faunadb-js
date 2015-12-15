declare module 'winston' {
  // Planning to get rid of this requirement anyway, so just call it `any`
  const winston: any
  export = winston
}
