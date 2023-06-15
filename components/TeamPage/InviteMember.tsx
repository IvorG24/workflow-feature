import {
  Button,
  Container,
  Divider,
  Flex,
  LoadingOverlay,
  MultiSelect,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMailPlus, IconUsersPlus } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import validator from "validator";

type Props = {
  isInvitingMember: boolean;
  onInviteMember: () => void;
  memberEmailList: string[];
  emailList: string[];
  onSetEmailList: Dispatch<SetStateAction<string[]>>;
};

const InviteMember = ({
  isInvitingMember,
  onInviteMember,
  memberEmailList,
  emailList,
  onSetEmailList,
}: Props) => {
  const [emailListData, setEmailListData] = useState<
    { value: string; label: string }[]
  >([]);

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isInvitingMember}
        overlayBlur={2}
        transitionDuration={500}
      />

      <Paper p="lg" shadow="xs">
        <Stack spacing={12}>
          <Text weight={600}>Invite Member</Text>

          <Divider mt={-12} />

          <Text size={14} mb={12}>
            Invite will be sent via email. If the user is already registered,
            they will receive a notification within the app.
          </Text>

          <Flex direction={{ base: "column", sm: "row" }} gap={12}>
            <MultiSelect
              data={emailListData}
              placeholder="juandelacruz@email.ph"
              searchable
              creatable
              clearable
              clearSearchOnChange
              onChange={onSetEmailList}
              getCreateLabel={(query) => (
                <Flex align="center" gap={4}>
                  <IconMailPlus size={14} />
                  <Text>{query}</Text>
                </Flex>
              )}
              shouldCreate={(query: string) => {
                const isEmail = validator.isEmail(query);
                const isAddedAlready = emailListData
                  .map((email) => email.value)
                  .includes(query);
                return isEmail && !isAddedAlready;
              }}
              onCreate={(query) => {
                let valid = true;
                const isMemberAlready = memberEmailList.includes(query);
                if (isMemberAlready) {
                  notifications.show({
                    message: "A member with this email already exists.",
                    color: "orange",
                  });
                  valid = false;
                }

                if (valid) {
                  const item = { value: query, label: query };
                  setEmailListData((current) => [...current, item]);
                  return item;
                }
              }}
              w="100%"
            />

            <Button
              onClick={() => {
                onInviteMember();
                setEmailListData([]);
              }}
              leftIcon={<IconUsersPlus size={14} />}
              disabled={emailList.length <= 0}
            >
              Invite
            </Button>
          </Flex>
        </Stack>
      </Paper>
    </Container>
  );
};

export default InviteMember;
