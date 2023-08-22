import { Model } from "react3l-common";
import { Field, ObjectField } from "react3l-decorators";
import { ObjectList } from "react3l";
import { AdminType } from "../AdminType";
import { SubSystem } from "../SubSystem";

export class Profile extends Model {
  @Field(Number)
  public userId?: number;
  @Field(String)
  public avatar?: string;
  @Field(String)
  public displayName?: string;
  @Field(String)
  public userName?: string;
  @Field(Boolean)
  public receivingSystemEmail?: boolean;
  @Field(Boolean)
  public receivingSystemNotification?: boolean;
  @Field(Number)
  public tokenRemaingExpirySeconds?: number;
  @ObjectField(AdminType)
  public adminType?: AdminType;
  @ObjectList(SubSystem)
  public subSytems?: SubSystem[] = [];
}

export class ProfileChangePassword extends Model {
  @Field(String)
  public oldPassword?: string;
  @Field(String)
  public newPassword?: string;
  @Field(String)
  public verifyNewPassword?: string;

  constructor() {
    super();
  }
}
