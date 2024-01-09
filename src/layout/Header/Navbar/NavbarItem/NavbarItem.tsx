import { ChevronDown } from "@carbon/icons-react";
import classNames from "classnames";
import { Menu } from "config/config-type";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

interface NabarItemProps {
  item?: Menu;
  index?: number;
}
const NavbarItem = (props: NabarItemProps) => {
  const { item, index } = props;

  const [translate] = useTranslation();

  const [menuItems, setMenuItems] = React.useState<{ [key: string]: unknown }>(
    {}
  );
  const [expanded, setExpand] = React.useState(false);

  const handleToggleMenu = React.useCallback(
    (menu: Menu) => (event: React.MouseEvent) => {
      event.preventDefault();
      setExpand((expanded) => !expanded);
      const windowCurrentWidth = window.screen.availWidth;
      if (windowCurrentWidth <= 995) {
        setMenuItems({
          ...menuItems,
          [`${translate(`${menu.name}`)}`]:
            menuItems[`${translate(`${menu.name}`)}`] !== undefined
              ? !menuItems[`${translate(`${menu.name}`)}`]
              : true,
        });
      }
    },
    [menuItems, translate]
  );

  const renderMenu = (menu: Menu, key: number, itemType?: string) => {
    return (
      <React.Fragment key={key}>
        {menu.children
          ? menu.show && (
              <>
                <NavLink
                  to={menu.link}
                  className={classNames("navbar-dropdown__toggle", {
                    "navbar-dropdown__item": !itemType,
                  })}
                  onClick={handleToggleMenu(menu)}
                  aria-expanded={expanded}
                >
                  {itemType === "nav" ? (
                    <div className="d-flex align-items-center">
                      <span className="m-r--2xs">{menu.icon}</span>
                      <span>{translate(`${`${menu.name}`}`)}</span>
                    </div>
                  ) : (
                    <>{translate(`${menu.name}`)}</>
                  )}
                  <div className="p-l--xs">
                    <div className="navbar-dropdown__item-icon">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </NavLink>
                <div
                  className={classNames("navbar-dropdown__menu", {
                    "navbar-dropdown__menu-show":
                      menuItems[`${translate(`${menu.name}`)}`] && expanded,
                    show: expanded,
                  })}
                >
                  {menu.children.map((item: Menu, index: number) => (
                    <React.Fragment key={index}>
                      {item.children ? (
                        <div className="nav-dropdown">
                          <>{renderMenu(item, index)}</>
                        </div>
                      ) : (
                        <NavLink
                          to={item.link}
                          className="navbar-dropdown__item"
                        >
                          {translate(`${item.name}`)}
                        </NavLink>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </>
            )
          : menu.show && (
              <NavLink
                className="navbar-dropdown__item m-r--2xs"
                to={menu.link}
              >
                {translate(`${menu.name}`)}
              </NavLink>
            )}
      </React.Fragment>
    );
  };
  return (
    <React.Fragment>
      {item.children ? (
        <li key={index} className="nav-item nav-dropdown">
          {renderMenu(item, index, "nav")}
        </li>
      ) : (
        item.show && (
          <li className="nav-item nav-dropdown" key={index}>
            <NavLink
              to={item.link}
              className="navbar-dropdown__toggle m-r--2xs"
            >
              <div className="d-flex align-items-center">
                {item.icon && <span className="m-r--2xs">{item.icon}</span>}
                <span>{translate(`${item.name}`)}</span>
              </div>
            </NavLink>
          </li>
        )
      )}
    </React.Fragment>
  );
};

export default NavbarItem;
