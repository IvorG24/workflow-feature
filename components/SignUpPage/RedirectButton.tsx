import { Button, ButtonProps, Text } from "@mantine/core";
import Link from "next/link";

type ButtonRedirectProps = {
  link: string;
  label: string;
  highlightLabel?: string;
  buttonProps?: ButtonProps;
};

const RedirectButton = (props: ButtonRedirectProps) => {
  return (
    <Link href={props.link}>
      <Button
        {...props.buttonProps}
        variant="default"
        size="sm"
        w="100%"
        fz={12}
        style={{ border: "none" }}
      >
        <Text>
          {props.label}{" "}
          <Text span fw="bold">
            {props.highlightLabel}
          </Text>
        </Text>
      </Button>
    </Link>
  );
};

export default RedirectButton;
