import "./LoadingPage.scss";

const LoadingPage = () => {
  return (
    <div id="loading-wrapper">
      <div className="gooey">
        <span className="dot"></span>
        <div className="dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
