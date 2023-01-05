// todo: create unit test
import {
  Avatar as MantineAvatar,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Pagination,
  Select,
  Stack,
  Text,
} from "@mantine/core";

import SvgArrowDropDown from "@/components/Icon/ArrowDropDown";
import { GetTeam } from "@/utils/queries-new";
import { TeamMemberRole } from "@/utils/types-new";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useState } from "react";
import SvgMoreHoriz from "../Icon/MoreHoriz";

type Props = {
  memberList: GetTeam;
  authUser: User | null;
  authUserRole: string;
  updateMemberRole: (
    memberId: string,
    memberRole: TeamMemberRole,
    newRole: TeamMemberRole
  ) => void;
};

const MemberList = ({
  memberList = [],
  authUser,
  authUserRole,
  updateMemberRole,
}: Props) => {
  const router = useRouter();
  // pagination
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 7;
  const totalPages = Math.ceil(memberList.length / pageSize);

  const paginate = (array: GetTeam, page_size: number, page_number: number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };

  return (
    <Stack mih="300px" pt="md">
      {paginate(memberList, pageSize, pageNumber).map((member) => {
        return (
          <Grid key={member.user_id} sx={{ borderTop: "1px solid #E9E9E9" }}>
            <Grid.Col order={1} span={10} sm={8}>
              <Group
                onClick={() =>
                  router.push(
                    `/t/${router.query.tid}/profiles/${member.user_id}/bio`
                  )
                }
              >
                <MantineAvatar
                  size={40}
                  radius={40}
                  src={member.user_avatar_filepath}
                  alt={`${member.username}'s Formsly Avatar`}
                  sx={{
                    border: `${
                      authUser?.id === member.user_id && "3px solid #4ac776"
                    }`,
                  }}
                  style={{ cursor: "pointer" }}
                />
                <Box style={{ cursor: "pointer" }}>
                  <Text fw="bold">{`${member.username}`}</Text>
                  <Text fz="xs">{member.user_email}</Text>
                </Box>
              </Group>
            </Grid.Col>
            <Grid.Col order={3} orderXs={2} span={1} offset={2} offsetXs={1}>
              <Select
                value={member.member_role_id}
                onChange={(newRole: TeamMemberRole) =>
                  updateMemberRole(
                    member.user_id as string,
                    member.member_role_id as TeamMemberRole,
                    newRole
                  )
                }
                data={
                  authUserRole === "member" ||
                  authUser?.id === member.user_id ||
                  ["owner", authUserRole].includes(
                    member.member_role_id as string
                  )
                    ? [
                        { value: "owner", label: "Owner" },
                        { value: "admin", label: "Admin" },
                        { value: "purchaser", label: "Purchaser" },
                        { value: "member", label: "Member" },
                      ]
                    : [
                        { value: "admin", label: "Admin" },
                        { value: "purchaser", label: "Purchaser" },
                        { value: "member", label: "Member" },
                      ]
                }
                radius={4}
                size="xs"
                w="90px"
                rightSection={<SvgArrowDropDown />}
                rightSectionWidth={20}
                readOnly={
                  authUserRole === "member" ||
                  authUser?.id === member.user_id ||
                  ["owner", authUserRole].includes(
                    member.member_role_id as string
                  )
                    ? true
                    : false
                }
              />
            </Grid.Col>
            <Grid.Col order={2} orderXs={3} span={1} offsetXs={1}>
              <Button variant="subtle" size="xs" color="dark" fz="xl">
                <SvgMoreHoriz />
              </Button>
            </Grid.Col>
          </Grid>
        );
      })}
      <Flex
        justify={{ base: "center", md: "flex-end" }}
        sx={{ borderTop: "1px solid #E9E9E9" }}
        pt="sm"
      >
        <Pagination
          page={pageNumber}
          onChange={setPageNumber}
          total={totalPages}
          siblings={1}
        />
      </Flex>
    </Stack>
  );
};

export default MemberList;
