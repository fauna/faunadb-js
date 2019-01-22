import Expr from "./Expr";
import PageHelper from "./PageHelper";
import RequestResult from "./RequestResult";

export interface ClientConfig {
  domain?: string;
  scheme?: "http" | "https";
  port?: number;
  secret: string;
  timeout?: number;
  observer?: (res: RequestResult) => void;
}

export default class Client {
  constructor(opts?: ClientConfig);

  query<T = object>(expr: Expr): Promise<T>;
  paginate(expr: Expr): PageHelper;
  ping(scope?: string, timeout?: number): Promise<string>;
}
