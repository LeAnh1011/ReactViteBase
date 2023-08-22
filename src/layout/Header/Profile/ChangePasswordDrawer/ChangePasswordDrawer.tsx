import { View, ViewOff } from "@carbon/icons-react";
import { useSetState } from "ahooks";
import { Col, Row } from "antd";
import { AxiosError } from "axios";
import appMessageService from "core/services/common-services/app-message-service";
import { utilService } from "core/services/common-services/util-service";
import { Profile, ProfileChangePassword } from "core/models/Profile";
import React from "react";
import { useTranslation } from "react-i18next";
import { Drawer, FormItem, InputText } from "react3l-ui-library";
import { profileRepository } from "core/repositories/ProfileRepository";
import { finalize } from "rxjs";

export interface ChangePasswordDrawerProps {
  profile?: Profile;
  visible?: boolean;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChangePasswordDrawer = (props: ChangePasswordDrawerProps) => {
  const { visible, profile, setVisible } = props;
  const [translate] = useTranslation();
  const [state, setState] = useSetState<ProfileChangePassword>(
    new ProfileChangePassword()
  );
  const [showOldPassword, seShowOldPassword] = React.useState<boolean>(false);
  const [showNewPassword, seShowNewPassword] = React.useState<boolean>(false);
  const [showVerifiedPassword, seShowVerifiedPassword] =
    React.useState<boolean>(false);
  const [loadingDrawer, setloadingDrawer] = React.useState<boolean>(false);
  const { notifyUpdateItemSuccess } = appMessageService.useCRUDMessage();

  const handleCreateRandomPassword = React.useCallback(() => {
    profileRepository.randomPassword().subscribe({
      next: (res: string) => {
        if (res) {
          setState({
            newPassword: res,
          });
        }
      },
    });
  }, [setState]);

  const handleSave = React.useCallback(() => {
    setloadingDrawer(true);
    profileRepository
      .changePassword(state)
      .pipe(
        finalize(() => {
          setloadingDrawer(false);
        })
      )
      .subscribe({
        next: (profileChangePassword: ProfileChangePassword) => {
          if (profileChangePassword) {
            setVisible(false);
            notifyUpdateItemSuccess({
              message: translate("general.toasts.success"),
              description: translate("general.toasts.changePassword"),
            });
          }
        },
        error: (err: AxiosError) => {
          if (err.response && err.response.status === 400)
            setState({ ...err.response?.data });
        },
      });
  }, [translate, notifyUpdateItemSuccess, setState, setVisible, state]);

  const handleCancel = React.useCallback(() => {
    setState({ ...new ProfileChangePassword(), errors: null });
    setVisible(false);
  }, [setState, setVisible]);

  const handleChangeField = React.useCallback(
    (fieldName: string) => (value: string) => {
      setState({ [fieldName]: value });
    },
    [setState]
  );

  return (
    <Drawer
      visible={visible}
      loading={loadingDrawer}
      handleSave={handleSave}
      handleCancel={handleCancel}
      handleClose={handleCancel}
      visibleFooter={true}
      title={translate("profile.changePassword.title")}
      titleButtonCancel={translate("general.actions.close")}
      titleButtonApply={translate("general.actions.save")}
      size={"lg"}
    >
      <div className="w-100 change-password-drawer__container p--sm">
        <form autoComplete="off">
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col lg={24}>
              <InputText
                label={translate("profile.changePassword.name")}
                type={0}
                value={profile.username}
                disabled
              />
            </Col>
            <Col lg={24} className="m-t--sm">
              <FormItem
                validateObject={utilService.getValidateObj(
                  state,
                  "oldPassword"
                )}
              >
                <InputText
                  label={translate("profile.changePassword.oldPassword")}
                  type={0}
                  typeInput={showOldPassword ? "text" : "password"}
                  value={state.oldPassword}
                  placeHolder={translate(
                    "profile.changePassword.oldPassword.placeholder"
                  )}
                  onChange={handleChangeField("oldPassword")}
                  isRequired
                  suffix={
                    <>
                      {showOldPassword ? (
                        <ViewOff
                          size={16}
                          onClick={(event) => {
                            seShowOldPassword(false);
                            event.stopPropagation();
                          }}
                        />
                      ) : (
                        <View
                          size={16}
                          onClick={(event) => {
                            seShowOldPassword(true);
                            event.stopPropagation();
                          }}
                        />
                      )}
                    </>
                  }
                />
              </FormItem>
            </Col>
            <Col lg={24} className="m-t--sm">
              <FormItem
                validateObject={utilService.getValidateObj(
                  state,
                  "newPassword"
                )}
              >
                <InputText
                  label={translate("profile.changePassword.newPassword")}
                  typeInput={showNewPassword ? "text" : "password"}
                  type={0}
                  value={state.newPassword}
                  placeHolder={translate(
                    "profile.changePassword.newPassword.placeholder"
                  )}
                  onChange={handleChangeField("newPassword")}
                  action={{
                    name: translate(
                      "profile.changePassword.createRandomPassword"
                    ),
                    action: handleCreateRandomPassword,
                  }}
                  suffix={
                    <>
                      {showNewPassword ? (
                        <ViewOff
                          size={16}
                          onClick={(event) => {
                            seShowNewPassword(false);
                            event.stopPropagation();
                          }}
                        />
                      ) : (
                        <View
                          size={16}
                          onClick={(event) => {
                            seShowNewPassword(true);
                            event.stopPropagation();
                          }}
                        />
                      )}
                    </>
                  }
                  isRequired
                />
              </FormItem>
              <div className="warning-password-rule m-t--3xs">
                <span>
                  {translate("profile.changePasswordPage.ruleOfPassword")}
                </span>
              </div>
            </Col>
            <Col lg={24} className="m-t--sm">
              <FormItem
                validateObject={utilService.getValidateObj(
                  state,
                  "verifyNewPassword"
                )}
              >
                <InputText
                  label={translate("profile.changePassword.verifyNewPassword")}
                  type={0}
                  typeInput={showVerifiedPassword ? "text" : "password"}
                  value={state.verifyNewPassword}
                  placeHolder={translate(
                    "profile.changePassword.verifyNewPassword.placeholder"
                  )}
                  onChange={handleChangeField("verifyNewPassword")}
                  suffix={
                    <>
                      {showVerifiedPassword ? (
                        <ViewOff
                          size={16}
                          onClick={(event) => {
                            seShowVerifiedPassword(false);
                            event.stopPropagation();
                          }}
                        />
                      ) : (
                        <View
                          size={16}
                          onClick={(event) => {
                            seShowVerifiedPassword(true);
                            event.stopPropagation();
                          }}
                        />
                      )}
                    </>
                  }
                  isRequired
                />
              </FormItem>
            </Col>
          </Row>
        </form>
      </div>
    </Drawer>
  );
};

export default ChangePasswordDrawer;
