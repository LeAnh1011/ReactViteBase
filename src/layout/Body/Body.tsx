import { PropsWithChildren } from "react";

const Body = (props: PropsWithChildren<unknown>) => {
  return <div className="page-body">{props?.children}</div>;
};

export default Body;
