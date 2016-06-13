// Objects
export class FaunaObject {
  toJSON(): Object;
  inspect(): string;
}

export class Ref extends FaunaObject {
  constructor(value: string);
  constructor(parent: string, id: string);
  constructor(parent: Ref, id: string);

  class: string;
  id: string;
  equals(other: any): boolean;
}

export class SetRef extends FaunaObject {
  constructor(value: string);
}

export class FaunaTime extends FaunaObject {
  constructor(value: string);
  constructor(value: Date);

  date: Date;
}

export class FaunaDate extends FaunaObject {
  constructor(value: string);
  constructor(value: Date);

  date: Date;
}
