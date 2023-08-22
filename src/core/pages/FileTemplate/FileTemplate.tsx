import PageHeader from "components/PageHeader/PageHeader";
import React, { ReactElement } from "react";
import "./FileTemplate.scss";
import useFileTemplateHook from "./FileTemplateHook";
import { Button, InputText, TextArea } from "react3l-ui-library";
import { Col, Dropdown, Menu, Row, Spin } from "antd";
import { Observable } from "rxjs";
import { FileTemplate, FileTemplateInput } from "core/models/FileTemplate";
import { AxiosResponse } from "axios";
import {
  ChevronDown,
  DocumentDownload,
  Download,
  View,
} from "@carbon/icons-react";

export interface FileTemplateParams {
  queryParams?: unknown;
  template: FileTemplate;
}

export interface FileTemplateProps {
  getListFileTemplates: () => Observable<FileTemplate[]>;
  previewFileTemplate: (
    params: FileTemplateParams
  ) => Observable<AxiosResponse>;
  downloadFileTemplatePdf: (
    params: FileTemplateParams
  ) => Observable<AxiosResponse>;
  downloadFileTemplateOriginal: (
    params: FileTemplateParams
  ) => Observable<AxiosResponse>;
  saveFileTemplate?: (fileTemplate: FileTemplate) => void;
  subTitle?: string;
  dataParams?: unknown;
}

export default function FileTemplatePage(
  props: FileTemplateProps
): ReactElement {
  const {
    getListFileTemplates,
    previewFileTemplate,
    downloadFileTemplatePdf,
    downloadFileTemplateOriginal,
    saveFileTemplate,
    subTitle,
    dataParams,
  } = props;

  const {
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
  } = useFileTemplateHook(
    getListFileTemplates,
    previewFileTemplate,
    downloadFileTemplatePdf,
    downloadFileTemplateOriginal,
    saveFileTemplate,
    dataParams
  );

  const listFileTemplates = React.useMemo(() => {
    const idString =
      currentfileTemplate && currentfileTemplate.id
        ? currentfileTemplate.id.toString()
        : null;
    return fileTemplates && fileTemplates.length > 0 ? (
      <Menu onClick={handleChangeFileTemplate} selectedKeys={[idString]}>
        {fileTemplates.map((item: FileTemplate) => {
          return <Menu.Item key={item.id}>{item.name}</Menu.Item>;
        })}
      </Menu>
    ) : (
      <Menu>
        <Menu.Item key={0}>{"Empty"}</Menu.Item>
      </Menu>
    );
  }, [currentfileTemplate, fileTemplates, handleChangeFileTemplate]);

  return (
    <>
      <div className="page-content">
        <PageHeader
          title={translate(subTitle)}
          breadcrumbs={[
            { name: translate("fileTemplates.header") },
            { name: translate(subTitle) },
          ]}
        />
        <div className="page page-detail page-detail--full p-t--lg p-l--md p-r--sm p-b--lg">
          <div className="w-100 d-flex justify-content-between align-items-center">
            <div className="page-detail__title">
              {translate("fileTemplates.title")}
            </div>
            <div className="d-flex align-items-center">
              <Dropdown
                dropdownRender={() => listFileTemplates}
                trigger={["click"]}
              >
                <Button
                  type="outline-primary"
                  className="btn--lg m-r--xs"
                  icon={<ChevronDown size={16} />}
                  onClick={(event) => {
                    event.preventDefault();
                  }}
                >
                  {translate("fileTemplates.list")}
                </Button>
              </Dropdown>
              <Button
                type="outline-primary"
                className="btn--lg m-r--xs"
                icon={<View size={16} />}
                onClick={handlePreviewFileTemplate}
              >
                {translate("fileTemplates.preview")}
              </Button>
              <Button
                type="outline-primary"
                className="btn--lg m-r--xs"
                icon={<DocumentDownload size={16} />}
                onClick={handleDownloadFileTemplate}
              >
                {translate("fileTemplates.downloadPDF")}
              </Button>
              <Button
                type="outline-primary"
                className="btn--lg m-r--xs"
                icon={<Download size={16} />}
                onClick={handleDownloadFileTemplateOriginal}
              >
                {translate("fileTemplates.downloadFile")}
              </Button>
              {saveFileTemplate && (
                <Button
                  type="primary"
                  className="btn--lg"
                  onClick={handleSaveFileTemplate}
                >
                  {translate("fileTemplates.save")}
                </Button>
              )}
            </div>
          </div>
          <div className="w-100 mt-2">
            <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
              <Col className="gutter-row" span={10}>
                <div className="gutter-box">
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col lg={24}>
                      <InputText
                        type={0}
                        label={translate("fileTemplates.name")}
                        value={currentfileTemplate.name}
                        onChange={handleChangeFileTemplateName}
                      />
                    </Col>
                  </Row>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    {currentfileTemplate &&
                      currentfileTemplate.inputs != null &&
                      currentfileTemplate.inputs.map(
                        (
                          fileTemplateInput: FileTemplateInput,
                          index: number
                        ) => {
                          return (
                            <Col
                              lg={12}
                              key={fileTemplateInput.id}
                              className="m-t--xs"
                            >
                              <TextArea
                                type={0}
                                label={fileTemplateInput.fieldName}
                                onChange={handleChangeFileTemplateInputValue(
                                  index
                                )}
                                value={fileTemplateInput.fieldValue}
                              />
                            </Col>
                          );
                        }
                      )}
                  </Row>
                </div>
              </Col>
              <Col className="gutter-row" span={14}>
                <div
                  className="d-flex w-100 justify-content-center align-items-center"
                  style={{ border: "1px solid black", height: 650 }}
                >
                  {loadingPdf ? (
                    <Spin size="large" tip="Đang tải..." />
                  ) : (
                    <iframe
                      src={pdfBlobUrl}
                      width="100%"
                      height="100%"
                      title={"Preview PDF"}
                    />
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
}
