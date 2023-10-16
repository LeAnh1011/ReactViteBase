import { ModelFilter } from "react3l-common";
import React, { Reducer, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import { filterReducer } from "./filter-service";
import { utilService } from "../common-services/util-service";
import qs from "qs";
import { FilterAction } from "../service-types";

type classTS<TFilter> = new () => TFilter;
type classContructor<TFilter> = classTS<TFilter> & typeof ModelFilter;

export const queryStringService = {
  /**
   * react hook for control query param url
   * @param: ClassFilter: new () => TFilter
   * @param: defaultFilter?: TFilter
   * @return: [modelFilter, dispatch]
   * */
  useQueryString<TFilter extends ModelFilter>(
    ClassFilter: classContructor<TFilter>,
    defaultFilter?: TFilter,
    exceptFiedFilter?: string[]
  ): [
    TFilter,
    React.Dispatch<FilterAction<TFilter>>,
    number,
    () => TFilter,
    boolean
  ] {
    const history = useHistory();
    const hasQueryString = React.useMemo<boolean>(() => {
      return history.location.search && history.location.search.length
        ? true
        : false;
    }, [history]);
    const firstUpdate = useRef(true);

    const buildFilter = React.useMemo(() => {
      const modelFilter = ClassFilter.create();
      const modelFilterValue = new ClassFilter();
      Object.assign(modelFilter, modelFilterValue);
      const queryFilter: TFilter = qs.parse(
        history.location.search.substring(1)
      );
      if (!utilService.isEmpty(queryFilter)) {
        Object.assign(modelFilter, queryFilter);
      } else {
        if (typeof defaultFilter !== "undefined") {
          Object.assign(modelFilter, defaultFilter);
        }
      }

      return modelFilter as TFilter;
    }, [ClassFilter, history.location.search, defaultFilter]);

    const [modelFilter, dispatch] = React.useReducer<
      Reducer<TFilter, FilterAction<TFilter>>
    >(filterReducer, buildFilter);

    const countFilter: number = React.useMemo<number>(() => {
      return utilService.countValuedField(modelFilter, exceptFiedFilter);
    }, [modelFilter, exceptFiedFilter]);

    const stateRef = useRef(modelFilter);
    stateRef.current = modelFilter;
    const getModelFilter = useCallback(() => stateRef.current, []);

    React.useLayoutEffect(() => {
      if (firstUpdate.current) {
        firstUpdate.current = false;
        return;
      }
      const queryFilter = qs.stringify(JSON.parse(JSON.stringify(modelFilter)));
      history.replace({
        pathname: history.location.pathname,
        search: queryFilter,
      });
    }, [modelFilter, history]);

    return [modelFilter, dispatch, countFilter, getModelFilter, hasQueryString];
  },

  /**
   * react hook get value from query url
   * @param: queryValue: string
   * @return: { queryObject, queryValue }
   * */
  useGetQueryString(queryValue?: string) {
    const history = useHistory();
    const queryObject = React.useMemo(() => {
      return qs.parse(history.location.search.substring(1));
    }, [history.location.search]);

    return {
      queryObject,
      [queryValue]: queryObject[queryValue] ? queryObject[queryValue] : null,
      history,
    };
  },
};
