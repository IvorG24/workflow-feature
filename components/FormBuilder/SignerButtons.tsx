import { Button, Flex } from "@mantine/core";
import { MouseEventHandler } from "react";

type Props = {
  onApprove?: MouseEventHandler<HTMLButtonElement>;
  onReject?: MouseEventHandler<HTMLButtonElement>;
};

const SignerButtons = ({ onApprove, onReject }: Props) => {
  return (
    <Flex gap="xl" justify="center" mt="xl">
      <Button
        onClick={onReject}
        variant="outline"
        color="red"
        miw={100}
        size="md"
      >
        Reject
      </Button>
      <Button onClick={onApprove} miw={100} size="md">
        Approve
      </Button>
    </Flex>
  );
};

export default SignerButtons;
