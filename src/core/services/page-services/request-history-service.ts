import { IdFilter } from "react3l-advanced-filters";
import _isObject from "lodash/isObject";
import _isEqual from "lodash/isEqual";
import { queryStringService } from "core/services/page-services/query-string-service";
import React, { Reducer } from "react";
import { Model, ModelFilter, OrderType } from "react3l-common";
import { finalize, Observable } from "rxjs";
import { utilService } from "core/services/common-services/util-service";
import _cloneDeep from "lodash/cloneDeep";
import { TableRowSelection } from "antd/lib/table/interface";
import { KeyType } from "../service-types";
import {
  RequestHistory,
  RequestHistoryFilter,
} from "core/models/RequestHistory";

export enum CompareState {
  GREEN,
  RED,
  WHITE,
}

export enum HISTORY_STATE_TYPE {
  CHECK = "check",
  ADD = "add",
  REMOVE = "remove",
}

/* Start action and reducer of Request History */
type RequestHistoryState<T extends Model> = {
  requesHistoryList?: T[];
  selectedRowKeys?: KeyType[];
  selectedRows?: T[];
};

enum RequestHistoryEnum {
  UPDATE_REQUEST_HISTORY_LIST,
  UPDATE_SELECTED_ROW_KEYS,
  UPDATE_ALL,
}

interface RequestHistoryAction<T extends Model> {
  type: RequestHistoryEnum;
  payload?: RequestHistoryState<T>;
}

function requestHistoryReducer<T extends Model>(
  state: RequestHistoryState<T>,
  action: RequestHistoryAction<T>
): RequestHistoryState<T> {
  switch (action.type) {
    case RequestHistoryEnum.UPDATE_ALL:
      return {
        ...state,
        requesHistoryList: [...action.payload.requesHistoryList],
        selectedRowKeys: [...action.payload.selectedRowKeys],
        selectedRows: [...action.payload.selectedRows],
      };
    case RequestHistoryEnum.UPDATE_REQUEST_HISTORY_LIST:
      return {
        ...state,
        requesHistoryList: [...action.payload.requesHistoryList],
      };
    case RequestHistoryEnum.UPDATE_SELECTED_ROW_KEYS:
      return {
        ...state,
        selectedRowKeys: [...action.payload.selectedRowKeys],
      };
    default:
      return { ...state };
  }
}

/* End action and reducer of Request History */

