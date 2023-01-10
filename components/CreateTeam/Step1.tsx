import {
  Avatar,
  Button,
  FileInput,
  Group,
  Loader,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { upperCase } from "lodash";
import { Dispatch, MutableRefObject, SetStateAction } from "react";

type Props = {
  isChecking: boolean;
  teamName: string;
  handleTeamName: (value: string) => void;
  teamNameError: string;
  setActive: Dispatch<SetStateAction<number>>;
  logoInput: MutableRefObject<HTMLButtonElement | null>;
  teamLogo: Blob | MediaSource | null;
  setTeamLogo: Dispatch<SetStateAction<File | null>>;
};

const Step1 = ({
  isChecking,
  teamName,
  handleTeamName,
  teamNameError,
  setActive,
  logoInput,
  teamLogo,
  setTeamLogo,
}: Props) => {
  return (
    <Stack align="center" p="xl">
      <Group position="left" w="100%">
        <Title order={2}>Team Details</Title>
      </Group>
      <FileInput
        accept="image/png,image/jpeg"
        display="none"
        ref={logoInput}
        onChange={(e) => setTeamLogo(e)}
      />
      <Avatar
        size={150}
        radius={100}
        onClick={() => logoInput.current?.click()}
        style={{ cursor: "pointer" }}
        src={teamLogo && URL.createObjectURL(teamLogo)}
        alt="Team Logo"
      >
        {upperCase(teamName.slice(0, 2))}
      </Avatar>
      <TextInput
        placeholder="Team name"
        label="Team Name"
        w="100%"
        withAsterisk
        rightSection={isChecking && <Loader size="xs" />}
        value={teamName}
        onChange={(e) => handleTeamName(e.target.value)}
        error={teamNameError}
        data-cy="team-name"
      />
      <Group position="right" w="100%">
        <Button
          size="md"
          px={50}
          onClick={() => {
            if (!teamName) {
              handleTeamName("");
            } else if (!teamNameError) {
              setActive(1);
            }
          }}
          data-cy="team-submit"
        >
          Next
        </Button>
      </Group>
    </Stack>
  );
};

export default Step1;
