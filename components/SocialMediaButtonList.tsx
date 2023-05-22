import { Button, ButtonProps, Flex, FlexProps } from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandGoogle,
  IconBrandTwitter,
} from "@tabler/icons-react";

type ButtonListProps = {
  flexProps?: FlexProps;
  buttonProps?: ButtonProps;
};

export const GoogleButton = (props: ButtonProps) => {
  return <Button leftIcon={<IconBrandGoogle />} {...props} />;
};

export const FacebookButton = (props: ButtonProps) => {
  return <Button leftIcon={<IconBrandFacebook />} {...props} />;
};

export const TwitterButton = (props: ButtonProps) => {
  return (
    <Button leftIcon={<IconBrandTwitter />} variant="outline" {...props} />
  );
};

const SocialMediaButtonList = (props: ButtonListProps) => {
  const { flexProps, buttonProps } = props;
  return (
    <Flex {...flexProps}>
      <GoogleButton {...buttonProps}>Google</GoogleButton>
      <FacebookButton {...buttonProps}>Facebook</FacebookButton>
      <TwitterButton {...buttonProps}>Twitter</TwitterButton>
    </Flex>
  );
};

export default SocialMediaButtonList;
