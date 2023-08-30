import { Checkmark, Logout } from "@carbon/icons-react";
import { Switch } from "antd";
import avatar from "assets/images/avatar.jpg";
import { LOGIN_ROUTE } from "core/config/consts";
import { utilService } from "core/services/common-services/util-service";
import { Profile as ProfileModel } from "core/models/Profile";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { authenticationRepository } from "core/repositories/AuthenticationRepository";
import { profileRepository } from "core/repositories/ProfileRepository";
import { useAppDispatch } from "rtk/hook";
import { updateAll } from "rtk/profile/slice";
import "./Profile.scss";
import { ADMIN_TYPE } from "core/models/AdminType";
import { PORTAL_APP_USER_ROUTE } from "config/route-const";

interface ProfileProps {
  setActiveProfile?: React.Dispatch<React.SetStateAction<boolean>>;
  setVisibleDrawer?: React.Dispatch<React.SetStateAction<boolean>>;
  profile?: ProfileModel;
}

const Profile = (props: ProfileProps) => {
  const { profile, setActiveProfile, setVisibleDrawer } = props;
  const [translate] = useTranslation();
  const ref = useRef<HTMLDivElement>();
  const dispatch = useAppDispatch();
  const isShowProfile = React.useMemo(() => {
    const adminType = profile.adminType;
    if (adminType) {
      return (
        adminType.code === ADMIN_TYPE.GLOBAL_ADMIN ||
        adminType.code === ADMIN_TYPE.ORGANIZATION_ADMIN
      );
    }
    return false;
  }, [profile]);

  const handleGoDetail = React.useCallback(() => {
    window.location.href = `${PORTAL_APP_USER_ROUTE}/app-user-detail/view?appUserId=${profile.userId}`;
  }, [profile]);

  const handleShowDrawer = React.useCallback(() => {
    setActiveProfile(false);
    setVisibleDrawer(true);
  }, [setActiveProfile, setVisibleDrawer]);

  const handleLogout = React.useCallback(() => {
    authenticationRepository.logout().subscribe({
      next: () => {
        localStorage.removeItem("profile");
        window.location.href = LOGIN_ROUTE;
      },
    });
  }, []);

  const handleReceivingSystemEmail = React.useCallback(
    (checked: boolean) => {
      const profileValue = { ...profile };
      profileValue.receivingSystemEmail = checked;
      profileRepository.switchEmail(profileValue).subscribe({
        next: (res: ProfileModel) => {
          if (res) {
            dispatch(updateAll(res));
          }
        },
      });
    },
    [profile, dispatch]
  );

  const handleReceivingSystemNotification = React.useCallback(
    (checked: boolean) => {
      const profileValue = { ...profile };
      profileValue.receivingSystemNotification = checked;
      profileRepository.switchNotification(profileValue).subscribe({
        next: (res: ProfileModel) => {
          if (res) {
            dispatch(updateAll(res));
          }
        },
      });
    },
    [dispatch, profile]
  );

  const handleChangeActiveProfile = React.useCallback(() => {
    setActiveProfile(false);
  }, [setActiveProfile]);

  utilService.useClickOutside(ref, handleChangeActiveProfile);

  return (
    <>
      <div className="header-user__menu" ref={ref}>
        <div className="header-user__menu-item header-user__item-first d-flex justify-content-start align-items-center">
          <div className="header-user__menu-avatar p-l--sm">
            <img src={avatar} alt="" />
          </div>
          <div className="header-user__menu-title">
            <span>{utilService.limitWord(profile?.displayName, 30)}</span>
            <span className="header-user__username">
              {utilService.limitWord(profile?.username, 30)}
            </span>
          </div>
        </div>
        <div className="header-user__menu-actions">
          {isShowProfile && (
            <div className="header-user__menu-item" onClick={handleGoDetail}>
              {translate("profile.action.goToDetail")}
            </div>
          )}
          <div className="header-user__menu-item" onClick={handleShowDrawer}>
            {translate("profile.action.changePassword")}
          </div>
          <div className="header-user__menu-item">
            <div className="menu-item__child">
              <span>{translate("profile.action.receivingSystemEmail")}</span>
              <Switch
                onChange={handleReceivingSystemEmail}
                checked={profile?.receivingSystemEmail}
                checkedChildren={<Checkmark size={16} color="#24A148" />}
              />
            </div>
          </div>
          <div className="header-user__menu-item">
            <div className="menu-item__child">
              <span>
                {translate("profile.action.receivingSystemNotification")}
              </span>
              <Switch
                onChange={handleReceivingSystemNotification}
                checked={profile?.receivingSystemNotification}
                checkedChildren={<Checkmark size={16} color="#24A148" />}
              />
            </div>
          </div>
          <div className="header-user__menu-item">
            <div className="menu-item__child">
              <span></span>
            </div>
          </div>
        </div>
        <div
          className="header-user__menu-item header-user__item-end d-flex justify-content-between align-items-center"
          onClick={handleLogout}
        >
          <div>{translate("profile.action.logout")}</div>
          <div>
            <Logout size={20} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
