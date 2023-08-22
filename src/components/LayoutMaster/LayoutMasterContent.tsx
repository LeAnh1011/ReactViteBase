import { PropsWithChildren } from "react";

const LayoutMasterContent = (props: PropsWithChildren<unknown>) => {
  const { children } = props;

  return <div className="page-master__content-table">{children}</div>;
};

export default LayoutMasterContent;
