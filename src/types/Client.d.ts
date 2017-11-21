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

  query(expr: Expr): Promise<object>;
  paginate(expr: Expr): PageHelper;

  get(path: string, query?: object): Promise<object>;
  post(path: string, data: object): Promise<object>;
  put(path: string, data: object): Promise<object>;
  patch(path: string, data: object): Promise<object>;
  delete(path: string): Promise<object>;

  ping(scope?: string, timeout?: number): Promise<string>;
}
