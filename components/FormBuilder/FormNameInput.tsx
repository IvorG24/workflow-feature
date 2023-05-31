import {
  Box,
  createStyles,
  Divider,
  TextInput,
  TextInputProps,
} from "@mantine/core";
import { useFormContext } from "react-hook-form";
import { FormBuilderData } from "./FormBuilder";

const useStyles = createStyles({
  formNameInput: {
    '& input[type="text"]': {
      fontWeight: 600,
      fontSize: 24,
    },
  },

  divider: {
    marginTop: "-8px",
  },
});

const FormNameInput = ({ ...props }: TextInputProps) => {
  const { classes } = useStyles();
  const {
    register,
    formState: { errors },
  } = useFormContext<FormBuilderData>();

  return (
    <Box>
      <TextInput
        variant="unstyled"
        size="xl"
        className={classes.formNameInput}
        aria-label="form name"
        error={errors?.formName?.message}
        placeholder="Form Name"
        {...props}
        {...register("formName", {
          required: "Form name is required",
          minLength: {
            value: 3,
            message: "Form name must be at least 3 characters",
          },
        })}
      />
      {!props.readOnly && <Divider className={classes.divider} />}
    </Box>
  );
};

export default FormNameInput;
