import Expr from './Expr';

export module values {
  export class Value extends Expr {
    toJSON(): Object;
    inspect(): string;
  }
  export class SetRef extends Value {
    constructor(value: string);
  }

  export class FaunaTime extends Value {
    constructor(value: string);
    constructor(value: Date);

    date: Date;
  }

  export class FaunaDate extends Value {
    constructor(value: string);
    constructor(value: Date);

    date: Date;
  }

  export class Bytes extends Value {
    constructor(value: string);
    constructor(value: ArrayBuffer);
    constructor(value: Uint8Array);
  }
}
