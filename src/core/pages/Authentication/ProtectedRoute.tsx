import { FORBIDENT_ROUTE } from "core/config/consts";
import React from "react";
import { Redirect, Route } from "react-router-dom";

interface ProtectedRouteProps {
  component?: typeof React.Component | ((props?: unknown) => JSX.Element);
  auth?: boolean;
  redirectPath?: string;
  path: string;
}

export function ProtectedRoute({
  component: Component,
  auth,
  redirectPath,
  ...rest
}: ProtectedRouteProps) {
  return (
    <Route
      {...rest}
      render={(props) =>
        auth === true ? (
          <Component {...props} />
        ) : (
          <Redirect to={redirectPath ? redirectPath : FORBIDENT_ROUTE} />
        )
      }
    />
  );
}
