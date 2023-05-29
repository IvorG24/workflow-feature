import { Button, ButtonProps } from "@mantine/core";
import { ButtonHTMLAttributes } from "react";

const CancelButton = ({
  children,
  ...props
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <Button size="md" variant="subtle" aria-label="cancel" fz={14} {...props}>
      {children}
    </Button>
  );
};

export default CancelButton;
