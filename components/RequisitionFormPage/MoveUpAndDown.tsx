import { ActionIcon, Stack } from "@mantine/core";
import {
  IconArrowBigDownFilled,
  IconArrowBigUpFilled,
} from "@tabler/icons-react";
import { MouseEventHandler } from "react";

type Props = {
  canUp: boolean;
  canDown: boolean;
  onUp: MouseEventHandler<HTMLButtonElement>;
  onDown: MouseEventHandler<HTMLButtonElement>;
};

const MoveUpAndDown = ({ canUp, canDown, onUp, onDown }: Props) => {
  return (
    <Stack spacing={5}>
      {canUp && (
        <ActionIcon onClick={onUp} variant="light" color="blue" size={20}>
          <IconArrowBigUpFilled size={12} />
        </ActionIcon>
      )}
      {canDown && (
        <ActionIcon onClick={onDown} variant="light" color="blue" size={20}>
          <IconArrowBigDownFilled size={12} />
        </ActionIcon>
      )}
    </Stack>
  );
};

export default MoveUpAndDown;
