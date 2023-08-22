import type { Moment } from "moment";
import { Model } from "react3l-common";

export class Notification extends Model {
  public unread?: boolean;
  public titleWeb?: string;
  public contentWeb?: string;
  public time?: Moment;
}
