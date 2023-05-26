import { Text, TextProps } from "@mantine/core";

const Description = ({ children, ...props }: TextProps) => {
  return (
    <Text mt={8} {...props}>
      {children}
    </Text>
  );
};
export default Description;
