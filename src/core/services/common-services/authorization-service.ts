import { menu } from "config/menu";
import React, { Reducer, useContext } from "react";
import { forkJoin, Subscription } from "rxjs";
import { utilService } from "./util-service";
import _kebabCase from "lodash/kebabCase";
import _isEmpty from "lodash/isEmpty";
import _cloneDeep from "lodash/cloneDeep";
import { AppStateContext } from "app/AppContext";
import { ACTION_URL_REGEX } from "core/config/consts";
import { Menu } from "config/config-type";
import { AppAction, AppActionEnum, AppState } from "../service-types";

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case AppActionEnum.SET:
      return {
        ...action.payload,
      };
    case AppActionEnum.UPDATE:
      return {
        ...state,
        ...action.payload,
      };
  }
}

export const authorizationService = {
  useAuthorizedApp() {
    const [authorizationData, dispatch] = React.useReducer<
      Reducer<AppState, AppAction>
    >(appReducer, {
      permissionPaths: [],
      authorizedMenus: [...menu],
      authorizedAction: [],
      authorizedMenuMapper: null,
    });

    React.useEffect(() => {
      let isCancelled = false;
      if (!isCancelled) {
        dispatch({
          type: AppActionEnum.SET,
          payload: {
            permissionPaths: [],
            authorizedMenus: menu,
            authorizedAction: [],
            authorizedMenuMapper: {},
          },
        });
        const subscription = new Subscription();
        subscription.add(
          forkJoin([]).subscribe({
            next: (results: string[][]) => {
              const response = [...results[0]];
              if (response && response.length > 0) {
                const authorizedMenuMapper: Record<string, number> = {};
                const authorizedAction: string[] = [];
                response.forEach((path: string, index: number) => {
                  if (path.match(ACTION_URL_REGEX)) {
                    authorizedAction.push(path);
                  } else {
                    authorizedMenuMapper[`/${path as string}`] = index;
                  }
                });
                const authorizedMenus: Menu[] = _cloneDeep(menu);
                utilService.mapTreeMenu(authorizedMenus, authorizedMenuMapper);
                dispatch({
                  type: AppActionEnum.SET,
                  payload: {
                    permissionPaths: [...response],
                    authorizedMenus,
                    authorizedAction,
                    authorizedMenuMapper,
                  },
                });
              } else {
                dispatch({
                  type: AppActionEnum.SET,
                  payload: {
                    permissionPaths: [],
                    authorizedMenus: [],
                    authorizedAction: [],
                    authorizedMenuMapper: {},
                  },
                });
              }
            },
            error: () => {
              // eslint-disable-next-line no-console
              console.log("Error when getting listPath");
            },
          })
        );
        return () => {
          isCancelled = true;
          subscription.unsubscribe();
        };
      }
    }, []);

    return {
      authorizationData,
    };
  },

  useAuthorizedAction(module: string, baseAction: string) {
    const appState = useContext<AppState>(AppStateContext);
    const actionContext = React.useMemo(() => {
      return appState &&
        appState.authorizedAction &&
        appState.authorizedAction.length > 0
        ? appState.authorizedAction
        : [];
    }, [appState]);
    const [actionMapper, setActionMapper] = React.useState<
      Record<string, number>
    >({});

    const buildAction = React.useCallback(
      (action: string) => {
        return `${baseAction}/${_kebabCase(action)}`;
      },
      [baseAction]
    );

    const validAction = React.useMemo(() => {
      return (action: string) => {
        if (
          !_isEmpty(actionMapper) &&
          Object.prototype.hasOwnProperty.call(
            actionMapper,
            buildAction(action)
          )
        ) {
          return true;
        }
        return false;
      };
    }, [actionMapper, buildAction]);

    React.useEffect(() => {
      const mapper: Record<string, number> = {};
      const regex = new RegExp(`^(${baseAction})/`, "i");
      actionContext.forEach((item: string, index: number) => {
        if (item.match(regex)) {
          mapper[item] = index;
        }
      });
      setActionMapper(mapper);
    }, [actionContext, module, baseAction]);

    return { validAction };
  },

  useAuthorizedRoute() {
    const appState = useContext<AppState>(AppStateContext);
    const mapper = React.useMemo(() => {
      return appState &&
        appState.authorizedMenuMapper &&
        !_isEmpty(appState.authorizedMenuMapper)
        ? appState.authorizedMenuMapper
        : [];
    }, [appState]);

    const auth = React.useCallback(
      (path: string) => {
        if (!_isEmpty(mapper)) {
          if (
            Object.prototype.hasOwnProperty.call(mapper, "hasAnyPermission")
          ) {
            return true;
          }
          const regexDetail = new RegExp(/detail$/gi);
          if (regexDetail.exec(path)) {
            const queryString = window.location.search;
            const regexQueryId = new RegExp("id\\=\\w+");
            if (regexQueryId.test(queryString)) {
              path = path + "/*";
            }
          }

          const regexDynamic = new RegExp(/(dynamic-template\/:idRoute)$/gi);
          if (regexDynamic.exec(path)) {
            path = window.location.pathname;
          }

          if (!Object.prototype.hasOwnProperty.call(mapper, path)) {
            return false;
          }
        }
        return true;
      },
      [mapper]
    );

    return {
      auth,
    };
  },
};
