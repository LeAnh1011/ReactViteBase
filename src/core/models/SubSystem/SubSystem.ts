import { Model } from "react3l-common";
import { Field, ObjectField } from "react3l-decorators";

export class SubSystemType extends Model {
  @Field(Number)
  public id?: number;
  @Field(String)
  public code?: string;
  @Field(String)
  public name?: string;
}

export class SubSystem extends Model {
  @Field(Number)
  public id?: number;
  @Field(String)
  public path?: string;
  @Field(String)
  public code?: string;
  @Field(String)
  public name?: string;
  @Field(String)
  public description?: string;
  @Field(Boolean)
  public active?: boolean;
  @Field(Boolean)
  public disabled?: boolean;
  @Field(String)
  public color?: string;
  @Field(Number)
  public subSystemTypeId?: number;
  @Field(String)
  public darkIcon?: string;
  @Field(String)
  public lightIcon?: string;
  @Field(String)
  public darkLogo?: string;
  @Field(String)
  public lightLogo?: string;
  @Field(Boolean)
  public isAdmin?: boolean;
  @ObjectField(SubSystemType)
  public subSystemType?: SubSystemType;
}
