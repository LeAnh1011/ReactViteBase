import { CheckmarkOutline } from "@carbon/icons-react";
import { Divider } from "antd";
import type { TFunction } from "i18next";

export interface SuccessResultViewProps {
  translate: TFunction;
}

function SuccessResultView({ translate }: SuccessResultViewProps) {
  return (
    <div>
      <div className="login-page__content--logo m-b--sm">
        <div>
          <CheckmarkOutline
            size={16}
            color={"#fff"}
            className="login-page--icon"
          />
        </div>
      </div>

      <h2 className="login-page__content--title forgot-password">
        {translate("login.success.title")}
      </h2>

      <div className="login-page__content--under-title m-t--2xs">
        {translate("login.success.message")}
      </div>

      <Divider className="login-page__content--divider" />
    </div>
  );
}

export default SuccessResultView;
