import React, {
  Reducer,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Model, ModelFilter } from "react3l-common";
import { finalize, forkJoin, Observable } from "rxjs";
import { webService } from "../common-services/web-service";
import { queryStringService } from "./query-string-service";
import appMessageService from "../common-services/app-message-service";
import { AxiosError } from "axios";
import { fieldService } from "./field-service";
import { useHistory } from "react-router-dom";
import { utilService } from "core/services/common-services/util-service";
import {
  GeneralAction,
  GeneralActionEnum,
  ValidationError,
} from "../service-types";

/* Action and Reducer of Mapping control */
type MappingModel<T extends Model> = {
  list?: T[];
  count?: number;
  contentIds?: number[];
  contentValues?: Model[];
  checkedKeys?: number[];
  checkedValues?: T[];
};

enum MappingTypeEnum {
  UPDATE_LIST,
  UPDATE_CONTENTS,
  UPDATE_CHECKED,
  CHECKED,
  CHECKED_ALL,
  UNCHECKED,
  UNCHECKED_ALL,
  UNDO_CHECKED,
}

interface MappingAction<T extends Model> {
  type: MappingTypeEnum;
  payload?: MappingModel<T>;
}

function mappingReducer<T extends Model>(
  state: MappingModel<T>,
  action: MappingAction<T>
): MappingModel<T> {
  switch (action.type) {
    case MappingTypeEnum.UPDATE_CONTENTS:
      return {
        ...state,
        contentIds: action.payload.contentIds,
        contentValues: action.payload.contentValues,
        checkedKeys: action.payload.contentIds,
      };
    case MappingTypeEnum.UPDATE_LIST:
      return {
        ...state,
        list: [...action.payload.list],
        count: action.payload.count,
      };
    case MappingTypeEnum.UPDATE_CHECKED:
      return {
        ...state,
        checkedKeys: action.payload.checkedKeys,
        checkedValues: action.payload.checkedValues,
      };
    case MappingTypeEnum.CHECKED:
      return {
        ...state,
        checkedKeys: [...state.checkedKeys, ...action.payload.checkedKeys],
        checkedValues: [
          ...state.checkedValues,
          ...action.payload.checkedValues,
        ],
      };
    case MappingTypeEnum.UNCHECKED:
      state.checkedKeys = state.checkedKeys.filter(
        (current: number) => current !== action.payload.checkedKeys[0]
      );
      state.checkedValues = state.checkedValues.filter(
        (current: T) => current.id !== action.payload.checkedValues[0]?.id
      );
      return {
        ...state,
      };
    case MappingTypeEnum.CHECKED_ALL:
      return {
        ...state,
        checkedKeys: Array.from(
          new Set([...state.checkedKeys, ...action.payload.checkedKeys])
        ),
        checkedValues: utilService.uniqueArray([
          ...state.checkedValues,
          ...action.payload.checkedValues,
        ]) as T[],
      };
    case MappingTypeEnum.UNCHECKED_ALL:
      state.checkedKeys = state.checkedKeys.filter((current: number) =>
        action.payload.checkedKeys.every((number) => number !== current)
      );
      state.checkedValues = state.checkedValues.filter((current: T) =>
        action.payload.checkedValues.every((item: T) => item.id !== current.id)
      );
      return {
        ...state,
      };
    case MappingTypeEnum.UNDO_CHECKED:
      return {
        ...state,
        checkedKeys: action.payload.checkedKeys,
        checkedValues: action.payload.checkedValues,
      };
    default:
      return { ...state };
  }
}

