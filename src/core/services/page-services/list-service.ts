import {
  DateFilter,
  IdFilter,
  NumberFilter,
  StringFilter,
} from "react3l-advanced-filters";
import {
  Reducer,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import _isEmpty from "lodash/isEmpty";
import _cloneDeep from "lodash/cloneDeep";
import _orderBy from "lodash/orderBy";
import _take from "lodash/take";
import _drop from "lodash/drop";
import { Model, ModelFilter, OrderType } from "react3l-common";
import { finalize, forkJoin, Observable } from "rxjs";
import { webService } from "../common-services/web-service";
import type { Moment } from "moment";
import { RowSelectionType, TableRowSelection } from "antd/lib/table/interface";
import { v4 as uuidv4 } from "uuid";
import appMessageService from "core/services/common-services/app-message-service";
import { DEFAULT_TAKE } from "core/config/consts";
import {
  FilterAction,
  FilterActionEnum,
  ListAction,
  ListActionType,
  ListState,
  KeyType,
} from "../service-types";

function listReducer<T>(state: ListState<T>, action: ListAction<T>) {
  switch (action.type) {
    case ListActionType.SET:
      return { ...action.payload };
    default:
      return state;
  }
}

export const listService = {
  /**
   * react hook for control list/count data from server
   * @param: getList: (filter: TFilter) => Observable<T[]>
   * @param: getCount: (filter: TFilter) => Observable<number>
   * @param: filter: TFilter
   * @param: dispatchFilter?: React.Dispatch<FilterAction<TFilter>>
   * @param: autoCallListByChange: boolean
   * @param: initData: ListState<T>
   * @return: { list,
      count,
      loadingList,
      setLoadingList,
      handleResetList,
      handleLoadList }
   * */
  useList<T extends Model, TFilter extends ModelFilter>(
    getList: (filter: TFilter) => Observable<T[]>,
    getCount: (filter: TFilter) => Observable<number>,
    baseFilter?: TFilter,
    dispatchFilter?: React.Dispatch<FilterAction<TFilter>>,
    getCurrentFilter?: () => TFilter,
    initData?: ListState<T>
  ) {
    const [{ list, count }, dispatch] = useReducer<
      Reducer<ListState<T>, ListAction<T>>
    >(listReducer, initData ? initData : { list: [], count: 0 });

    const [loadingList, setLoadingList] = useState<boolean>(false);

    const [subscription] = webService.useSubscription();

    const handleLoadList = useCallback(
      (filterParam?: TFilter, isOverideFilter?: boolean) => {
        const currentFilter = getCurrentFilter();
        let filterValue: TFilter;
        if (isOverideFilter) {
          filterValue = filterParam;
        } else {
          filterValue = filterParam
            ? { ...currentFilter, ...filterParam }
            : currentFilter;
        }
        setLoadingList(true);
        subscription.add(
          forkJoin([getList(filterValue), getCount(filterValue)])
            .pipe(finalize(() => setLoadingList(false)))
            .subscribe({
              next: (results: [T[], number]) =>
                dispatch({
                  type: ListActionType.SET,
                  payload: {
                    list: results[0],
                    count: results[1],
                  },
                }),
              error: () => {
                dispatch({
                  type: ListActionType.SET,
                  payload: {
                    list: [],
                    count: null,
                  },
                });
              },
            })
        );
      },
      [getCount, getList, subscription, getCurrentFilter]
    );

    const handleResetList = useCallback(() => {
      dispatchFilter({
        type: FilterActionEnum.SET,
        payload: {
          ...baseFilter,
        },
      });
      handleLoadList(
        {
          ...baseFilter,
        },
        true
      );
    }, [baseFilter, dispatchFilter, handleLoadList]);

    return {
      list,
      count,
      loadingList,
      setLoadingList,
      handleResetList,
      handleLoadList,
    };
  },

  /**
   *
   * react hook for handle action in row selection antd
   * @param: action?: (t: T) => Observable<T>
   * @param: bulkAction?: (ids: KeyType[]) => Observable<void>
   * @param: selectionType: RowSelectionType
   * @param: initialRowKeys?: KeyType[]
   * @param: onUpdateListSuccess?: (item?: T) => void
   * @param: handleResetList?: () => void
   * @return: {
      handleAction,
      handleBulkAction,
      canBulkAction,
      rowSelection,
      selectedRowKeys,
      setSelectedRowKeys,
    }
   */
  useRowSelection<T extends Model>(
    selectionType: RowSelectionType = "checkbox",
    initialRowKeys?: KeyType[],
    checkUsed?: boolean,
    selectedType: "auto" | "manual" = "auto"
  ) {
    const { notifyUpdateItemSuccess, notifyUpdateItemError } =
      appMessageService.useCRUDMessage();

    const [selectedRowKeys, setSelectedRowKeys] = useState<KeyType[]>(
      initialRowKeys ?? []
    );

    const canBulkAction = useMemo(
      () => selectedRowKeys.length > 0,
      [selectedRowKeys.length]
    );

    const rowSelection = useMemo(() => {
      const rowSelection: TableRowSelection<T> = {
        selectedRowKeys,
        type: selectionType,
        getCheckboxProps: (record: T) => ({
          disabled: checkUsed ? record.used : false,
        }),
      };
      if (selectedType === "auto") {
        rowSelection.onChange = function (selectedRowKeys: KeyType[]) {
          setSelectedRowKeys(selectedRowKeys);
        };
      } else {
        rowSelection.onSelect = function (record: T, selected: boolean) {
          const rowKey = record.id;
          let selectedValues = [...selectedRowKeys];
          if (selected) {
            selectedValues.push(rowKey);
          } else {
            selectedValues = selectedValues.filter((item) => item !== rowKey);
          }
          setSelectedRowKeys(selectedValues);
        };
        rowSelection.onSelectAll = function (
          selected: boolean,
          selectedRows: T[],
          changeRows: T[]
        ) {
          let selectedValues = [...selectedRowKeys];
          const listKeys = changeRows.map((value: T) => value.id);
          if (selected) {
            selectedValues.push(...listKeys);
          } else {
            selectedValues = selectedValues.filter(
              (item) => !listKeys.includes(item as number)
            );
          }
          setSelectedRowKeys(selectedValues);
        };
      }
      return rowSelection;
    }, [checkUsed, selectedRowKeys, selectedType, selectionType]);

    return {
      canBulkAction,
      rowSelection,
      selectedRowKeys,
      setSelectedRowKeys,
      notifyUpdateItemSuccess,
      notifyUpdateItemError,
    };
  },

  /**
   * react hook for control list/count data from local
   * @param: data: T[]
   * @param: filter: TFilter
   * @param: autoCallByChange: boolean
   * @param: fieldCombineSearch?: string[]
   * @return: { list,
      count,
      loadingList,
      setLoadingList,
      handleResetList,
      handleLoadList }
   * */
  useLocalList<
    T extends Model & { key?: string; children?: T[] },
    TFilter extends ModelFilter
  >(
    data: T[],
    filter: TFilter,
    autoCallByChange = true,
    isTreeData = false,
    fieldCombineSearch?: string[]
  ) {
    const contentValue = useMemo(() => {
      if (data && data.length > 0) {
        return data.map((current: T) => {
          if (typeof current.key !== "undefined") {
            return current;
          } else {
            current.key = uuidv4();
            return current;
          }
        });
      }
      return [];
    }, [data]);

    const [{ list, count }, dispatch] = useReducer<
      Reducer<ListState<T>, ListAction<T>>
    >(listReducer, {
      list: contentValue || [],
      count: contentValue ? contentValue.length : 0,
    });

    const [invokeChange, setInvokeChange] = useState<boolean>(false);

    const { sortList, filterList, combineFilterList, treeFilterList } =
      this.useFilterList<T, TFilter>(filter);

    const handleInvokeChange = useCallback(() => {
      setInvokeChange(true);
    }, []);

    const handleFilter: (list: T[]) => T[] = useCallback(
      (list: T[]) => {
        if (filter === null || filter === undefined) return list;
        const newItems: T[] = [];
        const currentListLength = list.length;
        let filterdList: T[];
        if (list && list.length > 0) {
          list
            .filter((currentItem: T) => !currentItem.id)
            .forEach((current) => {
              newItems.push(current);
            });
        }
        if (isTreeData) {
          filterdList = treeFilterList(list, fieldCombineSearch);
          return newItems.length > 0 && filterdList.length < currentListLength
            ? [...newItems, ...filterdList]
            : filterdList;
        } else {
          if (
            Object.prototype.hasOwnProperty.call(filter, "search") &&
            !_isEmpty(filter["search"])
          ) {
            const fieldKeys = fieldCombineSearch
              ? fieldCombineSearch
              : ["name", "code"];
            filterdList = sortList(combineFilterList(list, fieldKeys));
            return newItems.length > 0 && filterdList.length < currentListLength
              ? [...newItems, ...filterdList]
              : filterdList;
          }
          filterdList = sortList(filterList(list));
          return newItems.length > 0 && filterdList.length < currentListLength
            ? [...newItems, ...filterdList]
            : filterdList;
        }
      },
      [
        filter,
        isTreeData,
        treeFilterList,
        sortList,
        filterList,
        fieldCombineSearch,
        combineFilterList,
      ]
    );

    useEffect(() => {
      if (autoCallByChange) {
        const filteredList = handleFilter(contentValue);
        dispatch({
          type: ListActionType.SET,
          payload: {
            list: filteredList,
            count: filteredList.length,
          },
        });
        return;
      } else {
        if (invokeChange) {
          const filteredList = handleFilter(contentValue);
          dispatch({
            type: ListActionType.SET,
            payload: {
              list: filteredList,
              count: filteredList.length,
            },
          });
          setInvokeChange(false);
        }
        return;
      }
    }, [contentValue, invokeChange, handleFilter, autoCallByChange]);

    return {
      list,
      count,
      invokeChange,
      handleInvokeChange,
    };
  },

  /**
   * react hook for manage local filter list
   * @param: filter: TFilter
   * @return: { sortList,
      filterList,
      combineFilterList }
   * */
  useFilterList<T extends Model, TFilter extends ModelFilter>(filter: TFilter) {
    const getLodashOrder = (orderType: OrderType) => {
      if (orderType === OrderType.ASC) return "asc";
      if (orderType === OrderType.DESC) return "desc";
      return null;
    };

    const sortList = useCallback(
      (list: T[]) => {
        if (list && list.length > 0) {
          if (filter?.orderBy && filter?.orderType) {
            _orderBy(
              list,
              [filter.orderBy],
              [getLodashOrder(filter.orderType)]
            );
          }
          if (filter?.skip) {
            _drop(list, filter?.skip ? filter.skip : 0);
          }
          if (filter?.take) {
            _take(list, filter?.take ? filter?.take : DEFAULT_TAKE);
          }
        }
        return list;
      },
      [filter]
    );

    const filterList = useCallback(
      (list: T[]) => {
        Object.entries(filter).forEach(([fKey, fType]) => {
          // IdFilter
          if (fType instanceof IdFilter) {
            Object.entries(fType).forEach(([fTypeKey, fValue]) => {
              switch (fTypeKey) {
                case "equal":
                  list = list.filter((i: T) => {
                    const iValue: number = i[fKey] as number;
                    if (
                      typeof iValue === "number" &&
                      typeof fValue === "number"
                    ) {
                      return iValue === fValue;
                    }
                    return false;
                  });
                  break;
                case "notEqual":
                  list = list.filter((i: T) => {
                    const iValue: number = i[fKey] as number;
                    if (
                      typeof iValue === "number" &&
                      typeof fValue === "number"
                    ) {
                      return iValue !== fValue;
                    }
                    return false;
                  });
                  break;
                case "in":
                  list = list.filter((i: T) => {
                    const iValue: number = i[fKey] as number;
                    if (typeof iValue === "number" && Array.isArray(fValue)) {
                      return fValue.includes(iValue);
                    }
                    return false;
                  });
                  break;
                case "notIn":
                  list = list.filter((i: T) => {
                    const iValue: number = i[fKey] as number;
                    if (typeof iValue === "number" && Array.isArray(fValue)) {
                      return !fValue.includes(iValue);
                    }
                    return false;
                  });
                  break;
                default:
                  break;
              }
            });
          }

          // NumberFilter
          if (fType instanceof NumberFilter) {
            Object.entries(fType).forEach(([fTypeKey, fValue]) => {
              if (typeof fValue === "number") {
                switch (fTypeKey) {
                  case "equal":
                    list = list.filter((i: T) => {
                      const iValue: number = i[fKey] as number;
                      if (typeof iValue === "number") {
                        return iValue === fValue;
                      }
                      return false;
                    });
                    break;
                  case "notEqual":
                    list = list.filter((i: T) => {
                      const iValue: number = i[fKey] as number;
                      if (typeof iValue === "number") {
                        return iValue !== fValue;
                      }
                      return false;
                    });
                    break;
                  case "less":
                    list = list.filter((i: T) => {
                      const iValue: number = i[fKey] as number;
                      if (typeof iValue === "number") {
                        return iValue < fValue;
                      }
                      return false;
                    });
                    break;
                  case "lessEqual":
                    list = list.filter((i: T) => {
                      const iValue: number = i[fKey] as number;
                      if (typeof iValue === "number") {
                        return iValue <= fValue;
                      }
                      return false;
                    });
                    break;
                  case "greater":
                    list = list.filter((i: T) => {
                      const iValue: number = i[fKey] as number;
                      if (typeof iValue === "number") {
                        return iValue > fValue;
                      }
                      return false;
                    });
                    break;
                  case "greaterEqual":
                    list = list.filter((i: T) => {
                      const iValue: number = i[fKey] as number;
                      if (typeof iValue === "number") {
                        return iValue >= fValue;
                      }
                      return false;
                    });
                    break;
                  default:
                    break;
                }
              }
            });
          }

          // StringFilter
          if (fType instanceof StringFilter) {
            Object.entries(fType).forEach(([fTypeKey, fValue]) => {
              if (typeof fValue === "string") {
                switch (fTypeKey) {
                  case "equal":
                    list = list.filter((i: T) => {
                      const iValue: string = i[fKey];
                      if (typeof iValue === "string") {
                        return iValue === fValue;
                      }
                      return false;
                    });
                    break;
                  case "notEqual":
                    list = list.filter((i: T) => {
                      const iValue: string = i[fKey];
                      if (typeof iValue === "string") {
                        return iValue !== fValue;
                      }
                      return false;
                    });
                    break;
                  case "contain":
                    list = list.filter((i: T) => {
                      const iValue: string = i[fKey];
                      if (typeof iValue === "string") {
                        return iValue.indexOf(fValue) >= 0;
                      }
                      return false;
                    });
                    break;
                  case "notContain":
                    list = list.filter((i: T) => {
                      const iValue: string = i[fKey];
                      if (typeof iValue === "string") {
                        return iValue.indexOf(fValue) < 0;
                      }
                      return false;
                    });
                    break;
                  case "startWith":
                    list = list.filter((i: T) => {
                      const iValue: string = i[fKey];
                      if (typeof iValue === "string") {
                        return iValue.startsWith(fValue);
                      }
                      return false;
                    });
                    break;
                  case "notStartWith":
                    list = list.filter((i: T) => {
                      const iValue: string = i[fKey];
                      if (typeof iValue === "string") {
                        return !iValue.startsWith(fValue);
                      }
                      return false;
                    });
                    break;
                  case "endWith":
                    list = list.filter((i: T) => {
                      const iValue: string = i[fKey];
                      if (typeof iValue === "string") {
                        return iValue.endsWith(fValue);
                      }
                      return false;
                    });
                    break;
                  case "notEndWith":
                    list = list.filter((i: T) => {
                      const iValue: string = i[fKey];
                      if (typeof iValue === "string") {
                        return !iValue.endsWith(fValue);
                      }
                      return false;
                    });
                    break;
                  default:
                    break;
                }
              }
            });
          }

          // DateFilter
          // Convert item value and filter value into Moment-based time first
          if (fType instanceof DateFilter) {
            Object.entries(fType).forEach(([fTypeKey, fValue]) => {
              if (typeof fValue === "object" && fValue !== null) {
                switch (fTypeKey) {
                  case "equal":
                    list = list.filter((i: T) => {
                      const iValue: number = (i[fKey] as Moment)
                        ?.toDate()
                        .getTime();
                      const fMoment: number = (fValue as Moment)
                        ?.toDate()
                        .getTime();
                      if (
                        typeof iValue === "number" &&
                        typeof fMoment == "number"
                      ) {
                        return iValue === fMoment;
                      }
                      return false;
                    });
                    break;
                  case "notEqual":
                    list = list.filter((i: T) => {
                      const iValue: number = (i[fKey] as Moment)
                        ?.toDate()
                        .getTime();
                      const fMoment: number = (fValue as Moment)
                        ?.toDate()
                        .getTime();
                      if (
                        typeof iValue === "number" &&
                        typeof fMoment == "number"
                      ) {
                        return iValue !== fMoment;
                      }
                      return false;
                    });
                    break;
                  case "less":
                    list = list.filter((i: T) => {
                      const iValue: number = (i[fKey] as Moment)
                        ?.toDate()
                        .getTime();
                      const fMoment: number = (fValue as Moment)
                        ?.toDate()
                        .getTime();
                      if (
                        typeof iValue === "number" &&
                        typeof fMoment == "number"
                      ) {
                        return iValue < fMoment;
                      }
                      return false;
                    });
                    break;
                  case "lessEqual":
                    list = list.filter((i: T) => {
                      const iValue: number = (i[fKey] as Moment)
                        ?.toDate()
                        .getTime();
                      const fMoment: number = (fValue as Moment)
                        ?.toDate()
                        .getTime();
                      if (
                        typeof iValue === "number" &&
                        typeof fMoment == "number"
                      ) {
                        return iValue <= fMoment;
                      }
                      return false;
                    });
                    break;
                  case "greater":
                    list = list.filter((i: T) => {
                      const iValue: number = (i[fKey] as Moment)
                        ?.toDate()
                        .getTime();
                      const fMoment: number = (fValue as Moment)
                        ?.toDate()
                        .getTime();
                      if (
                        typeof iValue === "number" &&
                        typeof fMoment == "number"
                      ) {
                        return iValue > fMoment;
                      }
                      return false;
                    });
                    break;
                  case "greaterEqual":
                    list = list.filter((i: T) => {
                      const iValue: number = (i[fKey] as Moment)
                        ?.toDate()
                        .getTime();
                      const fMoment: number = (fValue as Moment)
                        ?.toDate()
                        .getTime();
                      if (
                        typeof iValue === "number" &&
                        typeof fMoment == "number"
                      ) {
                        return iValue >= fMoment;
                      }
                      return false;
                    });
                    break;
                  default:
                    break;
                }
              }
            });
          }
        });
        return list;
      },
      [filter]
    );

    const combineFilterList = useCallback(
      (list: T[], fieldKeys: string[] = ["name", "code"]) => {
        const filterValue = { ...filter };
        const listValue = _cloneDeep(list).map(
          (currentItem: T & { rowKey?: string }) => {
            currentItem["rowKey"] = uuidv4();
            return currentItem;
          }
        );
        const tempList: T[] = [];
        const searchValue: string = filterValue["search"];
        fieldKeys.forEach((fieldKey: string) => {
          let listFiltered: T;
          if (typeof searchValue === "string") {
            listFiltered = listValue.filter((currentItem) => {
              const valueKey = currentItem[fieldKey]["contain"] as string;
              return valueKey.includes(searchValue);
            })[0];
            if (listFiltered && listFiltered.length > 0)
              tempList.push(listFiltered);
          }
        });
        if (tempList && tempList.length > 1) {
          tempList.reduce((acc, current) => {
            const x = acc.find((item: T) => item.rowKey === current.rowKey);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
        }
        return tempList;
      },
      [filter]
    );

    const conditionCheckNode = useCallback(
      (currentNode: T, fieldKeys: string[]): boolean => {
        let conditional = true;
        const filterValue = { ...filter };
        const isCombineSearch =
          Object.prototype.hasOwnProperty.call(filter, "search") &&
          !_isEmpty(filter["search"]);
        if (isCombineSearch) {
          const searchValue: string = filterValue["search"];
          fieldKeys.forEach((fieldKey: string) => {
            const valueKey = currentNode[fieldKey]["contain"] as string;
            conditional = conditional || valueKey.includes(searchValue);
          });
        } else {
          Object.entries(filterValue).forEach(([fKey, fType]) => {
            if (fType instanceof IdFilter) {
              Object.entries(fType).forEach(([fTypeKey, fValue]) => {
                switch (fTypeKey) {
                  case "equal":
                    conditional = conditional && currentNode[fKey] === fValue;
                    break;
                  case "notEqual":
                    conditional = conditional && currentNode[fKey] !== fValue;
                    break;
                  case "in":
                    conditional =
                      conditional && fValue.includes(currentNode[fKey]);
                    break;
                  case "notIn":
                    conditional =
                      conditional && !fValue.includes(currentNode[fKey]);
                    break;
                  default:
                    conditional = true;
                    break;
                }
              });
            }
            if (fType instanceof NumberFilter) {
              Object.entries(fType).forEach(([fTypeKey, fValue]) => {
                if (typeof fValue === "number") {
                  switch (fTypeKey) {
                    case "equal":
                      conditional = conditional && currentNode[fKey] === fValue;
                      break;
                    case "notEqual":
                      conditional = conditional && currentNode[fKey] !== fValue;
                      break;
                    case "less":
                      conditional = conditional && currentNode[fKey] < fValue;
                      break;
                    case "lessEqual":
                      conditional = conditional && currentNode[fKey] <= fValue;
                      break;
                    case "greater":
                      conditional = conditional && currentNode[fKey] > fValue;
                      break;
                    case "greaterEqual":
                      conditional = conditional && currentNode[fKey] >= fValue;
                      break;
                    default:
                      conditional = true;
                      break;
                  }
                }
              });
            }
            if (fType instanceof StringFilter) {
              Object.entries(fType).forEach(([fTypeKey, fValue]) => {
                if (typeof fValue === "string") {
                  switch (fTypeKey) {
                    case "equal":
                      conditional = conditional && currentNode[fKey] === fValue;
                      break;
                    case "notEqual":
                      conditional = conditional && currentNode[fKey] !== fValue;
                      break;
                    case "contain":
                      conditional =
                        conditional && currentNode[fKey].indexOf(fValue) >= 0;
                      break;
                    case "notContain":
                      conditional =
                        conditional && currentNode[fKey].indexOf(fValue) < 0;
                      break;
                    case "startWith":
                      conditional =
                        conditional && currentNode[fKey].startWith(fValue);
                      break;
                    case "notStartWith":
                      conditional =
                        conditional && currentNode[fKey].notStartWith(fValue);
                      break;
                    case "endWith":
                      conditional =
                        conditional && currentNode[fKey].endWith(fValue);
                      break;
                    case "notEndWith":
                      conditional =
                        conditional && currentNode[fKey].notEndWith(fValue);
                      break;
                    default:
                      break;
                  }
                }
              });
            }
            if (fType instanceof DateFilter) {
              Object.entries(fType).forEach(([fTypeKey, fValue]) => {
                if (typeof fValue === "object" && fValue !== null) {
                  const iValue = (currentNode[fKey] as Moment)
                    ?.toDate()
                    .getTime();
                  const fMoment = (fValue as Moment)?.toDate().getTime();
                  switch (fTypeKey) {
                    case "equal":
                      conditional = conditional && iValue === fMoment;
                      break;
                    case "notEqual":
                      conditional = conditional && iValue !== fMoment;
                      break;
                    case "less":
                      conditional = conditional && iValue < fMoment;
                      break;
                    case "lessEqual":
                      conditional = conditional && iValue <= fMoment;
                      break;
                    case "greater":
                      conditional = conditional && iValue > fMoment;
                      break;
                    case "greaterEqual":
                      conditional = conditional && iValue >= fMoment;
                      break;
                    default:
                      conditional = true;
                      break;
                  }
                }
              });
            }
          });
        }
        return conditional;
      },
      [filter]
    );

    const treeFilterList = useCallback(
      (treeList: T[], fieldKeys: string[] = ["name", "code"]) => {
        const getNodes = (results: T[], currentNode: T) => {
          const filterCondition: boolean = conditionCheckNode(
            currentNode,
            fieldKeys
          );
          if (filterCondition) {
            results.push(currentNode);
            return results;
          }
          if (
            Array.isArray(currentNode.children) &&
            currentNode.children.length > 0
          ) {
            const nodes = currentNode.children.reduce(getNodes, []);
            if (nodes.length) results.push({ ...currentNode, nodes });
          }
          return results;
        };
        return treeList.reduce(getNodes, []);
      },
      [conditionCheckNode]
    );

    return {
      sortList,
      filterList,
      combineFilterList,
      treeFilterList,
    };
  },
};
