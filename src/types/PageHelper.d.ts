import Client from "./Client";
import Expr from "./Expr";
import {Lambda} from "./query";

export default class PageHelper {
  constructor(client: Client, set: Expr, params?: Object);

  map(lambda: Lambda): PageHelper;
  filter(lambda: Lambda): PageHelper;

  each(lambda: (Object) => void): Promise<void>;
  eachReverse(lambda: (Object) => void): Promise<void>;

  previousPage(): Promise<Object>;
  nextPage(): Promise<Object>;
}