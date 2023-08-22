import { translate } from "core/config/i18n";
import type { TFunction } from "i18next";
import { ReactNode } from "react";
import {
  DASHBROAD_ROUTE
} from "./route-const";

export interface Menu {
  name?: string | TFunction;
  icon?: string | ReactNode;
  link: string;
  children?: Menu[];
  active?: boolean;
  show?: boolean;
}

export const menu: Menu[] = [
  {
    name: translate("menu.title.dashbroad"),
    link: DASHBROAD_ROUTE,
    show: true,
    active: false,
  }
];
