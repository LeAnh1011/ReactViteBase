import { Menu } from "config/config-type";
import { Model } from "react3l-common";
import * as yup from "yup";
import { ColumnGroupType, ColumnType } from "antd/lib/table/interface";
import type { DataNode } from "antd/lib/tree";

// Authorization serivce types:
export enum AppActionEnum {
  SET,
  UPDATE,
}

export interface AppState {
  permissionPaths?: string[];
  authorizedAction?: string[];
  authorizedMenus?: Menu[];
  authorizedMenuMapper?: Record<string, unknown>;
}

export interface AppAction {
  type: AppActionEnum;
  payload?: AppState;
}

// Validate service types:
export type ValidResult = {
  isValid: boolean;
  errorMessage: string;
};
export type ValidationError = { [x: string]: unknown };

export type ValidationField = {
  isValidator: boolean;
  path?: string;
  schema?: yup.ObjectSchema<Model>;
};

// Detail service types:
export enum ModelActionEnum {
  SET,
  UPDATE,
  SET_ERRORS,
  UPDATE_ERRORS,
}

export interface ModelAction<T extends Model> {
  type: ModelActionEnum;
  payload: T | ValidationError;
}

// Field service types:
export interface ConfigField {
  fieldName: string | [string, string];
  sideEffectFunc?: () => void;
  validator?: ValidationField;
}

// Reducer service types:
export class GeneralActionEnum {
  public static SET = "SET";
  public static UPDATE = "UPDATE";
  public static SET_ERRORS = "SET_ERRORS";
  public static UPDATE_ERRORS = "UPDATE_ERRORS";
}

export interface GeneralAction<T extends Model> {
  type: GeneralActionEnum;
  payload?: T;
  errors?: ValidationError;
}

// Table service type:
export declare type ToogleColumsType<T = unknown> = ((
  | ColumnGroupType<T>
  | ColumnType<T>
) & { isShow?: boolean })[];

// Utility service types:
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObj = { [key: string]: any };

export class TreeNode<T extends Model> implements DataNode {
  public title: string;
  public key: number;
  public item: Model;
  public children: TreeNode<T>[];
  public disabled: boolean;

  constructor(model?: T) {
    if (model) {
      this.key = model.id;
      this.item = { ...model };
      this.children = [];
      this.title = model.name;
      this.disabled = model.disabled;
    } else {
      this.title = "";
      this.key = null;
      this.children = [];
      this.item = {};
      this.disabled = false;
    }
  }
}

export enum ValidateStatus {
  success = "success",
  warning = "warning",
  error = "error",
  validating = "validating",
}

// Filter service types:
export enum FilterActionEnum {
  SET,
  UPDATE,
  UPDATE_PAGINATION,
}

export interface FilterAction<TFilter> {
  type: FilterActionEnum;
  payload?: TFilter;
}

// List service types:
export enum ListActionType {
  SET = "SET",
}

export type KeyType = string | number;

export interface ListState<T extends Model> {
  list: T[];
  count: number;
}

export interface ListAction<T extends Model> {
  type: string;
  payload?: ListState<T>;
}
