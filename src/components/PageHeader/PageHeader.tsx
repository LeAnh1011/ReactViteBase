import React, { ReactNode } from "react";
import classNames from "classnames";
import "./PageHeader.scss";
import { NavLink } from "react-router-dom";

interface BreadcrumbInterface {
  name?: string;
  path?: string;
}

export interface PageHeaderProps {
  title?: string;
  breadcrumbs?: BreadcrumbInterface[];
  children?: ReactNode;
  className?: string;
  theme?: "dark" | "light";
}

const PageHeader = (props: PageHeaderProps) => {
  const { title, breadcrumbs, theme } = props;

  return (
    <div
      className={classNames(
        "page-header",
        { "page-header--dark": theme === "dark" },
        props.className
      )}
    >
      <div className="p-l--2xl p-t--sm p-b--sm">
        {breadcrumbs && breadcrumbs?.length > 0 && (
          <div className="page-header__breadcrumb p-b--2xs">
            <ul className="breadcrumb">
              {breadcrumbs.map((item: BreadcrumbInterface, index) => (
                <li
                  key={index}
                  className={classNames({
                    "breadcrumb-active": index === breadcrumbs.length - 1,
                  })}
                >
                  {item.path ? (
                    <NavLink to={item.path}>{item.name}</NavLink>
                  ) : (
                    <span className="text-link">{item.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="page-header__title">{title}</div>
      </div>
    </div>
  );
};

export default PageHeader;
