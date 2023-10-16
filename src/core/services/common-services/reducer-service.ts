import { Model } from "react3l-common";
import { produce } from "immer";
import React from "react";
import { utilService } from "./util-service";
import {
  GeneralAction,
  GeneralActionEnum,
  ValidationError,
} from "../service-types";

export function generalReducer(
  state: Model,
  action: GeneralAction<Model>
): Model {
  switch (action.type) {
    case GeneralActionEnum.SET:
      Object.keys(state).forEach((key) => {
        state[key] = undefined;
      });
      Object.assign(state, action.payload);
      return state;
    case GeneralActionEnum.UPDATE:
      Object.assign(state, action.payload);
      return state;
    case GeneralActionEnum.SET_ERRORS: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors: any = {};
      const errorArrays: ValidationError = {};
      if (!utilService.isEmpty(action.errors)) {
        Object.keys(action.errors).forEach((key: string) => {
          if (action.errors[key] && typeof action.errors[key] === "string") {
            errors[key] = action.errors[key];
          } else {
            errorArrays[key] = action.errors[key];
          }
        });
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
      state.errors = errors;
      return state;
    }
    case GeneralActionEnum.UPDATE_ERRORS:
      if (action.errors && !utilService.isEmpty(action.errors)) {
        state.errors = {
          ...state["errors"],
          ...(action.errors as Model.Errors<Model>),
        };
      }
      return state;
    default:
      return state;
  }
}

export const combineReducers = <State, Action>(
  slices: ((state: State, action: Action) => State)[]
) =>
  produce((state: State, action: Action) => {
    slices.reduce(
      (newState: State, reducer: (state: State, action: Action) => State) =>
        reducer(newState, action),
      state
    );
  });

export const combineStateReducers = <State, Action>(slices: {
  [key: string]: (state: State, action: Action) => void;
}) =>
  produce((state: State & Model, action: Action) => {
    Object.keys(slices).reduce((acc: State & Model, prop: string) => {
      slices[prop](acc[prop], action);
      return acc;
    }, state);
  });

export const useReducerWithMiddleware = <TState, TAction>(
  reducer: (state: TState, action: TAction) => TState,
  initialState: TState,
  middlewareFns: { (...params: unknown[]): void | unknown }[] = [],
  afterwareFns: { (...params: unknown[]): void | unknown }[] = []
) => {
  const [stateValue, dispatch] = React.useReducer(reducer, initialState);

  const aRef = React.useRef<unknown>();

  const dispatchWithMiddleware = React.useCallback(
    (action: TAction) => {
      middlewareFns.length > 0 &&
        middlewareFns.forEach((middlewareFn: (action: TAction) => void) =>
          middlewareFn(action)
        );
      aRef.current = action;
      dispatch(action);
    },
    [middlewareFns]
  );

  React.useEffect(() => {
    if (!aRef.current) return;

    afterwareFns.length > 0 &&
      afterwareFns.forEach(
        (afterwareFn: (unknown: unknown, value: TState) => void) =>
          afterwareFn(aRef.current, stateValue)
      );

    aRef.current = undefined;
  }, [afterwareFns, stateValue]);

  return { stateValue, dispatchWithMiddleware };
};
