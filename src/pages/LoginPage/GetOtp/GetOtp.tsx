import { ArrowLeft, ArrowRight, Loop } from "@carbon/icons-react";
import { Divider } from "antd";
import type { TFunction } from "i18next";
import { Button, FormItem } from "react3l-ui-library";
import InputTextLogin from "../InputTextLogin/InputTextLogin";
import React from "react";
import { authenticationRepository } from "core/repositories/AuthenticationRepository";
import { LOGIN_STATE } from "../LoginHook";
import { AxiosError } from "axios";

export interface GetOtpProps {
  translate?: TFunction;
  setLoginState?: React.Dispatch<React.SetStateAction<LOGIN_STATE>>;
  setOtp?: React.Dispatch<React.SetStateAction<string>>;
  handleBackToLogin?: () => void;
  otp?: string;
  email?: string;
}

export default function GetOtp(props: GetOtpProps) {
  const { translate, setLoginState, otp, email, setOtp, handleBackToLogin } =
    props;
  const [errorMessageOtp, setErrorMessageOtp] = React.useState<string>(null);
  const inputTextRef = React.useRef<HTMLDivElement>();

  const handleChangeOtp = React.useCallback(
    (event: string) => {
      setOtp(event);
      setErrorMessageOtp(null);
    },
    [setOtp]
  );

  const handleSendOtp = React.useCallback(() => {
    const obj = {
      email,
      otpCode: otp,
    };
    authenticationRepository.verifyOtpCode(obj).subscribe({
      next: () => {
        setLoginState(LOGIN_STATE.CHANGE_PASSWORD);
      },
      error: (error: AxiosError) => {
        if (error.response && error.response.status === 400) {
          const { otpCode } = error.response.data
            ? error.response.data.errors
            : undefined;
          if (typeof otpCode !== "undefined") setErrorMessageOtp(otpCode);
        }
      },
    });
  }, [email, otp, setLoginState]);

  React.useEffect(() => {
    const inputRef = inputTextRef?.current as HTMLDivElement;
    const inputElm = inputRef.firstElementChild as HTMLInputElement;
    if (inputElm) {
      inputElm.focus();
    }
  }, []);

  return (
    <div>
      <div className="login-page__content--logo">
        <div>
          <Loop size={32} color={"#fff"} className="login-page--icon" />
        </div>
      </div>

      <h2 className="login-page__content--title forgot-password">
        {translate("login.getOtpPage.title")}
      </h2>

      <div className="login-page__content--under-title m-t--2xs">
        {translate("login.getOtpPage.message")}
      </div>

      <Divider className="login-page__content--divider" />

      <div className="login-page__content--form">
        <div className="login-page__password m-b--sm">
          <FormItem message={errorMessageOtp}>
            <InputTextLogin
              inputType="text"
              label={translate("login.getOtpPage.otp")}
              value={otp}
              onChange={handleChangeOtp}
              placeHolder={translate("login.getOtpPage.placeholder.otp")}
              onEnter={handleSendOtp}
              ref={inputTextRef}
            />
          </FormItem>
        </div>

        <div className="login-page__button-wrapper m-b--sm">
          <Button
            icon={<ArrowRight size={16} />}
            className="login-button btn--lg"
            onClick={handleSendOtp}
          >
            {translate("login.continueButtonLabel")}
          </Button>
        </div>

        <div
          className="login-page__button--go-back"
          onClick={handleBackToLogin}
        >
          <ArrowLeft size={16} />
          <div className="go-back__label">
            {translate("login.turnBackLoginPageButtonLabel")}
          </div>
        </div>
      </div>
    </div>
  );
}
