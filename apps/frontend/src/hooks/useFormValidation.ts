import { useState, useCallback, useMemo } from "react";

export interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

export interface FormFieldConfig {
  initialValue: unknown;
  rules?: ValidationRule[];
}

export interface UseFormValidationReturn {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setValue: (field: string, value: unknown) => void;
  setTouched: (field: string, touched: boolean) => void;
  validate: () => boolean;
  validateField: (field: string) => boolean;
  reset: () => void;
  isValid: boolean;
}

/**
 * Custom hook for form validation
 * Manages form values, errors, and touched state with configurable validation rules
 */
export function useFormValidation(
  config: Record<string, FormFieldConfig>
): UseFormValidationReturn {
  const initialValues = useMemo(() => {
    const result: Record<string, unknown> = {};
    Object.keys(config).forEach((key) => {
      result[key] = config[key].initialValue;
    });
    return result;
  }, [config]);

  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setValue = useCallback((field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const setTouchedField = useCallback((field: string, touched: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: touched }));
  }, []);

  const validateField = useCallback(
    (field: string): boolean => {
      const fieldConfig = config[field];
      if (!fieldConfig?.rules) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
        return true;
      }

      for (const rule of fieldConfig.rules) {
        if (!rule.validate(values[field])) {
          setErrors((prev) => ({ ...prev, [field]: rule.message }));
          return false;
        }
      }

      setErrors((prev) => ({ ...prev, [field]: "" }));
      return true;
    },
    [config, values]
  );

  const validate = useCallback((): boolean => {
    let isValid = true;
    Object.keys(config).forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  }, [config, validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = useMemo(() => {
    return Object.values(errors).every((error) => !error);
  }, [errors]);

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched: setTouchedField,
    validate,
    validateField,
    reset,
    isValid,
  };
}
