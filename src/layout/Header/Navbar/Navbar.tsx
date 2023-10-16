import { OverflowMenuVertical } from "@carbon/icons-react";
import { AppStateContext } from "app/AppContext";
import React, { FC, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Collapse } from "reactstrap";
import "./Navbar.scss";
import NavbarItem from "./NavbarItem/NavbarItem";
import { Menu } from "config/config-type";
import { AppState } from "core/services/service-types";

interface NabarProps {
  isOpen?: boolean;
}

const isDescendant = (parent: HTMLElement, child: HTMLElement) => {
  let node = child.parentNode;
  while (node != null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

const Navbar: FC<NabarProps> = (props: NabarProps) => {
  const { isOpen } = props;
  const appState = useContext<AppState>(AppStateContext);
  const [menuDropdown, setMenuDropdown] = React.useState([]);
  const [activeCurrent, setActiveCurrent] = React.useState<HTMLElement>();
  const history = useHistory();

  const menu = React.useMemo(() => {
    return appState &&
      appState.authorizedMenus &&
      appState.authorizedMenus.length > 0
      ? appState.authorizedMenus
      : [];
  }, [appState]);

  const activateParentDropdown = React.useCallback(
    (item: HTMLElement, rootNode: HTMLElement) => {
      item.classList.add("active");
      const parent = item.parentElement;
      if (parent && isDescendant(rootNode, parent)) {
        activateParentDropdown(parent, rootNode);
      } else return false;
    },
    []
  );

  const unActivateParentDropdown = React.useCallback(
    (item: HTMLElement, rootNode: HTMLElement) => {
      item.classList.remove("active");
      const parent = item.parentElement;
      if (parent && isDescendant(rootNode, parent)) {
        unActivateParentDropdown(parent, rootNode);
      } else return false;
    },
    []
  );

  const handleActiveMenu = React.useCallback(
    (path: string) => {
      let matchingMenuItem = null;
      const ul = document.getElementById("navigation") as HTMLElement;
      const items = ul.getElementsByTagName("a");
      for (let i = 0; i < items.length; ++i) {
        const regex = new RegExp("^" + items[i].pathname);
        if (regex.test(path)) {
          matchingMenuItem = items[i];
          break;
        }
      }
      if (activeCurrent) {
        unActivateParentDropdown(activeCurrent, ul);
      }
      if (matchingMenuItem) {
        setActiveCurrent(matchingMenuItem);
        activateParentDropdown(matchingMenuItem, ul);
      }
    },
    [activateParentDropdown, activeCurrent, unActivateParentDropdown]
  );

  useEffect(() => {
    return history.listen((location) => {
      handleActiveMenu(location.pathname);
    });
  }, [handleActiveMenu, history]);

  useEffect(() => {
    if (menu && menu.length) {
      handleActiveMenu(window.location.pathname);
    }
  }, [handleActiveMenu, menu]);

  React.useEffect(() => {
    if (window.screen.width < 1920) {
      const items = document.getElementsByClassName("nav-item");
      let sum = 0;
      let index = 0;
      setTimeout(() => {
        for (let i = 0; i < items.length; i++) {
          const element = items[i];
          sum += element?.clientWidth;
          if (sum > 720) {
            const maxContainer = sum - items[i]?.clientWidth;
            document.getElementById(
              "navigation"
            ).style.maxWidth = `${maxContainer}px`;
            index = i;
            break;
          }
        }
        const menuDropDown = index > 0 ? menu.slice(index, menu?.length) : [];
        setMenuDropdown(menuDropDown);
      }, 500);
    } else {
      const items = document.getElementsByClassName("nav-item");
      let sum = 0;
      let index = 0;
      setTimeout(() => {
        for (let i = 0; i < items.length; i++) {
          const element = items[i];
          sum += element?.clientWidth;
          if (sum > 1080) {
            const maxContainer = sum - items[i]?.clientWidth;
            document.getElementById(
              "navigation"
            ).style.maxWidth = `${maxContainer}px`;
            index = i;
            break;
          }
        }
        const menuDropDown = index > 0 ? menu.slice(index, menu?.length) : [];
        setMenuDropdown(menuDropDown);
      }, 500);
    }
  }, [menu]);

  return (
    <React.Fragment>
      <div className={`navbar-wrapper d-flex align-items-center`}>
        <nav className="navbar-container" id="navigation">
          <Collapse
            isOpen={isOpen}
            className="navbar-collapse"
            id="topnav-menu-content"
          >
            <ul className="navbar-nav">
              {menu.map((item: Menu, index: number) => (
                <React.Fragment key={index}>
                  <NavbarItem index={index} item={item} />
                </React.Fragment>
              ))}
            </ul>
          </Collapse>
        </nav>
        <div>
          {menuDropdown && menuDropdown?.length > 0 && (
            <div className="navbar__dropdown-more">
              <div className="navbar__dropdown-button">
                <OverflowMenuVertical size={20} />
              </div>
              <ul className="navbar-nav__dropdown">
                {menuDropdown &&
                  menuDropdown?.length > 0 &&
                  menuDropdown.map((item: Menu, index: number) => (
                    <React.Fragment key={index}>
                      <NavbarItem item={item} index={index} />
                    </React.Fragment>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Navbar;
