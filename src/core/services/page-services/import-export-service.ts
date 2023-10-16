import React, { useRef, useCallback, ChangeEvent, RefObject } from "react";
import { Model, ModelFilter } from "react3l-common";
import { AxiosError, AxiosResponse } from "axios";
import { Observable } from "rxjs";
import { saveAs } from "file-saver";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import { webService } from "../common-services/web-service";
export const importExportService = {
  /**
   *
   * react hook for handle action import file
   * @param: dispatch
   * @param: onImportSuccess?: (list?: T[]) => void,
   * @return: { ref, handleClick, handleImportList, handleImportContentList }
   *
   * */

  useImport<T extends Model>(onImportSuccess?: (list?: T[]) => void) {
    const [subscription] = webService.useSubscription(); // subscription avoid leak memory
    const [translate] = useTranslation();

    const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null); // ref object to clear value of input after import

    /** handle action when import get error **/
    const handleImportError = useCallback(
      (error: AxiosError<unknown>) => {
        Modal.error({
          title: translate("general.toasts.error"),
          content: error.response.data as string,
          className: "ant-modal-import-error",
        });
      },
      [translate]
    );

    /** handle import list from server **/
    const handleImportList = useCallback(
      (
        onImport: (file: File, queryValue: string) => Observable<unknown>,
        queryValue?: string
      ) => {
        return (event: ChangeEvent<HTMLInputElement>) => {
          if (event.target.files.length > 0) {
            const file: File = event.target.files[0];
            if (typeof onImport === "function") {
              subscription.add(
                onImport(file, queryValue).subscribe({
                  next: () => {
                    Modal.success({
                      content: translate("general.toasts.success"),
                    });
                    if (typeof onImportSuccess === "function") {
                      onImportSuccess();
                    }
                  }, // onSuccess
                  error: (err: AxiosError<unknown>) => handleImportError(err),
                })
              );
            }
          }
        };
      },
      [subscription, handleImportError, onImportSuccess, translate]
    );

    /** handle import content list from server **/
    const handleImportContentList = useCallback(
      (
        modelId: number,
        onImport: (file: File, priceListId: number) => Observable<T[]>
      ) => {
        return (event: ChangeEvent<HTMLInputElement>) => {
          const file: File = event.target.files[0];
          if (typeof onImport === "function") {
            subscription.add(
              onImport(file, modelId).subscribe({
                next: (list: T[]) => {
                  Modal.success({
                    content: translate("general.toasts.success"),
                  });
                  if (typeof onImportSuccess === "function") {
                    onImportSuccess(list);
                  }
                },
                error: handleImportError, // onError
              })
            );
          }
        };
      },
      [handleImportError, onImportSuccess, subscription, translate]
    );

    const handleClick = useCallback(() => {
      ref.current.value = null;
    }, []);

    return { ref, handleClick, handleImportList, handleImportContentList };
  },

  /**
   *
   * react hook for handle action import file
   * @return: { handleListExport,
      handleExportTemplateList,
      handleContentExport,
      handleContentExportTemplate }
   *
   * */
  useExport() {
    const [subscription] = webService.useSubscription();
    const [loading, setLoading] = React.useState<boolean>(false);

    /** handle action when export succesfully **/
    const handleExportSuccess = (response: AxiosResponse) => {
      const fileName = response.headers["content-disposition"]
        .split(";")
        .find((n: string) => n.includes("filename="))
        .replace("filename=", "")
        .replaceAll('"', "")
        .trim(); // define fileName for saver
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/octet-stream",
        })
      );
      setLoading(false);
      saveAs(url, fileName); // save file
    };

    /** handle export list from server **/
    const handleListExport = useCallback(
      <TFilter extends ModelFilter>(
        filter: TFilter,
        onExport: (filter: ModelFilter) => Observable<AxiosResponse>
      ) => {
        return () => {
          if (typeof onExport === "function") {
            setLoading(true);
            subscription.add(
              onExport(filter).subscribe(
                handleExportSuccess // onSuccess
              )
            );
          }
        };
      },
      [subscription]
    );

    /** handle export template from server **/
    const handleExportTemplateList = useCallback(
      (
        onExport: (queryValue?: number) => Observable<AxiosResponse>,
        queryValue?: number
      ) => {
        return () => {
          if (typeof onExport === "function") {
            subscription.add(
              onExport(queryValue).subscribe(
                handleExportSuccess // onSuccess
              )
            );
          }
        };
      },
      [subscription]
    );

    /** handleExport contentList from server  **/
    const handleContentExport = useCallback(
      <T extends Model>(
        model: T,
        onExport: (model: T) => Observable<AxiosResponse>
      ) => {
        return () => {
          if (typeof onExport === "function") {
            subscription.add(
              onExport(model).subscribe(
                handleExportSuccess // onSuccess
              )
            );
          }
        };
      },
      [subscription]
    );

    /** handleExport listContent template from server **/
    const handleContentExportTemplate = useCallback(
      <T extends Model>(
        model: T,
        onExport: (id: number) => Observable<AxiosResponse>
      ) => {
        return () => {
          if (typeof onExport === "function") {
            subscription.add(
              onExport(model?.id).subscribe(
                handleExportSuccess // onSuccess
              )
            );
          }
        };
      },
      [subscription]
    );

    return {
      handleListExport,
      handleExportTemplateList,
      handleContentExport,
      handleContentExportTemplate,
      loading,
    };
  },
};
