import React from "react";
import { useHistory } from "react-router-dom";
import { PORTAL_LANDING_PAGE_ROUTE } from "config/route-const";
import { SubSystem } from "core/models/SubSystem";

export interface SwitcherItemProps {
  index?: number;
  item?: SubSystem;
}

const SwitcherItem = (props: SwitcherItemProps) => {
  const { item } = props;
  const history = useHistory();

  const handleClickSite = React.useCallback(() => {
    if (item?.path === "/portal/") {
      history.push(PORTAL_LANDING_PAGE_ROUTE);
    } else {
      window.location.href = `${item?.path}`;
    }
  }, [item, history]);

  return (
    <div
      className="switcher-item__site  d-flex align-items-center"
      onClick={handleClickSite}
    >
      <div className="switcher-item__site-detail">
        <div className="switcher-item__icon m-r--2xs">
          <img src={item?.lightLogo} alt="" />
        </div>
        <span>{item?.name}</span>
      </div>
    </div>
  );
};

export default SwitcherItem;
