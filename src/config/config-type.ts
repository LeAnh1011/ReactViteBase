import type { TFunction } from "i18next";
import { ReactNode } from "react";

export interface Menu {
  name?: string | TFunction;
  icon?: string | ReactNode;
  link: string;
  children?: Menu[];
  active?: boolean;
  show?: boolean;
  code?: string;
  id?: number;
}

export interface Route {
  path: string;
  component:
    | ((props?: unknown) => JSX.Element)
    | React.LazyExoticComponent<(props?: unknown) => JSX.Element>;
  exact?: boolean;
}
