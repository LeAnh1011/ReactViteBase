import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import i18nTranslation from "core/config/i18n";
import { httpInterceptor } from "core/config/http";
import LoadingPage from "core/pages/LoadingPage/LoadingPage";
import { utilService } from "core/services/common-services/util-service";
import workerService from "core/config/worker";
// Import styles
import "assets/scss/app.scss";

const AppRoot = React.lazy(async () => {
  workerService.startWorker();
  await Promise.all([
    i18nTranslation.initialize(),
    httpInterceptor.initialize(),
    utilService.cacheImages([]),
  ]);
  return import("app/AppRoot");
});

const app = (
  <BrowserRouter>
    <React.Suspense fallback={<LoadingPage />}>
      <AppRoot />
    </React.Suspense>
  </BrowserRouter>
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(app);
