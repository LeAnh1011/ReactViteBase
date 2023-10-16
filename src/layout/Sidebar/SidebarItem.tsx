import { ChevronUp } from "@carbon/icons-react";
import { Menu } from "config/config-type";
import React, { Fragment } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarItemProps {
  item?: Menu;
  listActiveMenu?: string[];
  level?: number;
}

const SidebarItem = (props: SidebarItemProps) => {
  const { item, listActiveMenu } = props;

  const location = useLocation();

  const [expanded, setExpand] = React.useState(
    location.pathname.includes(item?.link)
  );

  const handleExpand = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setExpand((expanded) => !expanded);
  }, []);

  return (
    <div className="sidebar__item">
      <div
        className="sidebar__sub-item"
        onClick={handleExpand}
        style={{ paddingLeft: props.level * 16 }}
        aria-expanded={expanded}
      >
        <span className="sidebar-item__parent-title">
          {item?.name as string}
        </span>
        <div className="sidebar__item-icon">
          <ChevronUp size={16} />
        </div>
      </div>
      {expanded && (
        <div className="sidebar__menu">
          {item?.children.map((menu: Menu, index: number) => {
            const key = `${item.name}-${index}`;

            if (menu?.children) {
              return (
                <Fragment key={key}>
                  <SidebarItem
                    item={{
                      ...menu,
                    }}
                    level={props.level + 1}
                  />
                </Fragment>
              );
            }

            return (
              <Fragment key={index}>
                {item.show && (
                  <div className={"sidebar__item"}>
                    <NavLink
                      exact
                      to={menu.link}
                      className="sidebar__item-link"
                      style={{ paddingLeft: (props.level + 1) * 16 }}
                      activeClassName={
                        listActiveMenu?.length > 0 &&
                        menu.link.includes(listActiveMenu[0])
                          ? "active"
                          : ""
                      }
                    >
                      <span>{menu?.name as string}</span>
                    </NavLink>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
