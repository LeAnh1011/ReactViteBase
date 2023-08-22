import { Email, EmailNew, Launch } from "@carbon/icons-react";
import { Switch } from "antd";
import classNames from "classnames";
import { formatDateTimeFromNow } from "core/helpers/date-time";
import "moment/min/locales";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { utilService } from "core/services/common-services/util-service";
import { data } from "./Data";
import "./NotificationDropdown.scss";
import moment from "moment";

interface NotificationDropdownProps {
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationDropdown = (props: NotificationDropdownProps) => {
  const [translate] = useTranslation();
  const ref = useRef();
  const { setActive } = props;
  const handleChangeActiveProfile = React.useCallback(() => {
    setActive(false);
  }, [setActive]);

  utilService.useClickOutside(ref, handleChangeActiveProfile);

  return (
    <div className="notification-container" ref={ref}>
      <div className="notification-menu-wrapper">
        <div className="notification-menu__header">
          <div className="notification-menu__header-title">
            {translate("general.notification.title")}
          </div>
          <div>
            <span className="m-r--2xs">
              {translate("general.notification.unread")}
            </span>
            <Switch className="notification-menu__switch" size="small" />
          </div>
        </div>
        <div className="notification-content">
          <div className="notification-list__wrapper">
            {data && data?.length > 0 ? (
              data?.map((notification, index: number) => (
                <div key={index}>
                  <div
                    className={classNames("notification-item", {
                      "notification-item__unread": notification.unread === true,
                    })}
                  >
                    <div className="notification-item__info">
                      <div className="notification-item__title">
                        <span className="notification-item__title-web">
                          {notification?.titleWeb}{" "}
                        </span>

                        <span className="notification-item__time">
                          {formatDateTimeFromNow(
                            moment(notification?.time),
                            "vi"
                          )}
                        </span>
                      </div>

                      <div className="notification-item__content">
                        {notification?.contentWeb}
                      </div>
                      <div className="notification-item__site">Tên phân hệ</div>
                    </div>

                    {!(notification.unread === true) && (
                      <div className="notification-item__icon">
                        <EmailNew size={16} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: "inherit" }}
                >
                  {translate("general.notification.noData")}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="notification-menu__footer d-flex align-items-center justify-content-between">
          <div className="notification-menu__footer-view d-flex">
            {translate("general.notification.viewAll")}
            <Launch size={16} className="m-l--3xs" />
          </div>

          <div className="notification-menu__footer-icon d-flex">
            <Email size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
