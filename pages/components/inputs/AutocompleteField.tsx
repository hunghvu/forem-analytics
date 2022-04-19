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
import type { Control } from "react-hook-form";

// Components
import { Controller } from "react-hook-form";

interface AutocompleteFieldProps {
  name: string;
  control: Control<any, any> | undefined;
  options: any;
  label: string;
  errors: any;
}

const AutocompleteField: FC<AutocompleteFieldProps> = ({ name, control, options, label, errors }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: true }}
      render={({ field: { onChange, value } }) => (
        <Autocomplete
          disablePortal
          options={options}
          onChange={(_, item) => {
            onChange(item);
          }}
          value={value}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          renderOption={(props, option) =>
            option.iconUrl ? (
              <Box component="li" {...props}>
                <Box style={{ marginRight: 12 }}>
                  <Image src={option.iconUrl} alt={options.label} width={20} height={20} style={{ marginRight: 24 }} />
                </Box>
                {option.label}
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
