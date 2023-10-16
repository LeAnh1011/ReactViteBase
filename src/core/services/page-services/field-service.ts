import type { Moment } from "moment";
import { Dispatch, useMemo, useCallback } from "react";
import { Model } from "react3l-common";
import memoize from "fast-memoize";
import * as yup from "yup";
import {
  ConfigField,
  GeneralAction,
  GeneralActionEnum,
  ValidationField,
} from "../service-types";

export const fieldService = {
  /**
   *
   * react hook for handle actions to change form field
   * @param: model: T
   * @param: dispatch: Dispatch<GeneralAction<T>>
   *
   * @return: { value,
      handleChangeSingleField,
      handleChangeSelectField,
      handleChangeMultipleSelectField,
      handleChangeDateField,
      handleChangeTreeField,
      handleChangeListField,
      handleChangeAllField, }
   *
   * */
  useField<T extends Model>(model: T, dispatch: Dispatch<GeneralAction<T>>) {
    const value = useMemo(() => model, [model]);

    /** Handler for validate value in another handle action
     */
    const handleValidateField = useCallback(
      (validator: ValidationField, fieldName: string, value: unknown) => {
        if (validator && validator.isValidator && validator.schema) {
          if (validator.path) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const schemaField: yup.InferType<any> = yup.reach(
                validator.schema,
                validator.path
              );
              const result = schemaField.validateSync(value);
              if (result instanceof yup.ValidationError) {
                const errorMessage = result.errors.join(", ");
                dispatch({
                  type: GeneralActionEnum.UPDATE_ERRORS,
                  errors: {
                    [fieldName as string]: errorMessage,
                  },
                });
                return false;
              }
            } catch (error) {
              return true;
            }
          } else {
            const result = validator.schema.validateSync(value);
            if (result instanceof yup.ValidationError) {
              const errors = result.inner.reduce((acc, error) => {
                return {
                  ...acc,
                  [error.path]: error.errors.join(", "),
                };
              }, {});
              dispatch({
                type: GeneralActionEnum.UPDATE_ERRORS,
                errors: {
                  ...errors,
                },
              });
            }
          }
        }
        return true;
      },
      [dispatch]
    );

    /** Handler for changing a bool field in field
     */
    const handleChangeBoolField = useMemo(
      () =>
        memoize((config: ConfigField) => (value: boolean) => {
          const { fieldName, validator } = config;
          const isValid = handleValidateField(
            validator,
            fieldName as string,
            value
          );
          if (isValid) {
            let convertedValue;
            if (value) {
              convertedValue = 1;
            } else {
              convertedValue = 0;
            }
            dispatch({
              type: GeneralActionEnum.UPDATE,
              payload: {
                [fieldName as string]: convertedValue,
              } as T,
            });
          }
        }),
      [dispatch, handleValidateField]
    );

    /** Handler for changing a single field in field
     */
    const handleChangeSingleField = useMemo(
      () =>
        memoize((config: ConfigField) => (value: string | number | boolean) => {
          const { fieldName, validator, sideEffectFunc } = config;
          const isValid = handleValidateField(
            validator,
            fieldName as string,
            value
          );
          if (isValid) {
            dispatch({
              type: GeneralActionEnum.UPDATE,
              payload: {
                [fieldName as string]: value,
              } as T,
            });
            if (typeof sideEffectFunc !== "undefined") {
              sideEffectFunc();
            }
          }
        }),
      [dispatch, handleValidateField]
    );

    /**
      Handler specifically used for Select component 
    */
    const handleChangeSelectField = useMemo(
      () =>
        memoize((config: ConfigField) => (idValue: number, value: Model) => {
          const { fieldName, validator, sideEffectFunc } = config;
          const isValid = handleValidateField(
            validator,
            `${fieldName}Id`,
            value
          );
          if (isValid) {
            dispatch({
              type: GeneralActionEnum.UPDATE,
              payload: {
                [fieldName as string]: value,
                [`${fieldName}Id`]: idValue,
              } as T,
            });
            if (typeof sideEffectFunc !== "undefined") {
              sideEffectFunc();
            }
          }
        }),
      [dispatch, handleValidateField]
    );

    /**
      Handler specifically used for MultipleSelect component 
    */
    const handleChangeMultipleSelectField = useMemo(
      () =>
        memoize((config: ConfigField) => (values: Model[]) => {
          const { fieldName, validator, sideEffectFunc } = config;
          const isValid = handleValidateField(
            validator,
            `${fieldName}Id`,
            values
          );
          if (values && isValid) {
            const listIds =
              values.length > 0 ? values.map((current) => current.id) : [];
            dispatch({
              type: GeneralActionEnum.UPDATE,
              payload: {
                [fieldName as string]: [...values],
                [`${fieldName}Id`]: [...listIds],
              } as T,
            });
            if (typeof sideEffectFunc !== "undefined") {
              sideEffectFunc();
            }
          }
        }),
      [dispatch, handleValidateField]
    );

    /**
      Handler specifically used for Date component 
    */
    const handleChangeDateField = useMemo(
      () =>
        memoize((config: ConfigField) => (date: Moment | [Moment, Moment]) => {
          const { fieldName, validator, sideEffectFunc } = config;
          if (date instanceof Array && fieldName instanceof Array) {
            dispatch({
              type: GeneralActionEnum.UPDATE,
              payload: {
                [fieldName[0]]: date[0],
                [fieldName[1]]: date[1],
              } as T,
            });
            if (typeof sideEffectFunc !== "undefined") {
              sideEffectFunc();
            }
          } else {
            const isValid = handleValidateField(
              validator,
              fieldName as string,
              date
            );
            if (isValid) {
              dispatch({
                type: GeneralActionEnum.UPDATE,
                payload: {
                  [fieldName as string]: date,
                } as T,
              });
              if (typeof sideEffectFunc !== "undefined") {
                sideEffectFunc();
              }
            }
          }
        }),
      [dispatch, handleValidateField]
    );

    /**
      Handler to overwrite the whole field
    */

    const handleChangeTreeField = useMemo(
      () =>
        memoize(
          <Values extends Model>(config: ConfigField) =>
            (values: Values[], isMultiple: boolean) => {
              const { fieldName, validator, sideEffectFunc } = config;
              const isValid = handleValidateField(
                validator,
                fieldName as string,
                values
              );
              if (isValid) {
                if (isMultiple) {
                  dispatch({
                    type: GeneralActionEnum.UPDATE,
                    payload: {
                      [fieldName as string]: [...values],
                    } as T,
                  });
                } else {
                  dispatch({
                    type: GeneralActionEnum.UPDATE,
                    payload: {
                      [fieldName as string]: [...values][0],
                      [`${fieldName}Id`]: [...values][0]?.id,
                    } as T,
                  });
                }
                if (typeof sideEffectFunc !== "undefined") {
                  sideEffectFunc();
                }
              }
            }
        ),
      [dispatch, handleValidateField]
    );

    /**
      Handler to change table content data
    */
    const handleChangeListField = useMemo(
      () =>
        memoize((config: ConfigField) => (data: unknown[] = []) => {
          const { fieldName, sideEffectFunc } = config;
          dispatch({
            type: GeneralActionEnum.UPDATE,
            payload: {
              [fieldName as string]: [...data],
            } as T,
          });
          if (typeof sideEffectFunc !== "undefined") {
            sideEffectFunc();
          }
        }),
      [dispatch]
    );

    /**
     * Handler to change mapping data
     */

    const handleChangeMappingField = useMemo(
      () =>
        memoize(
          <TValues extends Model>(
              fieldNameMapping: string,
              fieldName: string,
              sideEffectFunc?: () => void,
              validator?: ValidationField
            ) =>
            (values: TValues[]) => {
              const isValid = handleValidateField(
                validator,
                fieldNameMapping as string,
                values
              );
              if (values && isValid) {
                const valuesMappings =
                  values &&
                  values?.length > 0 &&
                  values.map((value) => {
                    return {
                      [fieldName as string]: value,
                      [`${fieldName}Id`]: value?.id,
                    };
                  });
                dispatch({
                  type: GeneralActionEnum.UPDATE,
                  payload: {
                    [fieldNameMapping as string]: valuesMappings,
                  } as T,
                });
                if (typeof sideEffectFunc !== "undefined") {
                  sideEffectFunc();
                }
              }
            }
        ),
      [dispatch, handleValidateField]
    );

    /**
      Handler to change multiple field
    */
    const handleChangeMultipleField = useCallback(
      (payload: T) => {
        dispatch({
          type: GeneralActionEnum.UPDATE,
          payload,
        });
      },
      [dispatch]
    );

    /**
      Handler to overwrite the whole field
    */
    const handleChangeAllField = useCallback(
      (data: T) => {
        dispatch({
          type: GeneralActionEnum.SET,
          payload: data,
        });
      },
      [dispatch]
    );

    return {
      value,
      handleChangeBoolField,
      handleChangeSingleField,
      handleChangeSelectField,
      handleChangeMultipleSelectField,
      handleChangeDateField,
      handleChangeTreeField,
      handleChangeListField,
      handleChangeAllField,
      handleChangeMappingField,
      handleChangeMultipleField,
    };
  },
};
