import { Col } from "antd";
import { ReactNode } from "react";

interface RightProps {
  children?: ReactNode;
  hasLeft?: boolean;
}
const Right = (props: RightProps) => {
  const { children, hasLeft = true } = props;

  return (
    <Col lg={hasLeft ? 20 : 24} className="filter-panel__right">
      <div className="filter-panel__right-children">{children}</div>
    </Col>
  );
};

export default Right;
