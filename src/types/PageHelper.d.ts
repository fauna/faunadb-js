import Client from "./Client";
import Expr from "./Expr";
import {Lambda} from "./query";

export default class PageHelper {
  constructor(client: Client, set: Expr, params?: object);

  map(lambda: Lambda): PageHelper;
  filter(lambda: Lambda): PageHelper;

  each(lambda: (page: object) => void): Promise<void>;
  eachReverse(lambda: (page: object) => void): Promise<void>;

  previousPage(): Promise<object>;
  nextPage(): Promise<object>;
}