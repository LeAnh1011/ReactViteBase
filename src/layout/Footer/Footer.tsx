import { PropsWithChildren } from "react";

const Footer = (props: PropsWithChildren<unknown>) => {
  return <div className="footer">{props?.children}</div>;
};

export default Footer;
