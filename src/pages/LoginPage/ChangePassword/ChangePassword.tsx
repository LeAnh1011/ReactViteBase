import { Divider } from "antd";
import { Button, FormItem } from "react3l-ui-library";
import { ArrowLeft, Loop, Unlocked, View, ViewOff } from "@carbon/icons-react";
import InputTextLogin from "../InputTextLogin/InputTextLogin";
import type { TFunction } from "i18next";
import React from "react";
import { authenticationRepository } from "core/repositories/AuthenticationRepository";
import { LOGIN_STATE } from "../LoginHook";
import { AxiosError } from "axios";

export interface ChangePasswordProps {
  setLoginState?: React.Dispatch<React.SetStateAction<LOGIN_STATE>>;
  translate?: TFunction;
  handleBackToLogin?: () => void;
  email?: string;
  otp?: string;
}
export default function ChangePassword(props: ChangePasswordProps) {
  const { translate, setLoginState, handleBackToLogin, email, otp } = props;
  const passwordRef = React.useRef<HTMLDivElement>();
  const [newPass, setNewPass] = React.useState<string>(null);
  const [confirmPass, setConfirmPass] = React.useState<string>(null);
  const [errorMessageChangePass, setErrorMessageChangePass] =
    React.useState<string>(null);
  const [checkPass, setCheckPass] = React.useState<boolean>(true);
  const [showPassword, seShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, seShowConfirmPassword] =
    React.useState<boolean>(false);

  const handleChangeNewPass = React.useCallback((event: string) => {
    setNewPass(event);
    setErrorMessageChangePass(null);
  }, []);

  const handleChangeConfirmPassword = React.useCallback(
    (event: string) => {
      const confirmPass = event;
      setConfirmPass(event);
      setCheckPass(confirmPass === newPass);
    },
    [newPass]
  );

  const handleChangePass = React.useCallback(() => {
    const obj = {
      email,
      otpCode: otp,
      password: confirmPass,
    };

    authenticationRepository
      .recoveryPassword(obj)
      .pipe()
      .subscribe({
        next: () => {
          setLoginState(LOGIN_STATE.SUCCESSFUL);
          setTimeout(() => {
            setLoginState(LOGIN_STATE.LOGIN);
          }, 1000);
        },
        error: (error: AxiosError) => {
          if (error.response && error.response.status === 400) {
            setErrorMessageChangePass(error.response.data?.errors?.password);
          }
        },
      });
  }, [confirmPass, email, otp, setLoginState]);

  React.useEffect(() => {
    const inputRef = passwordRef?.current as HTMLDivElement;
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
        {translate("login.changePasswordPage.title")}
      </h2>

      <div className="login-page__content--under-title m-t--2xs">
        {translate("login.changePasswordPage.message")}
      </div>

      <Divider className="login-page__content--divider" />

      <div className="login-page__content--form">
        <div className="login-page__password m-b--sm">
          <FormItem message={errorMessageChangePass}>
            <InputTextLogin
              inputType={showPassword ? "text" : "password"}
              label={translate("login.changePasswordPage.newPassword")}
              value={newPass}
              onChange={handleChangeNewPass}
              placeHolder={translate(
                "login.changePasswordPage.placeholder.newPassword"
              )}
              ref={passwordRef}
              suffix={
                showPassword ? (
                  <ViewOff
                    size={16}
                    onClick={(event) => {
                      seShowPassword(false);
                      event.stopPropagation();
                    }}
                  />
                ) : (
                  <View
                    size={16}
                    onClick={(event) => {
                      seShowPassword(true);
                      event.stopPropagation();
                    }}
                  />
                )
              }
            />
          </FormItem>
        </div>

        <div className="login-page__password m-b--sm">
          <FormItem
            message={
              !checkPass
                ? translate("login.changePasswordPage.passwordNotMatch")
                : null
            }
          >
            <InputTextLogin
              inputType={showConfirmPassword ? "text" : "password"}
              label={translate("login.changePasswordPage.passwordConfirmation")}
              value={confirmPass}
              onChange={handleChangeConfirmPassword}
              placeHolder={translate(
                "login.changePasswordPage.placeholder.passwordConfirmation"
              )}
              suffix={
                showConfirmPassword ? (
                  <ViewOff
                    size={16}
                    onClick={(event) => {
                      seShowConfirmPassword(false);
                      event.stopPropagation();
                    }}
                  />
                ) : (
                  <View
                    size={16}
                    onClick={(event) => {
                      seShowConfirmPassword(true);
                      event.stopPropagation();
                    }}
                  />
                )
              }
            />
          </FormItem>
          <div className="login-page__password-rule">
            <span>{translate("login.changePasswordPage.ruleOfPassword")}</span>
            <ul>
              <li>{translate("login.changePasswordPage.ruleNoWhiteSpace")}</li>
              <li>{translate("login.changePasswordPage.ruleTextRange")}</li>
              <li>
                <span>
                  {" "}
                  {translate("login.changePasswordPage.ruleExtended")}
                </span>
                <ul>
                  <li>{translate("login.changePasswordPage.containAZ")}</li>
                  <li>{translate("login.changePasswordPage.containaz")}</li>
                  <li>{translate("login.changePasswordPage.containNumber")}</li>
                  <li>
                    {translate(
                      "login.changePasswordPage.containSpecialCharacter"
                    )}
                    {`~ ! @ # $ % ^ & * ( ) _ + - = { } | \\" ; ' <> ? , . /`}{" "}
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <div className="login-page__button-wrapper m-b--sm">
          <Button
            icon={<Unlocked size={16} />}
            className="login-button btn--lg"
            onClick={handleChangePass}
          >
            {translate("login.changePasswordPage.changePasswordButtonLabel")}
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
