import { getCurrentDate } from "@/backend/api/get";
import { updateDirectorInterviewSchedule } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { formatDate, formatTime } from "@/utils/constant";
import { Database } from "@/utils/database";
import { safeParse } from "@/utils/functions";
import { capitalizeEachWord, formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor, mobileNumberFormatter } from "@/utils/styling";
import { DirectorInterviewSpreadsheetData } from "@/utils/types";
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  createStyles,
  Flex,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import moment from "moment";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const useStyles = createStyles((theme) => ({
  row: {
    "& td": {
      backgroundColor: theme.colors.blue[0],
    },
  },
}));

type Props = {
  item: DirectorInterviewSpreadsheetData;
  hiddenColumnList: string[];
  handleUpdateDirectorInterviewStatus: (
    status: string,
    data: DirectorInterviewSpreadsheetData
  ) => void;
  setData: Dispatch<SetStateAction<DirectorInterviewSpreadsheetData[]>>;
};

const DirectorInterviewMainTableRow = ({
  item,
  hiddenColumnList,
  handleUpdateDirectorInterviewStatus,
  setData,
}: Props) => {
  const { classes } = useStyles();
  const supabaseClient = createPagesBrowserClient<Database>();
  const team = useActiveTeam();
  const teamMember = useUserTeamMember();
  const dateRef = useRef<HTMLInputElement | null>(null);
  const timeRef = useRef<HTMLInputElement | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    clearErrors,
    getValues,
  } = useForm<{
    date: string;
    time: string;
  }>({ defaultValues: { date: "", time: "" } });

  const statusColor: Record<string, string> = {
    QUALIFIED: "green",
    UNQUALIFIED: "red",
    UNRESPONSIVE: "gray",
  };

  const openModal = (action: string) =>
    modals.openConfirmModal({
      title: <Text>Please confirm your action.</Text>,
      children: (
        <Text>{`Are you sure this applicant is ${action.toLocaleLowerCase()}?`}</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: { color: statusColor[action] },
      onConfirm: async () => handleUpdateDirectorInterviewStatus(action, item),
    });

  useEffect(() => {
    if (!opened) {
      setValue("date", "");
      setValue("time", "");
      clearErrors();
    }
  }, [opened]);

  const handleSchedule = async (schedule: string) => {
    try {
      if (!teamMember?.team_member_id) throw new Error();
      setIsScheduling(true);
      const formattedScheduleMessage = moment(schedule).format(
        "MMMM Do YYYY, h:mm A"
      );
      await updateDirectorInterviewSchedule(supabaseClient, {
        teamMemberId: teamMember.team_member_id,
        schedule: schedule,
        requestReferenceId: item.hr_request_reference_id,
        userEmail: item.application_information_email,
        applicationInformationFormslyId:
          item.application_information_request_id,
        notificationMessage: `Your Director Interview schedule is on ${formattedScheduleMessage}`,
      });

      setData((prev) =>
        prev.map((prevItem) => {
          if (prevItem.hr_request_reference_id !== item.hr_request_reference_id)
            return prevItem;
          return {
            ...prevItem,
            director_interview_status: "PENDING",
            director_interview_schedule: schedule,
          };
        })
      );
      notifications.show({
        message: "Director Interview scheduled successfully.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  if (!team.team_name) return null;
  return (
    <tr className={classes.row}>
      <Modal
        opened={opened}
        onClose={close}
        title="Set Schedule"
        centered
        closeOnEscape={false}
        closeOnClickOutside={false}
        withCloseButton={false}
      >
        <Stack spacing="xl">
          <Text color="dimmed" size={14}>
            Director Interview schedule for{" "}
            <b>{item.application_information_full_name}</b> applying for{" "}
            <b>{item.position.replaceAll('"', "")}</b> position.
          </Text>

          <form
            id="schedule"
            onSubmit={handleSubmit(async (data) => {
              await handleSchedule(
                moment(`${moment().format("YYYY-MM-DD")} ${data.time}`)
                  .utc()
                  .format("YYYY-MM-DD HH:mm:ssZZ")
              );
              close();
            })}
          >
            <Stack spacing="xs">
              <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange } }) => {
                  const newValue = value
                    ? new Date(value as string)
                    : undefined;
                  return (
                    <DateInput
                      label="Date"
                      popoverProps={{
                        withinPortal: true,
                      }}
                      valueFormat="MM-DD-YYYY"
                      ref={dateRef}
                      rightSection={
                        <ActionIcon onClick={() => dateRef?.current?.focus()}>
                          <IconCalendar size="1rem" stroke={1.5} />
                        </ActionIcon>
                      }
                      required
                      value={newValue}
                      onChange={onChange}
                      error={errors.date?.message}
                      minDate={new Date()}
                    />
                  );
                }}
                rules={{
                  validate: {
                    checkDate: async (value) => {
                      const currentDate = await getCurrentDate(supabaseClient);

                      if (
                        new Date(value).setHours(0, 0, 0, 0) <
                        currentDate.setHours(0, 0, 0, 0)
                      )
                        return "Invalid Date";
                      return true;
                    },
                  },
                }}
              />
              <Controller
                control={control}
                name="time"
                render={({ field: { value, onChange } }) => {
                  return (
                    <TimeInput
                      label="Time"
                      ref={timeRef}
                      rightSection={
                        <ActionIcon
                          onClick={() => timeRef?.current?.showPicker()}
                        >
                          <IconClock size="1rem" stroke={1.5} />
                        </ActionIcon>
                      }
                      required
                      value={value ?? ""}
                      onChange={onChange}
                      error={errors.time?.message}
                    />
                  );
                }}
                rules={{
                  validate: {
                    checkTime: async (value) => {
                      const currentDate = await getCurrentDate(supabaseClient);
                      const dateComparison = new Date(currentDate);

                      if (
                        new Date(getValues("date")).setHours(0, 0, 0, 0) ===
                        dateComparison.setHours(0, 0, 0, 0)
                      ) {
                        if (
                          moment(value, "HH:mm").isBefore(
                            moment(currentDate, "HH:mm")
                          )
                        ) {
                          return "Invalid Time";
                        }
                      }
                      return true;
                    },
                  },
                }}
              />
            </Stack>
          </form>

          <Group spacing="xs" position="right">
            <Button variant="outline" onClick={close} disabled={isScheduling}>
              Cancel
            </Button>
            <Button type="submit" form="schedule" loading={isScheduling}>
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>

      {!hiddenColumnList.includes("position") && (
        <td>
          <Text>{safeParse(item.position)}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_full_name") && (
        <td>
          <Text sx={{ whiteSpace: "nowrap" }}>
            {capitalizeEachWord(item.application_information_full_name)}
          </Text>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_contact_number") && (
        <td>
          <Text sx={{ whiteSpace: "nowrap" }}>
            {mobileNumberFormatter(item.application_information_contact_number)}
          </Text>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_email") && (
        <td>
          <Text>{item.application_information_email}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_request_id") && (
        <td>
          <Anchor
            target="_blank"
            href={`/${formatTeamNameToUrlKey(team.team_name)}/requests/${
              item.application_information_request_id
            }`}
          >
            {item.application_information_request_id}
          </Anchor>
        </td>
      )}
      {!hiddenColumnList.includes("application_information_score") && (
        <td>
          <Text>{item.application_information_score}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("general_assessment_request_id") && (
        <td>
          <Anchor
            target="_blank"
            href={`/${formatTeamNameToUrlKey(team.team_name)}/requests/${
              item.general_assessment_request_id
            }`}
          >
            {item.general_assessment_request_id}
          </Anchor>
        </td>
      )}
      {!hiddenColumnList.includes("general_assessment_score") && (
        <td>
          <Text>{item.general_assessment_score}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("technical_assessment_request_id") && (
        <td>
          <Anchor
            target="_blank"
            href={`/${formatTeamNameToUrlKey(team.team_name)}/requests/${
              item.technical_assessment_request_id
            }`}
          >
            {item.technical_assessment_request_id}
          </Anchor>
        </td>
      )}
      {!hiddenColumnList.includes("technical_assessment_score") && (
        <td>
          <Text>{item.technical_assessment_score}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("director_interview_date_created") && (
        <td>
          <Text sx={{ whiteSpace: "nowrap" }}>
            {formatDate(new Date(item.director_interview_date_created))}
          </Text>
        </td>
      )}
      {!hiddenColumnList.includes("director_interview_status") && (
        <td>
          <Badge
            variant="filled"
            color={getStatusToColor(item.director_interview_status)}
          >
            {item.director_interview_status}
          </Badge>
        </td>
      )}
      {!hiddenColumnList.includes("director_interview_schedule") && (
        <td>
          {item.director_interview_schedule ? (
            <>
              <Text sx={{ whiteSpace: "nowrap" }}>
                Date: {formatDate(new Date(item.director_interview_schedule))}
              </Text>
              <Text sx={{ whiteSpace: "nowrap" }}>
                Time: {formatTime(new Date(item.director_interview_schedule))}
              </Text>
            </>
          ) : (
            ""
          )}
        </td>
      )}
      <td>
        {item.director_interview_status === "WAITING FOR SCHEDULE" && (
          <Flex align="center" justify="center" gap="xs" wrap="wrap">
            <Button color="green" w={130} onClick={open}>
              Set Schedule
            </Button>
          </Flex>
        )}
        {item.director_interview_status === "PENDING" && (
          <Flex align="center" justify="center" gap="xs" wrap="wrap">
            <Button
              color="green"
              w={130}
              onClick={() => openModal("QUALIFIED")}
            >
              Qualified
            </Button>
            <Button
              color="red"
              w={130}
              onClick={() => openModal("UNQUALIFIED")}
            >
              Unqualified
            </Button>
            <Button
              color="gray"
              w={130}
              onClick={() => openModal("UNRESPONSIVE")}
            >
              Unresponsive
            </Button>
          </Flex>
        )}
      </td>
    </tr>
  );
};

export default DirectorInterviewMainTableRow;
