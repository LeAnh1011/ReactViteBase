import { AxiosResponse } from "axios";
import { FileTemplate } from "core/models/FileTemplate";
import saveAs from "file-saver";
import React from "react";
import { useTranslation } from "react-i18next";
import { finalize, Observable } from "rxjs";
import { FileTemplateParams } from "./FileTemplate";
import type { MenuInfo } from "rc-menu/lib/interface";

enum FILE_TEMPLATE_ENUM {
  UPDATE_ALL_FILE_TEMPLATE,
  UPDATE_SINGLE,
  UPDATE_LIST,
  LOAD_FILE,
  UPDATE_FILE_URL,
}

interface FileTemplateState {
  fileTemplates?: FileTemplate[];
  currentfileTemplate?: FileTemplate;
  pdfBlobUrl?: string;
}

interface FileTemplateAction {
  type: FILE_TEMPLATE_ENUM;
  data: FileTemplateState;
}

function fileTemplateReducer(
  state: FileTemplateState,
  action: FileTemplateAction
): FileTemplateState {
  switch (action.type) {
    case FILE_TEMPLATE_ENUM.UPDATE_ALL_FILE_TEMPLATE:
      return {
        fileTemplates: [...action.data.fileTemplates],
        currentfileTemplate: { ...action.data.currentfileTemplate },
        pdfBlobUrl: action.data.pdfBlobUrl,
      };
    case FILE_TEMPLATE_ENUM.UPDATE_LIST:
      return {
        ...state,
        fileTemplates: [...action.data.fileTemplates],
      };
    case FILE_TEMPLATE_ENUM.UPDATE_SINGLE:
      return {
        ...state,
        currentfileTemplate: { ...action.data.currentfileTemplate },
      };
    case FILE_TEMPLATE_ENUM.LOAD_FILE:
      return {
        ...state,
        pdfBlobUrl: action.data.pdfBlobUrl,
      };
    case FILE_TEMPLATE_ENUM.UPDATE_FILE_URL:
      return {
        ...state,
        pdfBlobUrl: action.data.pdfBlobUrl,
        currentfileTemplate: { ...action.data.currentfileTemplate },
      };
    default:
      return { ...state };
  }
}

