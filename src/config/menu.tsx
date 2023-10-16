import { translate } from "core/config/i18n";
import { DASHBROAD_ROUTE } from "./route-const";
import { Menu } from "./config-type";

export const menu: Menu[] = [
  {
    name: translate("menu.title.dashbroad"),
    link: DASHBROAD_ROUTE,
    show: true,
    active: false,
  },
];
