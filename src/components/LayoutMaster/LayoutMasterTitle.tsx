interface LayoutMasterTitleProps {
  title?: string;
  description?: string;
}

const LayoutMasterTitle = (props: LayoutMasterTitleProps) => {
  const { title, description } = props;

  return (
    <div className="page-master__info">
      <div className="page-master__title">{title}</div>
      <div className="page-master__des m-t--2xs">{description}</div>
    </div>
  );
};

export default LayoutMasterTitle;
