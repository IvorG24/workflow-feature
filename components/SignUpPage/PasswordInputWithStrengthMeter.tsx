import { Box, PasswordInput, Popover, Progress, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { SignUpFormValues } from "./SignUpPage";

function PasswordRequirement({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) {
  return (
    <Text
      color={meets ? "teal" : "red"}
      sx={{ display: "flex", alignItems: "center" }}
      mt={7}
      size="sm"
    >
      {meets ? <IconCheck size="0.9rem" /> : <IconX size="0.9rem" />}{" "}
      <Box ml={10}>{label}</Box>
    </Text>
  );
}

const requirements = [
  { re: /[0-9]/, label: "Includes number" },
  { re: /[a-z]/, label: "Includes lowercase letter" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  {
    re: /[$&+,:;=?@#|'<>.^*()%!-]/,
    label: "Includes special symbol (e.g: $&+,:;=?@#|'<>.^*()%!-)",
  },
];

function getStrength(password: string) {
  let multiplier = password?.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

const PasswordInputWithStrengthMeter = ({
  label = "Password",
}: {
  label?: string;
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignUpFormValues>();
  const passwordValue = useWatch({ name: "password" });
  const [popoverOpened, setPopoverOpened] = useState(false);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(passwordValue)}
    />
  ));

  const strength = getStrength(passwordValue);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  return (
    <Box>
      <Popover
        opened={popoverOpened}
        position="bottom"
        width="target"
        transitionProps={{ transition: "pop" }}
      >
        <Popover.Target>
          <div
            onFocusCapture={() => setPopoverOpened(true)}
            onBlurCapture={() => setPopoverOpened(false)}
          >
            <PasswordInput
              label={label}
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password", {
                required:
                  "Password field cannot be empty. Please enter your password.",
                minLength: {
                  value: 6,
                  message: "Password must have atleast 6 characters.",
                },
                validate: {
                  haveLowerCase: (value) =>
                    /[a-z]/.test(value) ||
                    "Password must have atleast one lowercase letter.",
                  haveUpperCase: (value) =>
                    /[A-Z]/.test(value) ||
                    "Password must have atleast one uppercase letter.",
                  haveSpecialSymbol: (value) =>
                    /[$&+,:;=?@#|'<>.^*()%!-]/.test(value) ||
                    "Password must have a special symbol.",
                },
              })}
            />
          </div>
        </Popover.Target>
        <Popover.Dropdown>
          <Progress color={color} value={strength} size={5} mb="xs" />
          <PasswordRequirement
            label="Includes at least 6 characters"
            meets={passwordValue?.length > 5}
          />
          {checks}
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
};

export default PasswordInputWithStrengthMeter;
