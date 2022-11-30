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
import { useRouter } from "next/router";
import data from "../../teams.json";
import SvgMoreHoriz from "../Icon/MoreHoriz";

const MembersTable = () => {
  const router = useRouter();
  const members = data[0].members;

  return (
    <Stack justify="space-between" mih="400px" pt="md">
      {
        // todo: update properties to match fetched data
        members.map(({ id, name, email, role, avatar_url }) => {
          return (
            <Grid
              key={id}
              onClick={() => router.push(`/profiles/${id}`)}
              sx={{ borderTop: "1px solid #E9E9E9" }}
            >
              <Grid.Col order={1} orderMd={1} span={10} md={8}>
                <Group>
                  <MantineAvatar
                    size={40}
                    radius={40}
                    src={avatar_url}
                    alt={`${name}'s Formsly Avatar`}
                  />
                  <Box>
                    <Text fw="bold" color="dark">
                      {name}
                    </Text>
                    <Text fz="xs">{email}</Text>
                  </Box>
                </Group>
              </Grid.Col>
              <Grid.Col
                order={3}
                orderMd={2}
                span={1}
                offset={2}
                offsetSm={1}
                offsetMd={1}
              >
                <Select
                  value={role}
                  onChange={(e) => console.log(e)}
                  data={[
                    { value: "admin", label: "Admin" },
                    { value: "manager", label: "Manager" },
                    { value: "member", label: "Member" },
                    { value: "owner", label: "Owner" },
                  ]}
                  radius={4}
                  size="xs"
                  w="90px"
                  rightSection={<SvgArrowDropDown />}
                  rightSectionWidth={20}
                  readOnly
                />
              </Grid.Col>
              <Grid.Col order={2} orderMd={3} span={1} offsetMd={1}>
                <Button variant="subtle" size="xs" color="dark" fz="xl">
                  <SvgMoreHoriz />
                </Button>
              </Grid.Col>
            </Grid>
          );
        })
      }
      <Flex
        justify={{ base: "center", md: "flex-end" }}
        sx={{ borderTop: "1px solid #E9E9E9" }}
        pt="sm"
      >
        <Pagination total={1} siblings={1} />
      </Flex>
    </Stack>
  );
};

export default MembersTable;
