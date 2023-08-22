import {
  HubConnectionBuilder,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";

export const API_SIGNALR_ROUTE = "/rpc/utils/signalr";

export class SignalRService {
  private rConnection: HubConnection;

  constructor() {
    this.rConnection = new HubConnectionBuilder()
      .withUrl(API_SIGNALR_ROUTE)
      // .withAutomaticReconnect([0, 1000, 5000, null])
      .configureLogging(LogLevel.Information)
      .build();
    this.rConnection
      .start()
      .then(() => {
        // eslint-disable-next-line no-console
        console.log("signalr connected");
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  }

  registerChannel = (channel: string, callback: (data: unknown) => void) => {
    this.rConnection.on(channel, (data: unknown) => {
      // tslint:disable-next-line:no-console
      if (typeof callback === "function") {
        callback(data);
      }
    });
  };

  closeConnection = () => {
    this.rConnection.stop().then(() => {
      // tslint:disable-next-line:no-console
    });
  };
}

const signalRService = new SignalRService();
export default signalRService;