function modelReducer<T extends Model>(state: T, action: GeneralAction<T>): T {
  switch (action.type) {
    case GeneralActionEnum.SET:
      return { ...(action.payload as T) };
    case GeneralActionEnum.UPDATE:
      return { ...state, ...(action.payload as T) };
    case GeneralActionEnum.SET_ERRORS: {
      const errors: ValidationError = {};
      const errorArrays: ValidationError = {};
      if (!utilService.isEmpty(action.payload)) {
        Object.keys(action.payload as ValidationError).forEach(
          (key: string) => {
            if (
              action.payload[key] &&
              typeof action.payload[key] === "string"
            ) {
              errors[key] = action.payload[key];
            } else {
              errorArrays[key] = action.payload[key];
            }
          }
        );
        if (!utilService.isEmpty(errorArrays)) {
          Object.keys(errorArrays).forEach((key: string) => {
            const contents = state[key] || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const values: any = errorArrays[key];
            Object.keys(values).forEach((key: string) => {
              const indexNumber = Number(key);
              if (contents[indexNumber]) {
                contents[indexNumber]["errors"] = { ...values[key] };
              } else {
                contents[indexNumber] = {};
                contents[indexNumber]["errors"] = { ...values[key] };
              }
            });
          });
        }
      }
      return { ...state, errors };
    }
    case GeneralActionEnum.UPDATE_ERRORS:
      if (action.payload && !utilService.isEmpty(action.payload)) {
        state.errors = {
          ...state["errors"],
          ...(action.payload as Model.Errors<Model>),
        };
      }
      return { ...state };
    default:
      return { ...state };
  }
}

