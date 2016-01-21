/**
Used for functions that take an options objects.
Fills in defaults for options not provided.
Throws errors for provided options that aren't recognized.
A default value of `undefined` is used to indicate that the option must be provided.
*/
export function applyDefaults<A>(provided: A, defaults: A): A {
  const out: any = {}

  for (const key in provided) {
    if (!(key in defaults))
      throw new Error(`No such option ${key}.`)
    out[key] = (<any> provided)[key]
  }

  for (const key in defaults)
    if (!(key in out))
      out[key] = (<any> defaults)[key]

  return out
}

/** Returns a new object without any keys where the value would be undefined. */
export function removeUndefinedValues(object: any): any {
  const res: any = {}
  for (const key in object) {
    const val = object[key]
    if (val !== undefined)
      res[key] = val
  }
  return res
}
