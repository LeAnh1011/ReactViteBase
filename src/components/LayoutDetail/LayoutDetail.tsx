import { PropsWithChildren } from "react";
import LayoutDetailFooter from "./LayoutDetailFooter";
import classNames from "classnames";

interface LayoutDetailProps {
  className?: string;
}

const LayoutDetail = (props: PropsWithChildren<LayoutDetailProps>) => {
  const { children, className } = props;

  return (
    <div className={classNames("page page-detail", className)}>{children}</div>
  );
};
LayoutDetail.Footer = LayoutDetailFooter;

export default LayoutDetail;
