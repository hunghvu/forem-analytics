/**
 * @author Hung Vu
 *
 * This provides a radio button group for a given form.
 */

// React
import type { FC } from "react";

// MUI library
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";

// Utilities
import type { Control } from "react-hook-form";

// Components
import { Controller } from "react-hook-form";

interface RadioButtonFieldProps {
  id: string;
  name: string;
  control: Control<any, any> | undefined;
  label: string;
  rules: any;
  choices: { choiceValue: string; choiceLabel: string }[];
}

const RadioButtonField: FC<RadioButtonFieldProps> = ({ name, control, label, rules, choices }) => {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
      <Controller
        name={name}
        control={control}
        rules={rules} // Must follow react hook form rules: https://react-hook-form.com/api/useform/register#options
        render={({ field }) => (
          <RadioGroup row {...field}>
            {choices.map((item) => (
              <FormControlLabel value={item.choiceValue} control={<Radio />} label={item.choiceLabel} key={item.choiceValue} />
            ))}
          </RadioGroup>
        )}
      />
    </FormControl>
  );
};

export default RadioButtonField;
