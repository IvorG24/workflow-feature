import { Button, ButtonProps, Flex, FlexProps } from "@mantine/core";
import { FacebookIcon } from "./FacebookIcon";
import { GoogleIcon } from "./GoogleIcon";
import { TwitterIcon } from "./TwitterIcon";

type ButtonListProps = {
  flexProps?: FlexProps;
  buttonProps?: ButtonProps;
};

export const GoogleButton = (props: ButtonProps) => {
  return <Button leftIcon={<GoogleIcon />} {...props} />;
};

export const FacebookButton = (props: ButtonProps) => {
  return <Button leftIcon={<FacebookIcon color="#1877F2" />} {...props} />;
};

export const TwitterButton = (props: ButtonProps) => {
  return <Button leftIcon={<TwitterIcon color="#00acee" />} {...props} />;
};

const SocialMediaButtonList = (props: ButtonListProps) => {
  const { flexProps, buttonProps } = props;
  return (
    <Flex {...flexProps}>
      <FacebookButton {...buttonProps}>Facebook</FacebookButton>
      <GoogleButton {...buttonProps}>Google</GoogleButton>
      <TwitterButton {...buttonProps}>Twitter</TwitterButton>
    </Flex>
  );
};

export default SocialMediaButtonList;
