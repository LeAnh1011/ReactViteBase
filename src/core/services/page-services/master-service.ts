import React, { Reducer } from "react";
import { useHistory } from "react-router-dom";
import { Model, ModelFilter } from "react3l-common";
import _isEmpty from "lodash/isEmpty";
import { Observable } from "rxjs";
import qs from "qs";
import { FilterAction, FilterActionEnum } from "../service-types";

export interface RepoState {
  tabKey: string;
  tabTitle: string;
  list: (filter?: ModelFilter) => Observable<Model[]>;
  count: (filter?: ModelFilter) => Observable<number>;
  export?: (filter?: ModelFilter) => Observable<unknown>;
  import?: (file: File, name: string) => Observable<void>;
  exportTemplate?: () => Observable<unknown>;
}

interface RepoAction {
  type: string;
  data: RepoState;
}

function repositoryReducer(state: RepoState, action: RepoAction) {
  switch (action.type) {
    case "UPDATE":
      return { ...action.data };
    default:
      return { ...state };
  }
}

export const masterService = {
  /**
   * react hook for control list/count data from server
   * @param: routeView: string
   * @param: deleteAction?: (t: Model) => void
   * @return: { history,
      handleGoCreate,
      handleGoDetail,
      handleGoMaster,
      handleDeleteItem }
   * */
  useMasterAction(routeView: string) {
    const history = useHistory();
    const baseRoute = React.useMemo(() => {
      const listPath = routeView.split("/");
      const baseRoute = "/" + listPath[listPath.length - 1];
      return baseRoute;
    }, [routeView]);

    const handleGoCreate = React.useCallback(() => {
      history.push(`${routeView}${baseRoute}-detail`);
    }, [routeView, baseRoute, history]);

    const handleGoDetail = React.useCallback(
      (id: string | number) => {
        return () => {
          history.push(`${routeView}${baseRoute}-detail?id=${id}`);
        };
      },
      [routeView, baseRoute, history]
    );

    const handleGoElseWhere = React.useCallback(
      (route: string, queryParam: { key: string; value: string | number }) => {
        history.push(`${route}?${queryParam.key}=${queryParam.value}`);
      },
      [history]
    );

    const handleGoMaster = React.useCallback(() => {
      history.replace(`${routeView}${baseRoute}-master`);
    }, [routeView, baseRoute, history]);

    const handleGoPreView = React.useCallback(
      (id: string | number) => {
        return () => {
          history.push(`${routeView}${baseRoute}-preview?id=${id}`);
        };
      },
      [routeView, baseRoute, history]
    );

    const handleGoApprove = React.useCallback(
      (id: string | number) => {
        return () => {
          history.push(`${routeView}${baseRoute}-approve?id=${id}`);
        };
      },
      [routeView, baseRoute, history]
    );
    return {
      history,
      handleGoCreate,
      handleGoDetail,
      handleGoMaster,
      handleGoPreView,
      handleGoApprove,
      handleGoElseWhere,
    };
  },

  /**
   *
   * react hook for manage multiple tab/repository
   * @param: tabRepositories: RepoState[]
   * @param: dispatchFilter: React.Dispatch<FilterAction<TFilter>>
   *
   * @return: { repo, dispatchRepo, handleChangeTab }
   *
   * */
  useTabRepository<TFilter extends ModelFilter>(
    tabRepositories: RepoState[],
    dispatchFilter?: React.Dispatch<FilterAction<TFilter>>
  ) {
    const history = useHistory();

    const initRepo = React.useMemo<RepoState>(() => {
      const queryParam = qs.parse(history.location.search.substring(1));

      if (!_isEmpty(queryParam) && queryParam.tabKey) {
        const currentTabRepo: RepoState = tabRepositories.filter(
          (currentItem) => currentItem.tabKey === queryParam.tabKey
        )[0];
        return currentTabRepo;
      }
      return tabRepositories[0];
    }, [history, tabRepositories]);

    const [repo, dispatchRepo] = React.useReducer<
      Reducer<RepoState, RepoAction>
    >(repositoryReducer, initRepo);

    const handleChangeTab = React.useCallback(
      (activeTabKey: string) => {
        const currentTabRepo: RepoState = tabRepositories.filter(
          (currentItem) => currentItem.tabKey === activeTabKey
        )[0];
        if (currentTabRepo) {
          dispatchRepo({
            type: "UPDATE",
            data: currentTabRepo,
          });
          if (typeof dispatchFilter !== "undefined") {
            const newFilter = new ModelFilter();
            newFilter.tabKey = currentTabRepo.tabKey;

            dispatchFilter({
              type: FilterActionEnum.SET,
              payload: {
                ...newFilter,
                skip: 0,
                take: 10,
              } as TFilter,
            });
          }
        }
      },
      [dispatchFilter, tabRepositories]
    );

    return {
      repo,
      dispatchRepo,
      handleChangeTab,
    };
  },
};
