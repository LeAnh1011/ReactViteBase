import { menu } from "config/menu";
import React, { Fragment } from "react";
import { useHistory } from "react-router-dom";
import "./Sidebar.scss";
import SidebarItem from "./SidebarItem";
import SidebarMenu from "./SidebarMenu";
import { Menu } from "config/config-type";

interface SidebarProps {
  menus?: Menu[];
}

function Sidebar(props: SidebarProps) {
  const { menus } = props;
  const [listActiveMenu, setListActiveMenu] = React.useState<string[]>([]);
  const history = useHistory();

  const handleActiveMenu = React.useCallback((path: string) => {
    setListActiveMenu([path]);
  }, []);

  React.useEffect(() => {
    return history.listen((location) => {
      handleActiveMenu(location.pathname);
    });
  }, [handleActiveMenu, history]);

  React.useEffect(() => {
    handleActiveMenu(window.location.pathname);
  }, [handleActiveMenu]);

  const renderMenu = React.useCallback(
    (listMenu: Menu[], level = 1) => {
      return listMenu.map((item, index) => {
        if (item.children && item.children.length > 0) {
          return (
            <Fragment key={index}>
              {item.show && (
                <SidebarItem
                  item={item}
                  level={level}
                  listActiveMenu={listActiveMenu}
                />
              )}
            </Fragment>
          );
        }
        return (
          <Fragment key={index}>
            {item.show && (
              <SidebarMenu
                item={item}
                listActiveMenu={listActiveMenu}
                level={level}
              />
            )}
          </Fragment>
        );
      });
    },
    [listActiveMenu]
  );

  return (
    <div className="sidebar__wrapper">
      <div className="sidebar__title">
        <div className="sidebar__avatar">M</div>
        <div className="sidebar__avatar-des">
          <div
            className="sidebar__avatar-des-st"
            style={{ fontSize: "14px", fontWeight: "bold", color: "#161616" }}
          >
            Side Menu Level 1
          </div>
          <div style={{ fontSize: "10px", color: "#6F6F6F" }}>
            Side Menu Level 1
          </div>
        </div>
      </div>
      <nav className="sidebar__container">
        <ul className="sidebar__items">
          {renderMenu(menus && menus.length > 0 ? menus : menu)}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
