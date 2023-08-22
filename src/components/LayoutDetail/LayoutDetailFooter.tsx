import { PropsWithChildren } from "react";

const LayoutDetailFooter = (props: PropsWithChildren<unknown>) => {
  const { children } = props;

  return (
    <footer className="app-footer">
      <div className="app-footer__full d-flex justify-content-end align-items-center">
        {children}
      </div>
    </footer>
  );
};

export default LayoutDetailFooter;
