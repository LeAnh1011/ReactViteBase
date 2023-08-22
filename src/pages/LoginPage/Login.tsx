import { Divider } from "antd";
import nameof from "ts-nameof.macro";
import useLogin, { LOGIN_STATE } from "./LoginHook";
import ChangePassword from "./ChangePassword/ChangePassword";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import GetOtp from "./GetOtp/GetOtp";
import LoginHeader from "./LoginHeader/LoginHeader";
import { Loop, UserAvatar, Login as LoginIcon } from "@carbon/icons-react";
import { FormItem, Button } from "react3l-ui-library";
import InputTextLogin from "./InputTextLogin/InputTextLogin";
import SuccessResultView from "./SuccessResultView/SuccessResultView";
import { useTranslation } from "react-i18next";
import googleImage from "./../../assets/images/Google.svg";
import azureImage from "./../../assets/images/Azure.svg";
import "./Login.scss";

function Login() {
  const [translate] = useTranslation();

  const {
    loginState,
    setLoginState,
    email,
    setEmail,
    handleBackToLogin,
    otp,
    setOtp,
    loginUser,
    errorMessageUsername,
    errorMessagePass,
    handleFakeLogin,
    handleChangeField,
    handleEnter,
  } = useLogin();

  return (
    <>
      <div className="login-page">
        <LoginHeader />

        <div className="login-page__content d-flex align-items-start m-l--2xl">
          <div className="main-content-form">
            {loginState === LOGIN_STATE.LOGIN && (
              <div>
                <div className="login-page__content--logo">
                  <div>
                    <Loop
                      size={32}
                      color={"#fff"}
                      className="login-page--icon"
                    />
                  </div>
                </div>
                <h2 className="login-page__content--title">
                  {translate("login.loginPage.title")}
                </h2>

                <Divider className="login-page__content--divider" />
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                  }}
                >
                  <div className="login-page__content--form">
                    <div className="login-page__username m-b--sm">
                      <FormItem message={errorMessageUsername}>
                        <InputTextLogin
                          inputType="text"
                          label={translate("login.loginPage.username")}
                          suffix={<UserAvatar size={16} />}
                          value={loginUser.username}
                          onChange={handleChangeField(
                            nameof(loginUser.username)
                          )}
                          placeHolder={translate(
                            "login.loginPage.placeholder.username"
                          )}
                          action={{
                            name: translate(
                              "login.loginPage.forgetPasswordButton"
                            ),
                            action: () =>
                              setLoginState(LOGIN_STATE.FORGOT_PASSWORD),
                          }}
                          onEnter={handleEnter}
                          nameAttr="username"
                          maxLength={30}
                        />
                      </FormItem>
                    </div>
                    <div className="login-page__password m-b--sm">
                      <FormItem message={errorMessagePass}>
                        <InputTextLogin
                          inputType={"password"}
                          label={translate("login.loginPage.password")}
                          value={loginUser.password}
                          onChange={handleChangeField(
                            nameof(loginUser.password)
                          )}
                          placeHolder={translate(
                            "login.loginPage.placeholder.password"
                          )}
                          onEnter={handleEnter}
                          nameAttr="password"
                        />
                      </FormItem>
                    </div>

                    <div className="login-page__button-wrapper m-b--md">
                      <Button
                        icon={<LoginIcon size={16} />}
                        className="login-button btn--lg"
                        onClick={handleFakeLogin}
                        disabled={
                          errorMessagePass !== null ||
                          errorMessageUsername !== null
                        }
                        htmlType="submit"
                      >
                        {translate("login.loginPage.loginButtonLabel")}
                      </Button>
                    </div>

                    <Divider className="login-page__content--divider" />

                    <div className="m-y--sm another-login">
                      {translate("login.loginPage.anotherLoginTitle")}
                    </div>

                    <div
                      className="login-page__button-wrapper m-b--lg"
                      style={{ position: "relative" }}
                    >
                      <Button
                        type="outline-primary"
                        icon={<img src={googleImage} alt="" />}
                        className="login-button btn--lg login-button--outline"
                      >
                        {translate("login.loginPage.loginByGoogleButtonLabel")}
                      </Button>
                      <div id="google-login-div"></div>
                    </div>

                    <div className="login-page__button-wrapper m-b--max">
                      <Button
                        type="outline-primary"
                        icon={<img src={azureImage} alt="" />}
                        className="login-button btn--lg login-button--outline"
                      >
                        {translate("login.loginPage.loginByADFSButtonLabel")}
                      </Button>
                    </div>

                    <Divider className="login-page__content--divider" />

                    <div
                      style={{
                        color: "#fff",
                        textAlign: "left",
                        paddingBottom: "60px",
                      }}
                      className="contact-admin"
                    >
                      {" "}
                      {translate("login.loginPage.needSupport")}{" "}
                      <span style={{ color: "var(--palette-blue-40)" }}>
                        {translate("login.loginPage.contactAdmin")}
                      </span>
                    </div>
                  </div>
                </form>
              </div>
            )}
            {loginState === LOGIN_STATE.FORGOT_PASSWORD && (
              <ForgotPassword
                translate={translate}
                setLoginState={setLoginState}
                email={email}
                setEmail={setEmail}
                handleBackToLogin={handleBackToLogin}
              />
            )}

            {loginState === LOGIN_STATE.GET_OTP && (
              <GetOtp
                otp={otp}
                setOtp={setOtp}
                email={email}
                setLoginState={setLoginState}
                handleBackToLogin={handleBackToLogin}
                translate={translate}
              />
            )}

            {loginState === LOGIN_STATE.CHANGE_PASSWORD && (
              <ChangePassword
                email={email}
                otp={otp}
                setLoginState={setLoginState}
                handleBackToLogin={handleBackToLogin}
                translate={translate}
              />
            )}

            {loginState === LOGIN_STATE.SUCCESSFUL && (
              <SuccessResultView translate={translate} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
