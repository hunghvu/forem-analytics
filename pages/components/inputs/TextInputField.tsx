/**
 * @author Hung Vu
 *
 * This provides an autocomplete field for a given form.
 */

// React
import type { FC } from "react";

// MUI library
import { TextField } from "@mui/material";

// Utilities
import type { Control } from "react-hook-form";

// Components
import { Controller } from "react-hook-form";

interface TextInputFieldProps {
  name: string;
  control: Control<any, any> | undefined;
  label: string;
  errors: any;
  rules: any;
}

const TextInputField: FC<TextInputFieldProps> = ({ name, control, label, errors, rules }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules} // Must follow react hook form rules: https://react-hook-form.com/api/useform/register#options
      render={({ field: { onChange, value } }) => (
        <TextField
          variant="outlined"
          onChange={(event) => {
            onChange(event.target.value);
          }}
          name={name}
          value={value}
          label={label}
          error={!!errors?.[name]}
          helperText={(errors?.[name] && "Missing or invalid value.") ?? " "}
          required
          fullWidth
        />
      )}
    />
  );
};

export default TextInputField;
