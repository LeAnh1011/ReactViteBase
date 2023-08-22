import type { Moment } from "moment";
import { Model } from "react3l-common";
import { Field, MomentField, ObjectList } from "react3l-decorators";

export class RequestHistoryDisplayFieldContent {
  public requestId?: number;
  public versionId?: number;
  public entityName?: string;
  public fieldName?: string;
  public dataType?: string;
  public value?: unknown;
}

export class RequestHistory extends Model {
  @Field(Number)
  public requestId?: number;
  @Field(Number)
  public actorId?: number;
  @Field(String)
  public actor?: string;
  @Field(Number)
  public actorTypeId?: number;
  @Field(String)
  public actionName?: string;
  @MomentField()
  public savedAt?: Moment;
  public content?: unknown;
  @Field(Number)
  public versionId?: number;
  @ObjectList(RequestHistoryDisplayFieldContent)
  public requestHistoryDisplayFieldContents?: RequestHistoryDisplayFieldContent[];
}

export class RequestHistoryDisplayField extends Model {
  @Field(String)
  public entityName?: string;
  @Field(String)
  public fieldName?: string;
  @Field(String)
  public dataType?: string;
}
