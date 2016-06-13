import {Client} from "./Client";

export class RequestResult {
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

  auth: {user: string, pass: string};
  timeTaken: number
}