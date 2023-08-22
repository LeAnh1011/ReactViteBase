import { Document, Help } from "@carbon/icons-react";

function LoginHeader() {
  return (
    <div className="login-header__wrapper  p-y--xs">
      <div className="login-header__logo p-x--sm">Portal</div>
      <div className="login-header__list-icon">
        <div className="login-header__icon login-header__icon-document d-flex align-items-center justify-content-center">
          <Document size={20} color={"#fff"} />
        </div>
        <div className="login-header__icon login-header__icon-question d-flex align-items-center justify-content-center">
          <Help size={20} color={"#fff"} />
        </div>
      </div>
    </div>
  );
}

export default LoginHeader;
