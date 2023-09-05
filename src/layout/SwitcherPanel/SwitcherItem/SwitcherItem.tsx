import React from "react";
import { SubSystem } from "core/models/SubSystem";

export interface SwitcherItemProps {
  index?: number;
  item?: SubSystem;
}

const SwitcherItem = (props: SwitcherItemProps) => {
  const { item } = props;

  const handleClickSite = React.useCallback(() => {
    window.location.href = `${item?.path}`;
  }, [item]);

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
