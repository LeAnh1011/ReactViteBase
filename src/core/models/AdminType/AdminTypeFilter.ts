import { IdFilter, StringFilter } from "react3l-advanced-filters";
import { ModelFilter } from "react3l-common";
import { ObjectField } from "react3l-decorators";

export class AdminTypeFilter extends ModelFilter {
  @ObjectField(IdFilter)
  public id?: IdFilter = new IdFilter();
  @ObjectField(StringFilter)
  public code?: StringFilter = new StringFilter();
  @ObjectField(StringFilter)
  public name?: StringFilter = new StringFilter();
}
