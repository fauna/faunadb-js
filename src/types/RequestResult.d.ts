import Client from "./Client";

export default class RequestResult {
  constructor(client: Client,
              method: string,
              path: string,
              query: object,
              requestContent: object,
              responseRaw: string,
              responseContent: object,
              statusCode: number,
              responseHeaders: object,
              startTime: Date,
              endTime: Date
  );

  auth: string;
  timeTaken: number;
}