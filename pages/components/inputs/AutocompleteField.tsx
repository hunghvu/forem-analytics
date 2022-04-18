/**
 * @author Hung Vu
 *
 * This provides an autocomplete field for a given form.
 */

// React
import type { FC } from "react";

// Next
import Image from "next/image";

// MUI library
import { Autocomplete, Box, TextField } from "@mui/material";

// Utilities
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

interface AutocompleteFieldProps {
  name: string;
  control: Control<any, any> | undefined;
  options: string[];
  label: string;
  errors: any;
  iconUrl?: string;
}

const AutocompleteField: FC<AutocompleteFieldProps> = ({ name, control, options, label, errors, iconUrl }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: true }}
      render={({ field: { onChange, value } }) => (
        <Autocomplete
          disablePortal
          options={options}
          onChange={(_event, item) => {
            onChange(item);
          }}
          value={value}
          renderOption={(props, option) =>
            iconUrl ? (
              <Box component="li" {...props}>
                <Image src={iconUrl} width={24} height={24} />
                {option}
              </Box>
            ) : null
          }
          renderInput={(params) => (
            <TextField
              variant="outlined"
              {...params}
              label={label}
              error={!!errors?.[name]}
              helperText={errors?.[name] && "Field is required."}
              required
            />
          )}
        />
      )}
    />
  );
};

export default AutocompleteField;
