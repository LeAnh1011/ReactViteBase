import {
  Close,
  Menu,
  Notification,
  Settings,
  Switcher,
  UserAvatar,
} from "@carbon/icons-react";
import { Dropdown } from "antd";
import classNames from "classnames";
import React, { FC, ReactNode } from "react";
import { Link } from "react-router-dom";
import SwitcherPanel from "../SwitcherPanel/SwitcherPanel";
import "./Header.scss";
// import InputSearchHeader from "./InputSearchHeader/InputSearchHeader";
import Navbar from "./Navbar/Navbar";
import NotificationDropdown from "./Notification/NotificationDropdown";
import Profile from "./Profile/Profile";
import { useAppSelector } from "rtk/hook";
import ChangePasswordDrawer from "./Profile/ChangePasswordDrawer/ChangePasswordDrawer";
import { PORTAL_APP_CATALOG_ROUTE } from "config/route-const";

interface HeaderProps {
  isShowNav?: boolean;
  logo?: ReactNode;
  logoName?: string;
  linkLogo?: string;
}

const Header: FC<HeaderProps> = (props: HeaderProps) => {
  const {
    isShowNav = true,
    logo,
    logoName,
    linkLogo = PORTAL_APP_CATALOG_ROUTE,
  } = props;
  const profile = useAppSelector((state) => state.profile);
  const [toggleNavbar, setToggleNavbar] = React.useState(true);
  const [show, setShow] = React.useState<boolean>(false);
  const [active, setActive] = React.useState<boolean>(false);
  const [activeProfile, setActiveProfile] = React.useState<boolean>(false);
  const [visibleDrawer, setVisibleDrawer] = React.useState<boolean>(false);

  const handleClickFocusNoti = React.useCallback(() => {
    setActive(!active);
    if (activeProfile) setActiveProfile(false);
  }, [active, activeProfile]);

  const handleClickFocusProfile = React.useCallback(() => {
    setActiveProfile(!activeProfile);
    if (active) setActive(false);
  }, [active, activeProfile]);

  const handleShowRightBar = React.useCallback(() => {
    setShow(true);
    if (activeProfile) setActiveProfile(false);
    if (active) setActive(false);
  }, [active, activeProfile]);

  const handleCloseRightBar = React.useCallback(() => {
    setShow(false);
  }, []);

  return (
    <>
      <header className="header-wrapper">
        <div className="header-box">
          <div className="header-box__logo">
            <button
              className="header-box__btn header-box__btn-toggle"
              data-toggle="collapse"
              data-target="#topnav-menu-content"
              onClick={() => setToggleNavbar(!toggleNavbar)}
            >
              <Menu size={20} />
            </button>
            <div className="header-logo">
              <Link to={linkLogo} className="header-logo__link">
                <span className="header-logo__icon">{logo}</span>
                <span className="header-logo__title">{logoName}</span>
              </Link>
            </div>
          </div>
          <div className="header-navbar d-flex align-items-center">
            {isShowNav && <Navbar isOpen={toggleNavbar} />}
          </div>
        </div>

        <div className="header-action">
          {/* <InputSearchHeader /> */}
          <button className="header-box__btn">
            <Settings size={20} />
          </button>

          <Dropdown
            dropdownRender={() => (
              <NotificationDropdown setActive={setActive} />
            )}
            trigger={["click"]}
            placement="bottom"
            open={active}
          >
            <button
              className={classNames("switcher-box__btn", {
                "header-box__btn-noti": active,
                "": !active,
              })}
              onClick={handleClickFocusNoti}
            >
              <Notification size={20} />
            </button>
          </Dropdown>

          <Dropdown
            dropdownRender={() => (
              <Profile
                profile={profile}
                setActiveProfile={setActiveProfile}
                setVisibleDrawer={setVisibleDrawer}
              />
            )}
            trigger={["click"]}
            placement="bottom"
            open={activeProfile}
          >
            <button
              className={classNames("switcher-box__btn", {
                "header-box__btn-profile": activeProfile,
                "": !activeProfile,
              })}
              onClick={handleClickFocusProfile}
            >
              <UserAvatar size={20} />
            </button>
          </Dropdown>

          <Dropdown
            dropdownRender={() => (
              <SwitcherPanel handleCloseRightBar={handleCloseRightBar} />
            )}
            trigger={["click"]}
            placement="bottom"
            open={show}
          >
            {!show ? (
              <button
                className="switcher-box__btn"
                onClick={handleShowRightBar}
              >
                <Switcher size={20} />
              </button>
            ) : (
              <button
                className="switcher-box__btn switcher-box__btn-close"
                onClick={handleCloseRightBar}
              >
                <Close size={20} />
              </button>
            )}
          </Dropdown>
        </div>
      </header>
      <ChangePasswordDrawer
        profile={profile}
        visible={visibleDrawer}
        setVisible={setVisibleDrawer}
      />
    </>
  );
};

export default Header;
