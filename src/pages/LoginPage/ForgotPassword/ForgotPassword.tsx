import React from "react";
import { Loop, ArrowRight, Email, ArrowLeft } from "@carbon/icons-react";
import { Divider } from "antd";
import { FormItem, Button } from "react3l-ui-library";
import InputTextLogin from "../InputTextLogin/InputTextLogin";
import type { TFunction } from "i18next";
import { AxiosError } from "axios";
import { authenticationRepository } from "core/repositories/AuthenticationRepository";
import { LOGIN_STATE } from "../LoginHook";

export interface ForgotPasswordProps {
  translate?: TFunction;
  setLoginState?: React.Dispatch<React.SetStateAction<LOGIN_STATE>>;
  email?: string;
  setEmail?: React.Dispatch<React.SetStateAction<string>>;
  handleBackToLogin?: () => void;
}

export default function ForgotPassword(props: ForgotPasswordProps) {
  const { setLoginState, translate, email, setEmail, handleBackToLogin } =
    props;
  const inputTextRef = React.useRef<HTMLDivElement>();
  const [errorMessageEmail, setErrorMessageEmail] =
    React.useState<string>(null);

  const handleChangeEmail = React.useCallback(
    (event: string) => {
      setEmail(event);
      setErrorMessageEmail(null);
    },
    [setEmail]
  );

  const handleSendMail = React.useCallback(() => {
    authenticationRepository.forgotPassword(email).subscribe({
      next: () => {
        setLoginState(LOGIN_STATE.GET_OTP);
      },
      error: (error: AxiosError) => {
        if (error.response && error.response.status === 400) {
          setErrorMessageEmail(error.response.data?.errors?.email);
        }
      },
    });
  }, [email, setLoginState]);

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
        {translate("login.forgetPasswordPage.title")}
      </h2>

      <div className="login-page__content--under-title m-t--2xs">
        {translate("login.forgetPasswordPage.message")}
      </div>

      <Divider className="login-page__content--divider" />

      <div className="login-page__content--form">
        <div className="login-page__password m-b--sm">
          <FormItem message={errorMessageEmail}>
            <InputTextLogin
              inputType="text"
              label={translate("login.forgetPasswordPage.email")}
              suffix={<Email size={16} />}
              value={email}
              onChange={handleChangeEmail}
              placeHolder={translate(
                "login.forgetPasswordPage.placeholder.email"
              )}
              ref={inputTextRef}
              onEnter={handleSendMail}
            />
          </FormItem>
        </div>

        <div className="login-page__button-wrapper m-b--sm">
          <Button
            icon={<ArrowRight size={16} />}
            className="login-button btn--lg"
            onClick={handleSendMail}
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
