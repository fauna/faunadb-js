// Errors
export class FaunaError {
  constructor(message: String);

  name: string;
  message: string;
}

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

// Client
export interface Secrets {
  user: string;
  pass?: string
}

export interface ClientConfig {
  domain?: string;
  scheme?: string; // TODO: make an enum?
  port?: number;
  secret?: Secrets;
  timeout?: number;
  observer?: (res: any) => void; // TODO: make res a RequestResult
}

export class Client {
  constructor(opts: ClientConfig);

  get(path: string, query: any): Promise<any>;
}
