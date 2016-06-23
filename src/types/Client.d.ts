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

  query(expr: Expr): Promise<Object>;
  paginate(expr: Expr): PageHelper;

  get(path: string, query?: Object): Promise<Object>;
  post(path: string, data: Object): Promise<Object>;
  put(path: string, data: Object): Promise<Object>;
  patch(path: string, data: Object): Promise<Object>;
  delete(path: string): Promise<Object>;

  ping(scope?: string, timeout?: number): Promise<string>;
}
