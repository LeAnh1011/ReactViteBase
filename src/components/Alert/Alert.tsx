import React, { ReactNode } from "react";
import "./Alert.scss";

interface AlertProps {
  avatar?: ReactNode;
  title?: ReactNode;
  content?: ReactNode;
  action?: ReactNode;
  handleAction?: () => void;
  bgColor?: string;
}

const Alert = (props: AlertProps) => {
  const { avatar, title, content, action, bgColor, handleAction } = props;

  return (
    <div
      className="alert__container p--sm"
      style={{ backgroundColor: bgColor }}
    >
      <div>{avatar}</div>
      <div className="alert__description m-l--sm">
        <div className="description__title">{title}</div>
        <div className="description__content">{content}</div>
        <div className="description__action" onClick={handleAction}>
          {action}
        </div>
      </div>
    </div>
  );
};

export default Alert;
