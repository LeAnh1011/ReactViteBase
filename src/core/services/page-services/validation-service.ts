import React from "react";
import { Model } from "react3l-common";
import { utilService } from "core/services/common-services/util-service";
import * as yup from "yup";
import * as i18n from "i18next";
import { ValidResult } from "../service-types";
import { TypedSchema } from "yup/lib/util/types";

export const validationService = {
  /**
   *
   * react hook for validation form field
   * @param: model: Model
   * @param: modelSchema: yup.InferType<any>
   *
   * @return: { isValidModel,
      validateModel,
      mappingErrors }
   *
   * */
  useValidation: (model: Model, modelSchema: yup.ObjectSchema<Model>) => {
    const isValidModel: boolean = React.useMemo(() => {
      const modelValue = { ...model };
      return modelSchema.isValidSync(modelValue);
    }, [model, modelSchema]);

    const mappingErrors = React.useCallback(
      (yupErrors: yup.ValidationError): { [name: string]: string } => {
        const errors = yupErrors.inner.reduce(
          (acc, error: yup.ValidationError) => {
            if (/\[(\w+)\]./g.test(error.path)) {
              return utilService.convertPathString(
                error.path,
                { ...acc },
                error.errors.join(", ")
              );
            }
            return {
              ...acc,
              [error.path]: error.errors.join(", "),
            };
          },
          {}
        );
        return errors;
      },
      []
    );

    const validateModel: (model: Model) => Promise<unknown> = React.useCallback(
      (model: Model) => {
        const promise = new Promise((resolve, reject) => {
          modelSchema
            .validate(model)
            .then((res: Model) => {
              if (res) resolve(res);
            })
            .catch((yupErrors: yup.ValidationError) => {
              const errors = mappingErrors(yupErrors);
              reject(errors);
            });
        });
        return promise;
      },
      [mappingErrors, modelSchema]
    );

    return {
      isValidModel,
      validateModel,
      mappingErrors,
    };
  },

  /**
   *
   * react hook for create handle validate field
   * @param: modelSchema: yup.InferType<any>
   *
   * @return: { handleValidateField,
      schema}
   *
   * */
  useValidatorAction: (modelSchema: yup.ObjectSchema<Model>) => {
    const schema = React.useMemo(() => {
      return modelSchema;
    }, [modelSchema]);

    const handleValidateField = React.useCallback(
      (validatorPath: string, value: unknown): ValidResult => {
        if (validatorPath) {
          const schemaField: yup.InferType<TypedSchema> = yup.reach(
            schema,
            validatorPath
          );
          try {
            schemaField.validateSync(value);
            return {
              isValid: true,
              errorMessage: null,
            };
          } catch (err: unknown) {
            const errors = (err as yup.ValidationError).errors.map(
              (err: string | { key: string; value: unknown }) => {
                if (err && typeof err === "string") {
                  return i18n.t(err);
                } else {
                  const errorValue = err as { key: string; value: unknown };
                  return i18n.t(errorValue.key, { value: errorValue.value });
                }
              }
            );
            const errorMessage = errors.join(", ");
            return {
              isValid: false,
              errorMessage,
            };
          }
        }
      },
      [schema]
    );

    return {
      schema,
      handleValidateField,
    };
  },
};
