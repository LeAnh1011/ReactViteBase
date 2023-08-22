import { Col } from "antd";
import { PropsWithChildren } from "react";

const Left = (props: PropsWithChildren<unknown>) => {
  return (
    <Col lg={4} className="filter-panel__left p-l--sm">
      {props?.children}
    </Col>
  );
};

export default Left;
