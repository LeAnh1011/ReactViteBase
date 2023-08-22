import { FC, Fragment, PropsWithChildren } from "react";
import Body from "./Body/Body";
import Header from "./Header/Header";
import "./Layout.scss";
import { IbmCloudPakSecurity } from "@carbon/icons-react";

const Layout: FC<PropsWithChildren<unknown>> = (
  props: PropsWithChildren<unknown>
) => {
  return (
    <Fragment>
      <div className="layout__container">
        <div className="layout-header">
          <Header
            logo={<IbmCloudPakSecurity size={24} />}
            logoName="Global Admin"
          />
        </div>
        <div className="layout-body">
          <div className="layout-body__main">
            <Body>{props.children}</Body>
          </div>
        </div>
        {/* <div className="layout-footer">
          <Footer></Footer>
        </div> */}
      </div>
    </Fragment>
  );
};

export default Layout;