export const detailService = {
  /**
   *
   * react hook for manage state of model
   * @param: ModelClass: new () => T
   * @param: initData: T
   *
   * @return: { model, dispatch }
   *
   * */
  useModel<T extends Model>(ModelClass: new () => T, initData?: T) {
    const [model, dispatch] = useReducer<Reducer<T, GeneralAction<T>>>(
      modelReducer,
      initData ? initData : new ModelClass()
    );
    const stateRef = useRef(model);
    stateRef.current = model;
    const getModel = useCallback(() => stateRef.current, []);

    return {
      model,
      dispatch,
      getModel,
    };
  },

  /**
   *
   * react hook for check detail page and set detail data
   * @param: getDetail:(id: number | string) => Observable<T>
   * @param: dispatch: React.Dispatch<ModelAction<T>>
   *
   * @return: { isDetail }
   *
   * */
  useGetIsDetail<T extends Model>(
    getDetail: (id: number | string) => Observable<T>,
    dispatch: React.Dispatch<unknown>
  ) {
    const { id } = queryStringService.useGetQueryString("id");
    const isDetail = useMemo(() => id !== null, [id]);

    useEffect(() => {
      if (isDetail) {
        const subscription = getDetail(id).subscribe({
          next: (res) =>
            dispatch({ type: GeneralActionEnum.SET, payload: res }),
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    }, [dispatch, getDetail, id, isDetail]);

    return { isDetail };
  },

  /**
   *
   * react hook for handle actions in detail page
   * @param: model: T
   * @param: saveModel: (t: T) => Observable<T>
   *
   * @return: { loading, setLoading, handleSaveModel, handleGoMaster }
   *
   * */
  useActionsDetail<T extends Model>(
    model: T,
    saveModel: (t: T) => Observable<T>,
    handleChangeAllField: (data: unknown) => void,
    routeView: string,
    queryParams?: string,
    approveModel?: (t: T) => Observable<T>,
    cancelModel?: (t: T) => Observable<T>,
    rejectModel?: (t: T) => Observable<T>,
    resetModel?: (t: T) => Observable<T>
  ) {
    const history = useHistory();

    const baseRoute = useMemo(() => {
      const listPath = routeView.split("/");
      const baseRoute = "/" + listPath[listPath.length - 1];
      return baseRoute;
    }, [routeView]);

    const [loading, setLoading] = useState<boolean>(false);
    const [subscription] = webService.useSubscription();
    const { notifyUpdateItemSuccess, notifyUpdateItemError } =
      appMessageService.useCRUDMessage();

    const handleGoMaster = useCallback(() => {
      history.replace(
        `${routeView}${baseRoute}-master${queryParams ? queryParams : ""}`
      );
    }, [routeView, baseRoute, history, queryParams]);

    const handleSaveModel = useCallback(() => {
      setLoading(true);
      subscription.add(
        saveModel(model)
          .pipe(finalize(() => setLoading(false)))
          .subscribe({
            next: () => {
              notifyUpdateItemSuccess();
              handleGoMaster();
            },
            error: (error: AxiosError<T>) => {
              if (error.response && error.response.status === 400)
                handleChangeAllField(error.response?.data);
              notifyUpdateItemError({
                message: "Cập nhật có lỗi",
                description: utilService.getGeneralError(error),
              });
            },
          })
      );
    }, [
      handleChangeAllField,
      handleGoMaster,
      model,
      notifyUpdateItemError,
      notifyUpdateItemSuccess,
      saveModel,
      subscription,
    ]);

    const handleSaveNoneRedirect = useCallback(() => {
      setLoading(true);
      subscription.add(
        saveModel(model)
          .pipe(finalize(() => setLoading(false)))
          .subscribe({
            next: (item: T) => {
              handleChangeAllField(item);
              notifyUpdateItemSuccess();
            },
            error: (error: AxiosError<T>) => {
              if (error.response && error.response.status === 400)
                handleChangeAllField(error.response?.data);
              notifyUpdateItemError({
                message: "Cập nhật có lỗi",
                description: utilService.getGeneralError(error),
              });
            },
          })
      );
    }, [
      handleChangeAllField,
      model,
      notifyUpdateItemError,
      notifyUpdateItemSuccess,
      saveModel,
      subscription,
    ]);

    const handleSavePromise = useCallback(async () => {
      const promise = new Promise((resolve, reject) => {
        setLoading(true);
        subscription.add(
          saveModel(model)
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
              next: (item: T) => {
                handleChangeAllField(item);
                notifyUpdateItemSuccess();
                resolve(item);
              },
              error: (error: AxiosError<T>) => {
                if (error.response && error.response.status === 400)
                  handleChangeAllField(error.response?.data);
                notifyUpdateItemError({
                  message: "Cập nhật có lỗi",
                  description: utilService.getGeneralError(error),
                });
                reject(error);
              },
            })
        );
      });
      return promise;
    }, [
      handleChangeAllField,
      model,
      notifyUpdateItemError,
      notifyUpdateItemSuccess,
      saveModel,
      subscription,
    ]);
    const handleCancelModel = useCallback(() => {
      setLoading(true);
      subscription.add(
        cancelModel(model)
          .pipe(finalize(() => setLoading(false)))
          .subscribe({
            next: () => {
              notifyUpdateItemSuccess();
              handleGoMaster();
            },
            error: (error: AxiosError<T>) => {
              if (error.response && error.response.status === 400)
                handleChangeAllField(error.response?.data);
              notifyUpdateItemError({
                message: "Cập nhật có lỗi",
                description: utilService.getGeneralError(error),
              });
            },
          })
      );
    }, [
      cancelModel,
      handleChangeAllField,
      handleGoMaster,
      model,
      notifyUpdateItemError,
      notifyUpdateItemSuccess,
      subscription,
    ]);
    const handleRejectModel = useCallback(() => {
      setLoading(true);
      subscription.add(
        rejectModel(model)
          .pipe(finalize(() => setLoading(false)))
          .subscribe({
            next: () => {
              notifyUpdateItemSuccess();
              handleGoMaster();
            },
            error: (error: AxiosError<T>) => {
              if (error.response && error.response.status === 400)
                handleChangeAllField(error.response?.data);
              notifyUpdateItemError({
                message: "Cập nhật có lỗi",
                description: utilService.getGeneralError(error),
              });
            },
          })
      );
    }, [
      handleChangeAllField,
      handleGoMaster,
      model,
      notifyUpdateItemError,
      notifyUpdateItemSuccess,
      rejectModel,
      subscription,
    ]);
    const handleApproveModel = useCallback(() => {
      setLoading(true);
      subscription.add(
        approveModel(model)
          .pipe(finalize(() => setLoading(false)))
          .subscribe({
            next: () => {
              notifyUpdateItemSuccess();
              handleGoMaster();
            },
            error: (error: AxiosError<T>) => {
              if (error.response && error.response.status === 400)
                handleChangeAllField(error.response?.data);
              notifyUpdateItemError({
                message: "Cập nhật có lỗi",
                description: utilService.getGeneralError(error),
              });
            },
          })
      );
    }, [
      approveModel,
      handleChangeAllField,
      handleGoMaster,
      model,
      notifyUpdateItemError,
      notifyUpdateItemSuccess,
      subscription,
    ]);
    const handleResetModel = useCallback(() => {
      setLoading(true);
      subscription.add(
        resetModel(model)
          .pipe(finalize(() => setLoading(false)))
          .subscribe({
            next: () => {
              notifyUpdateItemSuccess();
              handleGoMaster();
            },
            error: (error: AxiosError<T>) => {
              if (error.response && error.response.status === 400)
                handleChangeAllField(error.response?.data);
              notifyUpdateItemError({
                message: "Cập nhật có lỗi",
                description: utilService.getGeneralError(error),
              });
            },
          })
      );
    }, [
      resetModel,
      handleChangeAllField,
      handleGoMaster,
      model,
      notifyUpdateItemError,
      notifyUpdateItemSuccess,
      subscription,
    ]);

    return {
      loading,
      setLoading,
      handleSaveModel,
      handleGoMaster,
      handleSaveNoneRedirect,
      handleSavePromise,
      handleApproveModel,
      handleCancelModel,
      handleRejectModel,
      handleResetModel,
    };
  },

  /**
   *
   * react hook for handle logic in detail modal page
   * @param: ModelClass: new () => T
   * @param: getDetail: (id: number) => Observable<T>
   * @param: saveModel: (t: Model) => Observable<T>
   * @param: saveModel: handleSeach?: () => void
   * 
   * @return: { model,
      dispatch,
      isOpenDetailModal,
      loadingModel,
      handleOpenDetailModal,
      handleSaveModel,
      handleCloseDetailModal,
      handleChangeSingleField,
      handleChangeSelectField,
      handleChangeMultipleSelectField,
      handleChangeDateField,
      handleChangeTreeField,
      handleChangeAllField }
   *
   * */
  useDrawer<T extends Model>(
    ModelClass: new () => T,
    getDetail: (id: number) => Observable<T>,
    saveModel: (t: T) => Observable<T>,
    updateSuccesCallback?: () => void,
    defaultModel?: T
  ) {
    const { notifyUpdateItemSuccess, notifyUpdateItemError } =
      appMessageService.useCRUDMessage();

    const [subscription] = webService.useSubscription();

    const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);
    const [loadingDrawer, setLoadingDrawer] = useState<boolean>(false);
    const { model, dispatch } = this.useModel(ModelClass);
    const {
      handleChangeSingleField,
      handleChangeSelectField,
      handleChangeMultipleSelectField,
      handleChangeDateField,
      handleChangeTreeField,
      handleChangeAllField,
      handleChangeBoolField,
      handleChangeMultipleField,
    } = fieldService.useField(model, dispatch);

    const handleOpenDrawer = useCallback(
      (value?: number) => {
        setIsOpenDrawer(true);
        if (value) {
          setLoadingDrawer(true);
          subscription.add(
            getDetail(value)
              .pipe(finalize(() => setLoadingDrawer(false)))
              .subscribe((item: T) => {
                handleChangeAllField(item);
              })
          );
        } else {
          handleChangeAllField(defaultModel ? defaultModel : new ModelClass());
        }
      },
      [subscription, getDetail, handleChangeAllField, defaultModel, ModelClass]
    );

    const handleSaveModel = useCallback(() => {
      setLoadingDrawer(true);
      subscription.add(
        saveModel(model)
          .pipe(finalize(() => setLoadingDrawer(false)))
          .subscribe({
            next: (item: T) => {
              handleChangeAllField(item);
              setIsOpenDrawer(false);
              if (typeof updateSuccesCallback === "function")
                updateSuccesCallback();
              notifyUpdateItemSuccess({
                message: "Cập nhật thành công",
                className: "antd-notification-drawer",
              });
            },
            error: (error: AxiosError<T>) => {
              if (error.response && error.response.status === 400)
                handleChangeAllField(error.response?.data);
              notifyUpdateItemError({
                message: "Cập nhật thất bại",
                className: "antd-notification-drawer",
              });
            },
          })
      );
    }, [
      saveModel,
      subscription,
      updateSuccesCallback,
      notifyUpdateItemError,
      notifyUpdateItemSuccess,
      handleChangeAllField,
      model,
    ]);

    const handleSaveModelPromise: () => Promise<T> = useCallback(() => {
      setLoadingDrawer(true);
      const promise: Promise<T> = new Promise((resolve, reject) => {
        subscription.add(
          saveModel(model)
            .pipe(finalize(() => setLoadingDrawer(false)))
            .subscribe({
              next: (item: T) => {
                handleChangeAllField(item);
                setIsOpenDrawer(false);
                notifyUpdateItemSuccess({
                  message: "Cập nhật thành công",
                  className: "antd-notification-drawer",
                });
                resolve(item);
              },
              error: (error: AxiosError<T>) => {
                if (error.response && error.response.status === 400)
                  handleChangeAllField(error.response?.data);
                notifyUpdateItemError({
                  message: "Cập nhật thất bại",
                  className: "antd-notification-drawer",
                });
                reject(false);
              },
            })
        );
      });
      return promise;
    }, [
      saveModel,
      subscription,
      notifyUpdateItemError,
      notifyUpdateItemSuccess,
      handleChangeAllField,
      model,
    ]);

    const handleCloseDrawer = useCallback(() => {
      setIsOpenDrawer(false);
      if (model.id) handleChangeAllField({ ...model });
      else handleChangeAllField({ ...new ModelClass() });
    }, [ModelClass, handleChangeAllField, model]);

    return {
      model,
      dispatch,
      isOpenDrawer,
      loadingDrawer,
      handleOpenDrawer,
      handleSaveModel,
      handleCloseDrawer,
      handleChangeMultipleField,
      handleChangeBoolField,
      handleChangeSingleField,
      handleChangeSelectField,
      handleChangeMultipleSelectField,
      handleChangeDateField,
      handleChangeTreeField,
      handleChangeAllField,
      handleSaveModelPromise,
    };
  },

  /**
   *
   * react hook for handle logic in detail modal page
   * @param: list: (filter: TFilter) => Observable<T[]>,
   * @param: count: (filter: TFilter) => Observable<number>,
   * @param: mappingData: (data: T[]) => TContent[],
   * @param: modelFilter: ModelFilter,
   * @param: contents: TContent[],
   * @param: isMultipleMapping: boolean = false
   *
   * @return: {
   *  open,
   *  listMapping: mappingModel.list,
   *  countMapping: mappingModel.count,
   *  checkedKeys: mappingModel.checkedKeys,
   *  spinning,
   *  handleOpenMapping,
   *  handleCloseMapping,
   *  handleSaveMapping,
   *  handleCancelMapping,
   *  handleCheckItem,
   *  }
   *
   * */

  useMappingService<
    T extends Model,
    TFilter extends ModelFilter,
    TContent extends Model
  >(
    list: (filter: TFilter) => Observable<T[]>,
    count: (filter: TFilter) => Observable<number>,
    modelFilter: ModelFilter,
    contents: TContent[],
    mappingField: [string, string],
    isMultipleMapping = false
  ) {
    const [open, setOpen] = React.useState<boolean>(false);
    const [spinning, setSpinning] = React.useState<boolean>(false);
    const [mappingModel, dispatchMappingModel] = React.useReducer<
      Reducer<MappingModel<T>, MappingAction<T>>
    >(mappingReducer, {
      list: [],
      count: 0,
      checkedKeys: [],
      checkedValues: [],
    });
    const [subscription] = webService.useSubscription();
    const firstUpdate = React.useRef(true);
    const firstRender = React.useRef(true);
    const handleSaveMapping = React.useCallback(() => {
      const { checkedValues } = mappingModel;
      setOpen(false);
      return [...checkedValues];
    }, [mappingModel]);

    const handleResetMapping = React.useCallback(() => {
      const checkedKeys =
        contents.length > 0
          ? contents.map((content) => content[mappingField[0]])
          : [];
      const checkedValues =
        contents.length > 0
          ? contents.map((content) => content[mappingField[1]])
          : [];
      dispatchMappingModel({
        type: MappingTypeEnum.UPDATE_CHECKED,
        payload: {
          checkedKeys,
          checkedValues,
        },
      });
    }, [mappingField, contents]);

    const handleCancelMapping = React.useCallback(() => {
      if (!isMultipleMapping) {
        handleResetMapping();
      }
      setOpen(false);
    }, [isMultipleMapping, handleResetMapping]);

    const handleChangeItem = React.useCallback(
      (checkedIds: number[], checkedRows: T[], info: { type: string }) => {
        if (info && info.type === "all" && checkedIds.length === 0) {
          const { checkedKeys, checkedValues } = mappingModel;
          dispatchMappingModel({
            type: MappingTypeEnum.UPDATE_CHECKED,
            payload: {
              checkedKeys: [...checkedKeys],
              checkedValues: [...checkedValues],
            },
          });
        } else {
          dispatchMappingModel({
            type: MappingTypeEnum.UPDATE_CHECKED,
            payload: {
              checkedKeys: [...checkedIds],
              checkedValues: [...checkedRows],
            },
          });
        }
      },
      [mappingModel]
    );

    const handleCheck = React.useCallback((record: T, selected: boolean) => {
      const { id } = record;
      if (selected) {
        dispatchMappingModel({
          type: MappingTypeEnum.CHECKED,
          payload: {
            checkedKeys: [id],
            checkedValues: [record],
          },
        });
      } else {
        dispatchMappingModel({
          type: MappingTypeEnum.UNCHECKED,
          payload: {
            checkedKeys: [id],
            checkedValues: [record],
          },
        });
      }
    }, []);

    const handleCheckAll = React.useCallback(
      (selected: boolean, selectedRows: T[], changeRows: T[]) => {
        const selectedIds = changeRows.map((row) => row.id);
        if (selected) {
          dispatchMappingModel({
            type: MappingTypeEnum.CHECKED_ALL,
            payload: {
              checkedKeys: [...selectedIds],
              checkedValues: [...changeRows],
            },
          });
        } else {
          dispatchMappingModel({
            type: MappingTypeEnum.UNCHECKED_ALL,
            payload: {
              checkedKeys: [...selectedIds],
              checkedValues: [...changeRows],
            },
          });
        }
      },
      []
    );

    const handleGetListMapping = React.useCallback(
      (filterParam?: TFilter) => {
        setSpinning(true);
        const filterValue = filterParam
          ? { ...filterParam }
          : ({ ...new ModelFilter(), skip: 0, take: 10 } as TFilter);
        const getMappingData = forkJoin([list(filterValue), count(filterValue)])
          .pipe(
            finalize(() => {
              setSpinning(false);
            })
          )
          .subscribe({
            next: (results: [T[], number]) => {
              const list = results[0];
              const count = Number(results[1]);
              dispatchMappingModel({
                type: MappingTypeEnum.UPDATE_LIST,
                payload: {
                  list,
                  count,
                },
              });
            },
          });
        subscription.add(getMappingData);
      },
      [count, list, subscription]
    );

    const handleOpenMapping = React.useCallback(() => {
      setOpen(true);
      if (mappingModel.list.length === 0) {
        handleGetListMapping();
      }
      if (isMultipleMapping) {
        dispatchMappingModel({
          type: MappingTypeEnum.UPDATE_CHECKED,
          payload: {
            checkedKeys: [],
            checkedValues: [],
          },
        });
      }
    }, [handleGetListMapping, isMultipleMapping, mappingModel.list]);

    const handleCloseMapping = React.useCallback(() => {
      setOpen(false);
    }, []);

    React.useEffect(() => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      if (contents && !isMultipleMapping) {
        handleResetMapping();
      }
    }, [contents, isMultipleMapping, handleResetMapping]);

    React.useEffect(() => {
      if (firstUpdate.current) {
        firstUpdate.current = false;
        return;
      }
      if (modelFilter) {
        handleGetListMapping(modelFilter as TFilter);
      }
    }, [handleGetListMapping, modelFilter]);

    return {
      open,
      listMapping: mappingModel.list,
      countMapping: mappingModel.count,
      checkedKeys: mappingModel.checkedKeys,
      spinning,
      handleOpenMapping,
      handleCloseMapping,
      handleSaveMapping,
      handleCancelMapping,
      handleChangeItem,
      handleCheck,
      handleCheckAll,
    };
  },
};
