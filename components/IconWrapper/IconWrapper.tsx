import { Container, ContainerProps } from "@mantine/core";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  fontSize?: number;
  color?: string | "dimmed" | "inherit";
} & ContainerProps;

const IconWrapper = ({
  children,
  color = "inherit",
  fontSize,
  ...props
}: Props) => {
  const getColor = (color: string) => {
    switch (color) {
      case "dimmed":
        return "#868E96";
      default:
        return color;
    }
  };
  return (
    <Container
      m={0}
      p={0}
      {...props}
      sx={() => ({
        fontSize: fontSize,
        color: getColor(color),
        display: "inline-flex",
      })}
    >
      {children}
    </Container>
  );
};

export default IconWrapper;
