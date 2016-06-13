import {Client} from "./Client";
import {Expr} from "./Expr";
import {Lambda} from "./query";

export class PageHelper {
  constructor(client: Client, set: Expr, params?: Object);

  map(lambda: Lambda): PageHelper;
  filter(lambda: Lambda): PageHelper;

  eachPage(lambda: (Object) => void): Promise<void>;
  eachItem(lambda: (Object) => void): Promise<void>;
}