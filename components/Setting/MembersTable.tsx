// todo: create unit test
import {
  Avatar as MantineAvatar,
  Box,
  Button,
  Flex,
  Group,
  Pagination,
  Select,
  Stack,
  Text,
} from "@mantine/core";

import SvgArrowDropDown from "@/components/Icon/ArrowDropDown";
import { useRouter } from "next/router";
import SvgMoreHoriz from "../Icon/MoreHoriz";
import { Member } from "./Member";

type Props = {
  filteredMembers: Member[];
};

const MembersTable = ({ filteredMembers }: Props) => {
  const router = useRouter();

  return (
    <Stack justify="space-between" mih="400px" py="xl">
      {
        // JC: Change the properties to match fetched member data
        filteredMembers.map(({ id, name, email, role, image }) => {
          return (
            <Group
              position="apart"
              key={id}
              // JC: Propose to move this onClick function to MantineAvatar and Text/name
              // Reason: the Select input and MoreOptions button should not redirect to user profile
              onClick={() => router.push(`/profiles/${id}`)}
              sx={{ borderTop: "1px solid #E9E9E9" }}
              pt="sm"
            >
              <Flex gap="sm" direction="row">
                <MantineAvatar
                  size={40}
                  radius={40}
                  src={image}
                  alt={`${name}'s Formsly Avatar`}
                />
                <Box>
                  <Text fw="bold" color="dark">
                    {name}
                  </Text>
                  <Text fz="xs">{email}</Text>
                  <Select
                    value={role}
                    onChange={(e) => console.log(e)}
                    data={[
                      { value: "admin", label: "Admin" },
                      { value: "manager", label: "Manager" },
                      { value: "member", label: "Member" },
                    ]}
                    radius={4}
                    size="xs"
                    w="90px"
                    mt="xs"
                    rightSection={<SvgArrowDropDown />}
                    rightSectionWidth={20}
                    readOnly
                  />
                </Box>
              </Flex>
              <Button variant="subtle" size="xs" color="dark" fz="xl">
                <SvgMoreHoriz />
              </Button>
            </Group>
          );
        })
      }
      <Flex justify={{ base: "center", md: "flex-end" }}>
        <Pagination total={1} siblings={1} />
      </Flex>
    </Stack>
  );
};

export default MembersTable;
