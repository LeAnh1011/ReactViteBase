import { LOGIN_ROUTE } from "core/config/consts";
import LoadingPage from "core/pages/LoadingPage/LoadingPage";
import { Profile } from "core/models/Profile";
import React from "react";
import { useHistory } from "react-router-dom";
import { profileRepository } from "core/repositories/ProfileRepository";
import workerService from "core/config/worker";
import App from "./App";
import { authenticationRepository } from "core/repositories/AuthenticationRepository";

import { useAppDispatch } from "rtk/hook";
import { updateAll } from "rtk/profile/slice";
import { throwError, retry, timer } from "rxjs";

const MAX_RETRIES = 5;
const RETRY_DELAY = 300;

const AppGuard = () => {
  const history = useHistory();
  // Change default value to true when using in real project:
  const [loadingPage, setLoadingPage] = React.useState<boolean>(false);
  const dispatch = useAppDispatch();

  const handleRefreshToken = React.useCallback(
    (isSetLoading?: unknown) => {
      authenticationRepository
        .refreshToken()
        .pipe((source) => {
          return source.pipe(
            retry({
              delay: (error, retryCount) => {
                if (error.response.status === 401) {
                  return throwError(() => new Error(error));
                } else if (retryCount < MAX_RETRIES) {
                  return timer(RETRY_DELAY);
                } else {
                  return throwError(() => new Error(error));
                }
              },
            })
          );
        })
        .subscribe({
          next: (expTime: number) => {
            if (expTime) {
              workerService.postMessage(expTime);
              if (!isSetLoading) {
                setLoadingPage(false);
                const profile: Profile = JSON.parse(
                  localStorage.getItem("profile")
                );
                dispatch(updateAll(profile));
              }
            }
          },
          error: () => {
            localStorage.removeItem("profile");
            window.location.href = LOGIN_ROUTE;
          },
        });
    },
    [dispatch]
  );

  React.useEffect(() => {
    const subcription = profileRepository.get().subscribe({
      next: (res: Profile) => {
        dispatch(updateAll(res));
        localStorage.setItem("profile", JSON.stringify(res));
        workerService.postMessage(res.tokenRemaingExpirySeconds);
        setLoadingPage(false);
      },
      error: () => {
        return;
        // uncomment this line in real project
        // handleRefreshToken();
      },
    });
    workerService.onMessage(handleRefreshToken);
    return () => {
      subcription.unsubscribe();
    };
  }, [dispatch, handleRefreshToken, history]);

  return <>{loadingPage ? <LoadingPage /> : <App />}</>;
};

export default AppGuard;
