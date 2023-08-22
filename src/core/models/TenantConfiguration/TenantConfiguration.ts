import { Model } from "react3l-common";
import { Field } from "react3l-decorators";

export class TenantConfiguration extends Model {
  @Field(String)
  public companyLogo?: string;
  @Field(String)
  public companyName?: string;
  @Field(String)
  public companyDomain?: string;
}
