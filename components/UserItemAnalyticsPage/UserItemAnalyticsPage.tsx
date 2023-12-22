import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import {
  Alert,
  Button,
  Container,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

import { getUserIssuedItemList } from "@/backend/api/get";
import { TeamMemberType, UserIssuedItem } from "@/utils/types";
import { IconAlertCircle } from "@tabler/icons-react";
import moment from "moment";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import UserItemBarChart from "./UserItemBarChart";

type UserItemFilter = {
  teamMemberId: string;
  startDate: string;
  endDate: string;
};

type Props = { teamMemberList: TeamMemberType[] };

const UserItemAnalyticsPage = ({ teamMemberList }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const [resultList, setResultList] = useState<UserIssuedItem[] | undefined>(
    undefined
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserItemFilter>();

  const onSubmit = async ({ teamMemberId }: UserItemFilter) => {
    try {
      setIsAnalyzing(true);
      const startDate = moment(new Date("1/2/2023")).format();
      const endDate = moment(new Date()).format();
      console.log(startDate);
      console.log(endDate);

      const { data: itemList } = await getUserIssuedItemList(supabaseClient, {
        teamMemberId,
        startDate,
        endDate,
      });
      setResultList(itemList);
    } catch (e) {
      console.log(e);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Container p={0}>
      <Title color="dimmed" order={2}>
        User Issued Item Analytics
      </Title>
      <Paper p="xl" shadow="xs" mt="xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <Controller
              control={control}
              name={"teamMemberId"}
              rules={{
                required: "User is required.",
              }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data={teamMemberList.map((member) => {
                    return {
                      label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
                      value: member.team_member_id,
                    };
                  })}
                  placeholder="Select User"
                  label="User"
                  clearable
                  searchable
                  onChange={onChange}
                  value={value}
                  error={errors.teamMemberId?.message}
                />
              )}
            />
            <Button
              type="submit"
              sx={{ alignSelf: "flex-end" }}
              loading={isAnalyzing}
              disabled={!activeTeam.team_id}
            >
              Analyze
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper p="xl" shadow="xs" mt="xl" pos="relative">
        <LoadingOverlay visible={isAnalyzing} overlayBlur={2} />
        {resultList && resultList.length > 0 ? (
          <UserItemBarChart data={resultList} />
        ) : (
          <Text align="center" size={24} weight="bolder" color="dimmed">
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="orange"
              mt="xs"
            >
              {Array.isArray(resultList)
                ? "No item/s found."
                : "Please select a user to show the item list."}
            </Alert>
          </Text>
        )}
      </Paper>
    </Container>
  );
};

export default UserItemAnalyticsPage;
