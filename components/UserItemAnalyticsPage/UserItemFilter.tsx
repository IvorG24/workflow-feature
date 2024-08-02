import { getUserIssuedItemList } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DAYS_OPTIONS } from "@/utils/constant";
import { Database } from "@/utils/database";
import { TeamMemberType, UserIssuedItem } from "@/utils/types";
import { Button, Group, Paper, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconCalendarEvent } from "@tabler/icons-react";
import moment from "moment";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type UserItemFilter = {
  teamMemberId: string;
  dateCreated: string | null;
  startDate: Date;
  endDate: Date;
};

type Props = {
  setResultList: Dispatch<SetStateAction<UserIssuedItem[] | undefined>>;
  isAnalyzing: boolean;
  setIsAnalyzing: Dispatch<SetStateAction<boolean>>;
  teamMemberList: TeamMemberType[];
};

const UserItemFilter = ({
  teamMemberList,
  setResultList,
  isAnalyzing,
  setIsAnalyzing,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);
  const currentDate = moment().toDate();
  const firstDayOfCurrentYear = moment({
    year: moment().year(),
    month: 0,
    day: 1,
  }).toDate();
  const {
    getValues,
    setValue,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserItemFilter>({
    defaultValues: {
      dateCreated: DAYS_OPTIONS[0].value,
      startDate: firstDayOfCurrentYear,
      endDate: currentDate,
    },
  });

  const onSubmit = async (data: UserItemFilter) => {
    try {
      setIsAnalyzing(true);
      const startDate = moment(data.startDate).format();
      const endDate = moment(data.endDate).format();

      const { data: itemList } = await getUserIssuedItemList(supabaseClient, {
        teamMemberId: data.teamMemberId,
        startDate,
        endDate,
      });
      setResultList(itemList);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Paper p="xl" shadow="xs" mt="xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Group>
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
                disabled={isAnalyzing}
                error={errors.teamMemberId?.message}
              />
            )}
          />
          <Controller
            control={control}
            name={"dateCreated"}
            rules={{
              required: "Date Created is required.",
            }}
            render={({ field: { value, onChange } }) => (
              <Select
                data={DAYS_OPTIONS}
                placeholder="Select days"
                label="Date Created"
                onChange={(payload) => {
                  if (payload === "custom") setIsCustomDate(true);
                  else {
                    if (payload && Number(payload) > 0) {
                      const currDate = new Date();
                      const startDate = new Date(currentDate);
                      startDate.setDate(currDate.getDate() - Number(payload));
                      setValue("startDate", startDate);
                      setValue("endDate", currDate);
                    }
                    setIsCustomDate(false);
                  }
                  onChange(payload);
                }}
                value={value}
                disabled={isAnalyzing}
                error={errors.dateCreated?.message}
              />
            )}
          />

          {isCustomDate && (
            <>
              <Controller
                control={control}
                name={"startDate"}
                rules={{
                  required: "Date Created is required.",
                }}
                render={({ field: { value, onChange } }) => (
                  <DatePickerInput
                    label="Start Date"
                    placeholder="Select a start date"
                    value={value}
                    onChange={onChange}
                    icon={<IconCalendarEvent />}
                    dropdownType="popover"
                    minDate={new Date("2023-01-01")}
                    maxDate={currentDate}
                    disabled={isAnalyzing}
                    valueFormat="YYYY-MM-DD"
                  />
                )}
              />
              <Controller
                control={control}
                name={"endDate"}
                rules={{
                  required: "Date Created is required.",
                }}
                render={({ field: { value, onChange } }) => (
                  <DatePickerInput
                    label="End Date"
                    placeholder="Select a end date"
                    value={value}
                    onChange={onChange}
                    icon={<IconCalendarEvent />}
                    dropdownType="popover"
                    disabled={isAnalyzing}
                    minDate={getValues("startDate") || new Date()}
                    maxDate={currentDate}
                    valueFormat="YYYY-MM-DD"
                  />
                )}
              />
            </>
          )}
          <Button
            type="submit"
            sx={{ alignSelf: "flex-end" }}
            loading={isAnalyzing}
            disabled={!activeTeam.team_id}
          >
            Analyze
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default UserItemFilter;
