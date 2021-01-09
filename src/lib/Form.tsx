import React from "react";

export enum DefaultValidatorKeys {
  Required = "REQUIRED",
}

export enum DefaultFormatterKeys {
  Text = "TEXT",
}

export type DefaultFieldValues =
  | boolean
  | Date
  | number
  | string
  | undefined
  | null;

export type ValidatorMap<K extends string, V extends DefaultFieldValues> = {
  [P in K]: (v: V) => string | true;
};

export type FormatterMap<F extends string, V extends DefaultFieldValues> = {
  [K in F]: {
    mask: (v: V) => string;
    unmask: (d: string) => V;
  };
};

export type FactoryConfig<
  K extends string,
  V extends DefaultFieldValues,
  F extends string
> = {
  validatorMap: ValidatorMap<K, V>;
  formatterMap: FormatterMap<F, V>;
};

export type Entity<V> = Record<string, V>;

export type FieldConfigMap<E, T, V> = {
  [K in keyof E]: {
    type: keyof T;
    validators: (keyof V)[];
  };
};

export type FieldControlMap<E> = {
  [K in keyof E]: {
    isPristine: boolean;
    errors: string[];
    rawValue: E[K];
    displayValue: string;
  };
};

export type FormHookAPI<E> = {
  isValid: boolean;
  fieldControls: FieldControlMap<E>;
  setFieldControls: React.Dispatch<React.SetStateAction<FieldControlMap<E>>>;
  updateField: (key: keyof E, value: string) => void;
  entity: E;
};

export const defaultValidatorMap: ValidatorMap<
  DefaultValidatorKeys,
  DefaultFieldValues
> = {
  [DefaultValidatorKeys.Required]: (v) => {
    const errMsg = "This field is required";
    return v == null
      ? errMsg
      : typeof v === "string"
      ? v === ""
        ? errMsg
        : true
      : true /** add more type checks here */;
  },
};

export const defaultFormatterMap: FormatterMap<
  DefaultFormatterKeys,
  DefaultFieldValues
> = {
  [DefaultFormatterKeys.Text]: {
    mask: (v) => (v == null ? "" : String(v)),
    unmask: (s) => s || null,
  }
};

export const useFormFactory = <
  K extends string,
  V extends DefaultFieldValues,
  F extends string
>(
  factoryConfig: FactoryConfig<K, V, F>
) => {
  return <E extends Entity<V>>(
    fieldConfigMap: FieldConfigMap<E, FormatterMap<F, V>, ValidatorMap<K, V>>,
    entity: E
  ): FormHookAPI<E> => {
    const generateDisplayValue = (formatter: F, newValue: V): string => {
      return factoryConfig.formatterMap[formatter].mask(newValue);
    };

    const generateFieldErrors = (validators: K[], newValue: V): string[] => {
      return validators.reduce<string[]>((e, k) => {
        const result = factoryConfig.validatorMap[k](newValue);
        return typeof result === "string" ? [...e, result] : e;
      }, []);
    };

    const generateEntityFromFieldControlMap = (
      fieldControlMap: FieldControlMap<E>
    ): E => {
      const output = {} as E;

      for (const key in fieldConfigMap) {
        output[key] = fieldControlMap[key].rawValue;
      }

      return output;
    };

    const generateInitialFieldControls = () => {
      const output = {} as FieldControlMap<E>;

      for (const k in fieldConfigMap) {
        const fieldConfig = fieldConfigMap[k];
        const rawValue = entity[k];
        const displayValue = generateDisplayValue(fieldConfig.type, rawValue);
        const errors = generateFieldErrors(fieldConfig.validators, rawValue);

        output[k] = {
          isPristine: true,
          rawValue,
          displayValue,
          errors,
        };
      }

      return output;
    };

    const [fieldControls, setFieldControls] = React.useState(
      generateInitialFieldControls()
    );

    const validateForm = (): boolean => {
      for (const k in fieldControls) {
        if (fieldControls[k].errors.length) return false;
      }
      return true;
    };

    const updateField = (key: keyof E, value: string): void => {
      const rawValue = factoryConfig.formatterMap[
        fieldConfigMap[key].type
      ].unmask(value);
      setFieldControls({
        ...fieldControls,
        [key]: {
          isPristine: false,
          rawValue,
          errors: generateFieldErrors(fieldConfigMap[key].validators, rawValue),
          displayValue: generateDisplayValue(
            fieldConfigMap[key].type,
            rawValue
          ),
        },
      });
    };

    return {
      isValid: validateForm(),
      fieldControls,
      setFieldControls,
      updateField,
      entity: generateEntityFromFieldControlMap(fieldControls),
    };
  };
};


export const Form: React.FC<
  React.PropsWithChildren<Record<string, unknown>>
> = (props) => {
  return <form>{props.children}</form>;
};
