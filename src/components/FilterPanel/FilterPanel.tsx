import { Row } from "antd";
import React, { ReactNode } from "react";
import { Button } from "react3l-ui-library";
import "./FilterPanel.scss";
import Left from "./Left";
import Right from "./Right";
import { utilService } from "core/services/common-services/util-service";

interface FilterPanelProps {
  children?: ReactNode;
  width?: number;
  buttonFilterId?: string;
  handleResetFilter?: () => void;
  handleAppplyFilter?: () => void;
  handleToogleFilter?: React.Dispatch<React.SetStateAction<boolean>>;
  titleButtonCancel?: string;
  titleButtonApply?: string;
  exceptNodeIds?: string[];
}
const FilterPanel = (props: FilterPanelProps) => {
  const filterPanelRef = React.useRef();
  const {
    handleResetFilter,
    titleButtonCancel,
    handleAppplyFilter,
    titleButtonApply,
    buttonFilterId,
    handleToogleFilter,
    exceptNodeIds,
  } = props;

  const [size, setSize] = React.useState<number>(0);

  const handleCloseFilter = React.useCallback(() => {
    if (typeof handleToogleFilter != null) {
      handleToogleFilter(false);
    }
  }, [handleToogleFilter]);

  const exceptNodes = React.useMemo(() => {
    return exceptNodeIds ? exceptNodeIds : [];
  }, [exceptNodeIds]);

  React.useLayoutEffect(() => {
    const element = buttonFilterId
      ? (document.getElementById(buttonFilterId) as HTMLElement)
      : (document.querySelector(".btn-filter") as HTMLElement);
    function updateSize() {
      if (element) {
        setSize(element.offsetLeft);
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [buttonFilterId]);

  utilService.useClickOutside(filterPanelRef, handleCloseFilter, exceptNodes);

  return (
    <div
      className="filter-panel-container"
      style={{ width: size + 40 }}
      ref={filterPanelRef}
    >
      <div className="filter-panel__wrapper" data-filter-direction="bottom">
        <Row>
          <div className="filter-panel__header">Bộ lọc</div>
        </Row>
        <Row className="p-t--lg filter-panel__content">{props.children}</Row>
        <Row className="p-t--lg filter-panel__actions d-flex align-items-center justify-content-end">
          <Button
            type="secondary"
            className="btn--xl btn-reset-filter"
            onClick={handleResetFilter}
          >
            <span>
              {titleButtonCancel ? titleButtonCancel : "Reset Filters"}
            </span>
          </Button>

          <Button
            type="primary"
            className="btn--xl btn-apply-filter"
            onClick={handleAppplyFilter}
          >
            <span>{titleButtonApply ? titleButtonApply : "Apply Filters"}</span>
          </Button>
        </Row>
      </div>
    </div>
  );
};
FilterPanel.Left = Left;
FilterPanel.Right = Right;

export default FilterPanel;