export default function useFileTemplateHook(
  getListFileTemplates: () => Observable<FileTemplate[]>,
  previewFileTemplate: (
    params: FileTemplateParams
  ) => Observable<AxiosResponse>,
  downloadFileTemplatePdf: (
    params: FileTemplateParams
  ) => Observable<AxiosResponse>,
  downloadFileTemplateOriginal: (
    params: FileTemplateParams
  ) => Observable<AxiosResponse>,
  saveFileTemplate?: (fileTemplate: FileTemplate) => void,
  dataParams?: unknown
) {
  const [translate] = useTranslation();
  const [loadingPdf, setLoadingPdf] = React.useState(false);

  const [
    { fileTemplates, currentfileTemplate, pdfBlobUrl },
    dispatchFileTemplate,
  ] = React.useReducer(fileTemplateReducer, {
    fileTemplates: [],
    currentfileTemplate: new FileTemplate(),
    pdfBlobUrl: "",
  });

  const handlePreviewFileTemplate = React.useCallback(() => {
    const template = { ...currentfileTemplate };
    const queryParams = dataParams ? dataParams : undefined;
    setLoadingPdf(true);
    previewFileTemplate({
      queryParams,
      template,
    })
      .pipe(finalize(() => setLoadingPdf(false)))
      .subscribe({
        next: (response: AxiosResponse<Blob>) => {
          const file = new Blob([response.data], {
            type: "application/pdf",
          });
          const fileURL = URL.createObjectURL(file);
          dispatchFileTemplate({
            type: FILE_TEMPLATE_ENUM.LOAD_FILE,
            data: {
              pdfBlobUrl: fileURL,
            },
          });
        },
      });
  }, [currentfileTemplate, dataParams, previewFileTemplate]);

  const handleDownloadFileTemplate = React.useCallback(() => {
    const template = { ...currentfileTemplate };
    const queryParams = dataParams ? dataParams : undefined;
    downloadFileTemplatePdf({
      template,
      queryParams,
    }).subscribe({
      next: (response: AxiosResponse) => {
        const fileName = response.headers["content-disposition"]
          .split(";")
          .find((n: string) => n.includes("filename="))
          .replace("filename=", "")
          .replace(/"/gi, "")
          .trim();
        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: "application/octet-stream",
          })
        );
        saveAs(url, fileName);
      },
    });
  }, [currentfileTemplate, dataParams, downloadFileTemplatePdf]);

  const handleDownloadFileTemplateOriginal = React.useCallback(() => {
    const template = { ...currentfileTemplate };
    const queryParams = dataParams ? dataParams : undefined;
    downloadFileTemplateOriginal({
      template,
      queryParams,
    }).subscribe({
      next: (response: AxiosResponse) => {
        const fileName = response.headers["content-disposition"]
          .split(";")
          .find((n: string) => n.includes("filename="))
          .replace("filename=", "")
          .replace(/"/gi, "")
          .trim();
        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: "application/octet-stream",
          })
        );
        saveAs(url, fileName);
      },
    });
  }, [currentfileTemplate, dataParams, downloadFileTemplateOriginal]);

  const handleChangeFileTemplateInputValue = React.useCallback(
    (index: number) => (value: string) => {
      const fileTemplate = { ...currentfileTemplate };
      fileTemplate.inputs[index].fieldValue = value;
      dispatchFileTemplate({
        type: FILE_TEMPLATE_ENUM.UPDATE_SINGLE,
        data: {
          currentfileTemplate: fileTemplate,
        },
      });
    },
    [currentfileTemplate]
  );

  const handleChangeFileTemplateName = React.useCallback(
    (value: string) => {
      const fileTemplate = { ...currentfileTemplate };
      fileTemplate.name = value;
      dispatchFileTemplate({
        type: FILE_TEMPLATE_ENUM.UPDATE_SINGLE,
        data: {
          currentfileTemplate: fileTemplate,
        },
      });
    },
    [currentfileTemplate]
  );

  const handleChangeFileTemplate = React.useCallback(
    (event: MenuInfo) => {
      const fileTemplateId = Number(event.key);
      const template = fileTemplates.filter(
        (fileTemplate: FileTemplate) => fileTemplate.id === fileTemplateId
      )[0];
      setLoadingPdf(true);
      const queryParams = dataParams ? dataParams : undefined;
      previewFileTemplate({
        queryParams,
        template,
      })
        .pipe(finalize(() => setLoadingPdf(false)))
        .subscribe({
          next: (response: AxiosResponse) => {
            const file = new Blob([response.data], {
              type: "application/pdf",
            });
            const fileURL = URL.createObjectURL(file);
            dispatchFileTemplate({
              type: FILE_TEMPLATE_ENUM.UPDATE_FILE_URL,
              data: {
                currentfileTemplate: template,
                pdfBlobUrl: fileURL,
              },
            });
          },
        });
    },
    [dataParams, fileTemplates, previewFileTemplate]
  );

  const handleSaveFileTemplate = React.useCallback(() => {
    const fileTemplate = { ...currentfileTemplate };
    saveFileTemplate(fileTemplate);
  }, [currentfileTemplate, saveFileTemplate]);

  React.useEffect(() => {
    const subcription = getListFileTemplates().subscribe({
      next: (res: FileTemplate[]) => {
        if (res && res.length > 0) {
          const fileTemplates = res;
          const currentfileTemplate = res[0];
          setLoadingPdf(true);
          dispatchFileTemplate({
            type: FILE_TEMPLATE_ENUM.UPDATE_ALL_FILE_TEMPLATE,
            data: {
              fileTemplates,
              currentfileTemplate,
            },
          });
          previewFileTemplate({
            queryParams: dataParams,
            template: currentfileTemplate,
          })
            .pipe(finalize(() => setLoadingPdf(false)))
            .subscribe({
              next: (response: AxiosResponse) => {
                const file = new Blob([response.data], {
                  type: "application/pdf",
                });
                const fileURL = URL.createObjectURL(file);
                dispatchFileTemplate({
                  type: FILE_TEMPLATE_ENUM.LOAD_FILE,
                  data: {
                    pdfBlobUrl: fileURL,
                  },
                });
              },
            });
        }
      },
    });
    return () => {
      subcription.unsubscribe();
    };
  }, [dataParams, getListFileTemplates, previewFileTemplate]);

  return {
    currentfileTemplate,
    fileTemplates,
    pdfBlobUrl,
    loadingPdf,
    translate,
    handleChangeFileTemplateInputValue,
    handleChangeFileTemplateName,
    handleChangeFileTemplate,
    handlePreviewFileTemplate,
    handleDownloadFileTemplate,
    handleDownloadFileTemplateOriginal,
    handleSaveFileTemplate,
  };
}
