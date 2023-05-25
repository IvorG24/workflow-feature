import { Button, ButtonProps, Center } from "@mantine/core";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: () => void;
} & ButtonProps;

const SubmitButton = ({ children, ...props }: Props) => {
  return (
    <Center>
      <Button size="md" type="submit" {...props}>
        {children}
      </Button>
    </Center>
  );
};

export default SubmitButton;
