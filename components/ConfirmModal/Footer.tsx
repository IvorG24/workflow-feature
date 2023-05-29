import { Flex, FlexProps, Group } from "@mantine/core";

const Footer = ({ children, ...props }: FlexProps) => {
  return (
    <Flex justify="flex-end" mt={32} {...props}>
      <Group>{children}</Group>
    </Flex>
  );
};

export default Footer;
