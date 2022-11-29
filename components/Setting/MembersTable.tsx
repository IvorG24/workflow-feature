// JC: scss is not needed; can move component as a standalone component
import {
  Avatar as MantineAvatar,
  Button,
  Flex,
  Group as MantineGroup,
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
    <Stack justify="space-between" style={{ minHeight: "400px" }}>
      {
        // JC: Change the properties to match fetched member data
        filteredMembers.map(({ id, name, email, role, image }) => {
          return (
            <MantineGroup
              position="apart"
              style={{
                borderTop: "1px solid #E9E9E9",
                paddingTop: "10px",
              }}
              key={id}
              // JC: Propose to move this onClick function to MantineAvatar and Text/name
              // Reason: the Select input and MoreOptions button should not redirect to user profile
              onClick={() => router.push(`/profiles/${id}`)}
            >
              <Flex
                gap={{ sm: "sm" }}
                direction={{ base: "column", sm: "row" }}
              >
                <MantineAvatar
                  size={40}
                  radius={40}
                  src={image}
                  alt={`${name}'s Formsly Avatar`}
                />
                <div>
                  <Text fw="bold" color="dark">
                    {name}
                  </Text>
                  <Text fz="xs">{email}</Text>
                  {/*  Select should have smaller padding. */}
                  <Select
                    value={role}
                    onChange={(e) => console.log(e)}
                    data={[
                      { value: "admin", label: "Admin" },
                      { value: "manager", label: "Manager" },
                      { value: "member", label: "Member" },
                    ]}
                    radius={4}
                    style={{ width: "100px" }}
                    rightSection={<SvgArrowDropDown />}
                    rightSectionWidth={20}
                    readOnly
                  />
                </div>
              </Flex>
              <Button
                variant="subtle"
                size="xs"
                color="dark"
                style={{ fontSize: "24px" }}
              >
                <SvgMoreHoriz />
              </Button>
            </MantineGroup>
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
