import { LOGIN_ROUTE, ROOT_ROUTE } from "core/config/consts";
import Login from "pages/LoginPage/Login";
import { Redirect, Route, Switch } from "react-router-dom";
import AppGuard from "./AppGuard";
import { store } from "rtk/store";
import { Provider } from "react-redux";

const AppRoot = () => {
  return (
    <Provider store={store}>
      <Switch>
        <Route
          exact
          path={LOGIN_ROUTE}
          render={() => {
            const profile = localStorage.getItem("profile");
            if (profile) {
              return <Redirect to={`${ROOT_ROUTE}`} />;
            } else {
              return <Login />;
            }
          }}
        />
        <Route path={ROOT_ROUTE} component={AppGuard} />
      </Switch>
    </Provider>
  );
};

export default AppRoot;
