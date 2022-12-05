import { Avatar, Container, Flex, Text, UnstyledButton } from "@mantine/core";
import { MouseEventHandler } from "react";
import { Close } from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";

type Props = {
  email: string;
  onRemove: MouseEventHandler<HTMLButtonElement>;
};

const InvitedEmail = ({ email, onRemove }: Props) => {
  return (
    <Container fluid p="xs">
      <Flex justify="space-between" align="center">
        <Flex justify="start" align="center" gap="sm">
          <Avatar radius="lg" size="sm" src="" alt={email} />
          <Text>{email}</Text>
        </Flex>
        <UnstyledButton onClick={onRemove}>
          <IconWrapper>
            <Close />
          </IconWrapper>
        </UnstyledButton>
      </Flex>
    </Container>
  );
};

export default InvitedEmail;
