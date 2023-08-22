import { AxiosError } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { getParameterByName } from "core/helpers/query";
import jwt_decode from "jwt-decode";
import { authenticationRepository } from "core/repositories/AuthenticationRepository";
import { DASHBROAD_ROUTE } from "config/route-const";
import { LoginUser } from "core/models/LoginUser";

export enum LOGIN_STATE {
  LOGIN = "LOGIN",
  FORGOT_PASSWORD = "FORGOT_PASSWORD",
  GET_OTP = "GET_OTP",
  CHANGE_PASSWORD = "CHANGE_PASSWORD",
  SUCCESSFUL = "SUCCESSFUL",
}

export default function useLogin() {
  const [loginUser, setLoginUser] = useState<LoginUser>({
    ...new LoginUser(),
    username: "",
    password: "",
  });
  const [loginState, setLoginState] = useState<LOGIN_STATE>(LOGIN_STATE.LOGIN);
  const [email, setEmail] = useState<string>(null);
  const [otp, setOtp] = useState<string>(null);

  const [errorMessageUsername, setErrorMessageUsername] =
    useState<string>(null);
  const [errorMessagePass, setErrorMessagePass] = useState<string>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google = (window as any).google;

  const handleBackToLogin = React.useCallback(() => {
    setLoginState(LOGIN_STATE.LOGIN);
  }, [setLoginState]);

  const handleFakeLogin = React.useCallback(
    (
      event:
        | React.KeyboardEvent<HTMLInputElement>
        | React.MouseEvent<HTMLInputElement>
    ) => {
      event.preventDefault();
      localStorage.setItem(
        "profile",
        JSON.stringify({
          id: 1,
          displayName: "Admin",
          userName: "Administrator",
        })
      );
      window.location.href = DASHBROAD_ROUTE;
    },
    []
  );

  const handleLogin = useCallback(
    (
      event:
        | React.KeyboardEvent<HTMLInputElement>
        | React.MouseEvent<HTMLInputElement>
    ) => {
      event.preventDefault();
      authenticationRepository.login(loginUser).subscribe({
        next: () => {
          const redirect =
            getParameterByName("redirect") === null
              ? DASHBROAD_ROUTE
              : getParameterByName("redirect");
          window.location.href = `${redirect}`;
        },
        error: (error: AxiosError) => {
          if (error.response && error.response.status === 400) {
            const { username, password } = error.response.data
              ? error.response.data.errors
              : undefined;
            if (typeof username !== "undefined")
              setErrorMessageUsername(username);
            if (typeof password !== "undefined") setErrorMessagePass(password);
          }
        },
      });
    },
    [loginUser, setErrorMessagePass, setErrorMessageUsername]
  );

  /*start handle login by google*/
  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      const googleUser: { email: string } = jwt_decode(response.credential);
      authenticationRepository
        .loginByGmail({
          username: googleUser.email,
          idToken: response.credential,
        })
        .subscribe({
          next: () => {
            const redirect =
              getParameterByName("redirect") === null
                ? DASHBROAD_ROUTE
                : getParameterByName("redirect");
            window.location.href = `${redirect}`;
          },
          error: (error: AxiosError) => {
            if (error.response && error.response.status === 400) {
              const { username, password } = error.response.data
                ? error.response.data.errors
                : undefined;
              if (typeof username !== "undefined")
                setErrorMessageUsername(username);
              if (typeof password !== "undefined")
                setErrorMessagePass(password);
            }
          },
        });
    },
    [setErrorMessagePass, setErrorMessageUsername]
  );

  useEffect(() => {
    if (google && google.accounts) {
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("google-login-div"),
        {
          theme: "outline",
          size: "small",
          type: "standard",
          shape: "rectangular",
          width: "368",
        }
      );
    }
  }, [google, handleCredentialResponse]);

  const handleSetValue = useCallback(
    (field: string, value?: string | number | boolean | null) => {
      setLoginUser({
        ...loginUser,
        [field]: value,
        errors: undefined,
      });
      setErrorMessagePass(null);
      setErrorMessageUsername(null);
    },
    [loginUser, setLoginUser, setErrorMessagePass, setErrorMessageUsername]
  );

  const handleChangeField = useCallback(
    (field: string) => {
      return (value: string) => {
        return handleSetValue(field, value);
      };
    },
    [handleSetValue]
  );

  const handleEnter = useCallback(
    (ev: React.KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === "Enter") {
        handleLogin(ev);
      }
    },
    [handleLogin]
  );

  return {
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
    handleLogin,
    handleChangeField,
    handleEnter,
    handleFakeLogin
  };
}
