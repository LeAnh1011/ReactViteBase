import { ReactNode } from "react";
import { KeyType } from "core/services/service-types";

interface LayoutMasterActionsProps {
  children?: ReactNode;
  selectedRowKeys?: KeyType[];
}
const LayoutMasterActions = (props: LayoutMasterActionsProps) => {
  const { selectedRowKeys, children } = props;

  return (
    <div className="page-master__all-actions">
      {(!selectedRowKeys || selectedRowKeys?.length === 0) && (
        <div className="page-master__view-wrapper d-flex align-items-center justify-content-between">
          {children}
        </div>
      )}
    </div>
  );
};

export default LayoutMasterActions;
