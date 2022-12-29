import { Button, Flex, Group, MultiSelect, Stack, Title } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import validator from "validator";
import { ArrowBack } from "../Icon";

type Props = {
  setActive: Dispatch<SetStateAction<number>>;
  members: string[];
  setMembers: Dispatch<SetStateAction<string[]>>;
  emailError: string;
  setEmailError: Dispatch<SetStateAction<string>>;
  handleCreateTeam: (action: "skip" | "invite") => void;
};

const Step1 = ({
  setActive,
  members,
  setMembers,
  emailError,
  setEmailError,
  handleCreateTeam,
}: Props) => {
  return (
    <Stack align="center" p="xl" miw={250}>
      <Group position="left" w="100%">
        <Title order={2}>Team Members</Title>
      </Group>
      <MultiSelect
        label="Invite Team Members"
        data={members}
        placeholder="Input emails"
        icon={"@"}
        searchable
        creatable
        getCreateLabel={(query) => {
          setEmailError("");
          return `+ Invite ${query}`;
        }}
        onCreate={(query) => {
          if (validator.isEmail(query)) {
            setMembers((current) => [...current, query]);
            return query;
          } else {
            setEmailError("Enter a valid email");
          }
        }}
        w="100%"
        error={emailError}
        data-cy="team-select-members"
      />
      <Flex align="center" justify="center" gap="xl">
        <Button variant="subtle" mr="auto" onClick={() => setActive(0)}>
          <ArrowBack />
        </Button>
        <Group position="center">
          <Button
            variant="outline"
            size="md"
            w={150}
            onClick={() => handleCreateTeam("skip")}
          >
            Skip
          </Button>
          <Button
            size="md"
            w={150}
            onClick={() => handleCreateTeam("invite")}
            data-cy="team-submit"
          >
            Done
          </Button>
        </Group>
      </Flex>
    </Stack>
  );
};

export default Step1;
