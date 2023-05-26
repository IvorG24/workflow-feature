import { Button, ButtonProps } from "@mantine/core";
import { ButtonHTMLAttributes } from "react";

const ConfirmButton = ({
  children,
  ...props
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <Button size="md" fz={14} {...props}>
      {children}
    </Button>
  );
};
export default ConfirmButton;
