import Expr from './Expr';

// Objects
export class Value extends Expr {
  toJSON(): Object;
  inspect(): string;
}

export module Value {
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
}

export default Value;