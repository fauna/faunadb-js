import Client from "./Client";

export default class RequestResult {
  constructor(client: Client,
              method: string,
              path: string,
              query: Object,
              requestContent: Object,
              responseRaw: string,
              responseContent: Object,
              statusCode: number,
              responseHeaders: Object,
              startTime: Date,
              endTime: Date
  );

  auth: string;
  timeTaken: number;
}