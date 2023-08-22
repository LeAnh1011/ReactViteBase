import { ReactNode } from "react";
import { Model } from "react3l-common";
import { Field } from "react3l-decorators";

export class AdminType extends Model {
  @Field(Number)
  public id?: number;

  @Field(String)
  public code?: string;

  @Field(String)
  public name?: string;

  @Field(String)
  public color?: string;

  @Field(String)
  public bgColor?: string;

  @Field(String)
  public description?: string;

  @Field(String)
  public subSystemDescription?: string;

  public icon?: ReactNode;
}

export enum ADMIN_TYPE {
  GLOBAL_ADMIN = "GLOBAL_ADMIN",
  ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN",
  SITE_ADMIN = "SITE_ADMIN",
  USER = "USER",
}
