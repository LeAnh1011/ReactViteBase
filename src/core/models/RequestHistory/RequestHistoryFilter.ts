import { DateFilter, IdFilter, StringFilter } from "react3l-advanced-filters";
import { ModelFilter } from "react3l-common";

export class RequestHistoryFilter extends ModelFilter {
  public requestId?: IdFilter = new IdFilter();
  public actorId?: IdFilter = new IdFilter();
  public actorTypeId?: IdFilter = new IdFilter();
  public actor?: StringFilter = new StringFilter();
  public actionName?: StringFilter = new StringFilter();
  public savedAt?: DateFilter = new DateFilter();
  public versionId?: IdFilter = new IdFilter();
  public fieldFilter?: Record<string, unknown>;
}
