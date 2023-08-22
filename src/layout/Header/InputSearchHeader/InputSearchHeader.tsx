import { Close, Search } from "@carbon/icons-react";
import classNames from "classnames";
import React, { useRef } from "react";
import "./InputSearchHeader.scss";

const InputSearchHeader = () => {
  const [showInput, setShowInput] = React.useState<boolean>(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleToggle = React.useCallback(() => {
    setShowInput(true);
    ref.current.focus();
  }, [ref]);

  const handleClose = React.useCallback(() => {
    setShowInput(false);
  }, []);

  return (
    <div className="input-search__container">
      <div
        className={classNames("input-search__wrapper", {
          "input-search__visible": showInput,
          "input-search__hidden": !showInput,
        })}
      >
        <button
          className="input-search__icon input-search__icon-first"
          onClick={handleToggle}
        >
          <Search size={20} />
        </button>
        <div className="input-search__box">
          <input
            ref={ref}
            type="text"
            className={classNames("component__input-search")}
          />
          <button className="input-search__icon" onClick={handleClose}>
            <Close size={20} className="" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputSearchHeader;