export const requestHistoryService = {
  /**
   * react hook for compare 2 content of Request History;
   * @param: fieldValue: string
   * @param: contentFrom?: any
   * @param: contentTo?: any
   * @return: CompareState
   **/
  useCompareHistoryRequest(
    fieldValue: string,
    contentFrom: Model,
    contentTo: Model
  ): CompareState {
    if (contentFrom && contentTo) {
      const value = _isObject(contentFrom[fieldValue])
        ? contentFrom[fieldValue]["id"]
        : contentFrom[fieldValue];
      const oldValue = _isObject(contentTo[fieldValue])
        ? contentTo[fieldValue]["id"]
        : contentTo[fieldValue];
      if (value && oldValue) {
        if (!_isEqual(value, oldValue)) {
          return CompareState.RED;
        }
      }
      if (!value && oldValue) {
        return CompareState.GREEN;
      }
    }
    return CompareState.WHITE;
  },

  /**
   * react hook for control table list request history;
   * @param: listRequestHistory: (filter: TFilter) => Observable<T[]>
   * @param: modelFilter?: TFilter
   * @param: rowKey: string = "id"
   * @return: {
      loadingCompare,
      content,
      oldContent,
      requestHistories,
      getRowContent,
      getContents,
   * }
   **/
  useHistoryRequestList<T extends Model, TFilter extends ModelFilter>(
    listRequestHistory: (filter: TFilter) => Observable<T[]>,
    modelFilter: TFilter,
    redirectPath: string,
    rowKey = "id"
  ) {
    const [
      { requesHistoryList, selectedRowKeys, selectedRows },
      dispatchHistoryState,
    ] = React.useReducer<
      Reducer<RequestHistoryState<T>, RequestHistoryAction<T>>
    >(requestHistoryReducer, {
      requesHistoryList: [],
      selectedRowKeys: [],
      selectedRows: [],
    });

    const { requestId, history } =
      queryStringService.useGetQueryString("requestId");

    const [loadingRequestHistory, setLoadingRequestHistory] =
      React.useState<boolean>(false);
    const handleChangeCheckBox = React.useCallback(
      (selectedRowKeys: KeyType[], selectedRows: T[]) => {
        const listValue = _cloneDeep(requesHistoryList);
        let modifiedList: T[];
        if (selectedRowKeys.length < 2) {
          modifiedList = listValue.map((current: T) => {
            const currentValue = { ...current } as T & { disabled: boolean };
            currentValue.disabled = false;
            return currentValue;
          });
        } else {
          modifiedList = listValue.map((current: T) => {
            const currentValue = { ...current } as T & { disabled: boolean };
            if (selectedRowKeys.includes(currentValue[rowKey])) {
              currentValue.disabled = false;
            } else {
              currentValue.disabled = true;
            }
            return currentValue;
          });
        }
        dispatchHistoryState({
          type: RequestHistoryEnum.UPDATE_ALL,
          payload: {
            requesHistoryList: modifiedList,
            selectedRowKeys: selectedRowKeys,
            selectedRows,
          },
        });
      },
      [requesHistoryList, rowKey]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowSelection: TableRowSelection<T & { disabled: boolean }> =
      React.useMemo(() => {
        return {
          onChange: handleChangeCheckBox,
          hideSelectAll: true,
          selectedRowKeys,
          getCheckboxProps: (record: T & { disabled: boolean }) => ({
            disabled: record.disabled,
          }),
        };
      }, [handleChangeCheckBox, selectedRowKeys]);

    const handleCompareHistory = React.useCallback(() => {
      const selectedRowKeyValues = [...selectedRowKeys];
      history.push({
        pathname: redirectPath,
        search: `?versionTo=${selectedRowKeyValues[0]}&versionFrom=${selectedRowKeyValues[1]}`,
      });
    }, [history, redirectPath, selectedRowKeys]);

    React.useEffect(() => {
      const filterValue = { ...modelFilter } as TFilter & {
        requestId: IdFilter;
      };
      filterValue.requestId = { ...new IdFilter(), equal: requestId };
      setLoadingRequestHistory(true);
      const subcription = listRequestHistory(filterValue)
        .pipe(
          finalize(() => {
            setLoadingRequestHistory(false);
          })
        )
        .subscribe({
          next: (res) => {
            if (res) {
              dispatchHistoryState({
                type: RequestHistoryEnum.UPDATE_REQUEST_HISTORY_LIST,
                payload: {
                  requesHistoryList: res,
                },
              });
            }
          },
        });

      return () => {
        subcription.unsubscribe();
      };
    }, [listRequestHistory, modelFilter, requestId]);

    return {
      requesHistoryList,
      selectedRows,
      loadingRequestHistory,
      rowSelection,
      handleCompareHistory,
    };
  },

  /**
   * react hook for control detail view of 2 request history;
   * @param: requestHistoryRepository: (filter: TFilter) => Observable<T[]>
   * @return: {
      loadingCompare,
      content,
      oldContent,
      requestHistories,
      getRowContent,
      getContents,
      getPrimitiveArrays,
      getPrimitiveValue
   * }
   **/
  useHistoryRequestDetail(
    requestHistoryRepository: (
      filter: RequestHistoryFilter
    ) => Observable<RequestHistory[]>
  ) {
    const { queryObject } = queryStringService.useGetQueryString();

    const versionFrom = React.useMemo<number>(() => {
      const versionFrom = queryObject["versionFrom"]
        ? Number(queryObject["versionFrom"])
        : 0;
      return versionFrom;
    }, [queryObject]);

    const versionTo = React.useMemo<number>(() => {
      const versionTo = queryObject["versionTo"]
        ? Number(queryObject["versionTo"])
        : 0;
      return versionTo;
    }, [queryObject]);

    const [loadingCompare, setLoadingCompare] = React.useState(false);

    const [requestHistories, setRequestHistories] = React.useState<
      RequestHistory[]
    >([]);

    const [content, setContent] = React.useState(new RequestHistory());

    const [oldContent, setOldContent] = React.useState(new RequestHistory());

    const getPrimitiveArrays = React.useCallback(
      (arrayFieldName: string) => {
        const primitiveList =
          content[arrayFieldName] && content[arrayFieldName].length > 0
            ? [...content[arrayFieldName]]
            : [];
        const primitiveOldList =
          oldContent[arrayFieldName] && oldContent[arrayFieldName].length > 0
            ? [...oldContent[arrayFieldName]]
            : [];
        const concatList = [...primitiveList, ...primitiveOldList];
        const uniqueList = concatList.filter((v, i, a) => a.indexOf(v) === i);
        return uniqueList;
      },
      [content, oldContent]
    );

    const getPrimitiveValue = React.useCallback(
      (arrayFieldName: string, value: string | number) => {
        const requestArrays =
          content[arrayFieldName] && content[arrayFieldName].length > 0
            ? content[arrayFieldName]
            : [];
        const oldRequestArrays =
          oldContent[arrayFieldName] && oldContent[arrayFieldName].length > 0
            ? oldContent[arrayFieldName]
            : [];
        const oldItem = requestArrays.filter(
          (current: number | string) => current === value
        )[0];
        const item = oldRequestArrays.filter(
          (current: number | string) => current === value
        )[0];
        let state: HISTORY_STATE_TYPE;
        if (oldItem && item) {
          state = HISTORY_STATE_TYPE.CHECK;
        } else {
          if (item) {
            state = HISTORY_STATE_TYPE.ADD;
          }
          if (oldItem) {
            state = HISTORY_STATE_TYPE.REMOVE;
          }
        }
        return {
          content: {
            content: item,
          },
          oldContent: {
            content: oldItem,
          },
          state,
        };
      },
      [content, oldContent]
    );

    const getContents = React.useCallback(
      <T extends Model>(contentField: string, uniqueField?: string) => {
        const list: T[] =
          content[contentField] && content[contentField].length > 0
            ? [...content[contentField]]
            : [];
        const oldList: T[] =
          oldContent[contentField] && oldContent[contentField].length > 0
            ? [...oldContent[contentField]]
            : [];
        const concatList = [...list, ...oldList];
        return utilService.uniqueArray(concatList, uniqueField);
      },
      [content, oldContent]
    );

    const getRowContent = React.useCallback(
      <T extends Model>(contentField: string) =>
        (uniqueValue: string | number, uniqueField = "id") => {
          const requestContents =
            content[contentField] && content[contentField].length > 0
              ? content[contentField]
              : [];
          const oldRequestContents =
            oldContent[contentField] && oldContent[contentField].length > 0
              ? oldContent[contentField]
              : [];

          const oldContentValue = oldRequestContents.filter(
            (current: T) => current[uniqueField] === uniqueValue
          )[0];
          const contentValue = requestContents.filter(
            (current: T) => current[uniqueField] === uniqueValue
          )[0];
          let state: HISTORY_STATE_TYPE;
          if (contentValue && oldContentValue) {
            state = HISTORY_STATE_TYPE.CHECK;
          } else {
            if (contentValue) {
              state = HISTORY_STATE_TYPE.ADD;
            }
            if (oldContentValue) {
              state = HISTORY_STATE_TYPE.REMOVE;
            }
          }
          return {
            content: contentValue,
            oldContent: oldContentValue,
            state,
          };
        },
      [oldContent, content]
    );

    React.useEffect(() => {
      const requestHistoryFilter = new RequestHistoryFilter();
      requestHistoryFilter.versionId.in = [versionFrom, versionTo];
      requestHistoryFilter.orderBy = "savedAt";
      requestHistoryFilter.orderType = OrderType.DESC;

      setLoadingCompare(true);
      const subcription = requestHistoryRepository(requestHistoryFilter)
        .pipe(
          finalize(() => {
            setLoadingCompare(false);
          })
        )
        .subscribe({
          next: (res) => {
            if (res && res.length === 2) {
              setRequestHistories(res);
              setOldContent(res[0].content);
              setContent(res[1].content);
            }
          },
        });
      return () => {
        subcription.unsubscribe();
      };
    }, [requestHistoryRepository, versionFrom, versionTo]);

    return {
      loadingCompare,
      content,
      oldContent,
      requestHistories,
      getRowContent,
      getContents,
      getPrimitiveArrays,
      getPrimitiveValue,
    };
  },
};
