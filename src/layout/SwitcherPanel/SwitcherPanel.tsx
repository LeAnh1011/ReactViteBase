import { Launch } from "@carbon/icons-react";
import classNames from "classnames";
import React, { useRef } from "react";
import { utilService } from "core/services/common-services/util-service";
import "./SwitcherPanel.scss";
import { useTranslation } from "react-i18next";
import { SubSystem } from "core/models/SubSystem";
import SwitcherItem from "./SwitcherItem/SwitcherItem";
import { useAppSelector } from "rtk/hook";
import { Profile } from "core/models/Profile";
import { Link } from "react-router-dom";
import { PORTAL_APP_CATALOG_ROUTE } from "config/route-const";

interface SwitcherPanelProps {
  handleCloseRightBar?: () => void;
}

const SwitcherPanel = (props: SwitcherPanelProps) => {
  const { handleCloseRightBar } = props;
  const profile = useAppSelector<Profile>((state) => state.profile);
  const [translate] = useTranslation();
  const ref = useRef();
  const renderItem = React.useCallback(
    (siteTypeId?: number) => {
      return (
        <React.Fragment>
          {profile &&
            profile.subSytems?.length > 0 &&
            profile?.subSytems
              ?.filter(
                (subSytem: SubSystem) =>
                  subSytem?.subSystemTypeId === siteTypeId
              )
              .map((subSytem: SubSystem) => (
                <SwitcherItem item={subSytem} key={subSytem.id} />
              ))}
        </React.Fragment>
      );
    },
    [profile]
  );

  const siteType = React.useCallback(
    (siteTypeId: number) => {
      return profile.subSytems?.filter(
        (subSytem: SubSystem) => subSytem?.subSystemTypeId === siteTypeId
      );
    },
    [profile.subSytems]
  );

  utilService.useClickOutside(ref, handleCloseRightBar);

  return (
    <div className="switcher-container" ref={ref}>
      <div className={classNames(`switcher-wrapper`)}>
        <div className="switcher-divider" />
        <div className="switcher-content">
          <div className="switcher-list">
            {siteType(1)?.length > 0 && (
              <div className="switcher-item m-t--sm">
                <div className="switcher-item__header">
                  {translate("appCatalog.siteCard.sale")}
                </div>
                <div className="switcher-divider__header" />
                {renderItem(1)}
              </div>
            )}
            {siteType(2)?.length > 0 && (
              <div className="switcher-item m-t--sm">
                <div className="switcher-item__header  d-flex align-items-center ">
                  {translate("appCatalog.siteCard.operation")}
                </div>
                <div className="switcher-divider__header" />
                {renderItem(2)}
              </div>
            )}
            {siteType(3)?.length > 0 && (
              <div className="switcher-item m-t--sm">
                <div className="switcher-item__header">
                  {translate("appCatalog.siteCard.setting")}
                </div>
                <div className="switcher-divider__header" />
                {renderItem(3)}
              </div>
            )}
          </div>
          <Link to={PORTAL_APP_CATALOG_ROUTE}>
            <div className="switcher-footer d-flex align-items-center p--sm">
              {" "}
              Tất cả
              <Launch size={16} className="m-l--3xs" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SwitcherPanel;
