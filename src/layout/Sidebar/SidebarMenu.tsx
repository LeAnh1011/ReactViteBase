import { NavLink } from "react-router-dom";
import "./Sidebar.scss";
import { Menu } from "config/config-type";

interface SidebarMenuProps {
  item?: Menu;
  className?: string;
  style?: React.CSSProperties;
  level?: number;
  listActiveMenu?: string[];
}

function SidebarMenu(props: SidebarMenuProps) {
  const { item, level, listActiveMenu } = props;

  return (
    <div
      role="button"
      tabIndex={0}
      className="sidebar__item"
      style={{ paddingLeft: (level - 1) * 16 }}
    >
      <NavLink
        exact
        to={item?.link}
        className="sidebar__item-link"
        style={props?.style}
        activeClassName={
          listActiveMenu?.length > 0 && item.link.includes(listActiveMenu[0])
            ? "active"
            : ""
        }
      >
        <span>{item?.name as string}</span>
      </NavLink>
    </div>
  );
}

export default SidebarMenu;
