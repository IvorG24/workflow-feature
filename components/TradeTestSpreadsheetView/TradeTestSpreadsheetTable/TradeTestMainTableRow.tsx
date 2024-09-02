import { getCurrentDate } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate, formatTime } from "@/utils/constant";
import { Database } from "@/utils/database";
import { safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor, mobileNumberFormatter } from "@/utils/styling";
import { TradeTestSpreadsheetData } from "@/utils/types";
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
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";

const useStyles = createStyles((theme) => ({
  row: {
    "& td": {
      backgroundColor: theme.colors.blue[0],
    },
  },
}));

type Props = {
  item: TradeTestSpreadsheetData;
  hiddenColumnList: string[];
  handleUpdateTradeTestStatus: (
    status: string,
    data: TradeTestSpreadsheetData
  ) => void;
};

const TradeTestMainTableRow = ({
  item,
  hiddenColumnList,
  handleUpdateTradeTestStatus,
}: Props) => {
  const { classes } = useStyles();
  const supabaseClient = createPagesBrowserClient<Database>();
  const team = useActiveTeam();
  const dateRef = useRef<HTMLInputElement | null>(null);
  const timeRef = useRef<HTMLInputElement | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

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

  const openModel = (action: string) =>
    modals.openConfirmModal({
      title: <Text>Please confirm your action.</Text>,
      children: (
        <Text>{`Are you sure this applicant is ${action.toLocaleLowerCase()}?`}</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      centered: true,
      confirmProps: { color: statusColor[action] },
      onConfirm: async () => handleUpdateTradeTestStatus(action, item),
    });

  useEffect(() => {
    if (!opened) {
      setValue("date", "");
      setValue("time", "");
      clearErrors();
    }
  }, [opened]);

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
            Trade Test schedule for{" "}
            <b>{item.application_information_full_name}</b> applying for{" "}
            <b>{item.position.replaceAll('"', "")}</b> position.
          </Text>

          <form
            id="schedule"
            onSubmit={handleSubmit((data) => console.log(data))}
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
                        new Date(value).toDateString() <
                        currentDate.toDateString()
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
                      if (
                        new Date(getValues("date")).toDateString() ===
                        currentDate.toDateString()
                      ) {
                        if (value < moment(currentDate).format("HH:mm")) {
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
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form="schedule">
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
            {item.application_information_full_name}
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
      {!hiddenColumnList.includes("technical_assessment_date") && (
        <td>
          <Text>{formatDate(new Date(item.technical_assessment_date))}</Text>
        </td>
      )}
      {!hiddenColumnList.includes("trade_test_status") && (
        <td>
          <Badge
            variant="filled"
            color={getStatusToColor(item.trade_test_status)}
          >
            {item.trade_test_status}
          </Badge>
        </td>
      )}
      {!hiddenColumnList.includes("trade_test_schedule") && (
        <td>
          {item.trade_test_schedule ? (
            <>
              <Text sx={{ whiteSpace: "nowrap" }}>
                Date: {formatDate(new Date(item.trade_test_schedule))}
              </Text>
              <Text sx={{ whiteSpace: "nowrap" }}>
                Time: {formatTime(new Date(item.trade_test_schedule))}
              </Text>
            </>
          ) : (
            ""
          )}
        </td>
      )}
      <td>
        {item.trade_test_status === "WAITING FOR SCHEDULE" && (
          <Flex align="center" justify="center" gap="xs" wrap="wrap">
            <Button color="green" w={130} onClick={open}>
              Set Schedule
            </Button>
          </Flex>
        )}
        {item.trade_test_status === "PENDING" && (
          <Flex align="center" justify="center" gap="xs" wrap="wrap">
            <Button
              color="green"
              w={130}
              onClick={() => openModel("QUALIFIED")}
            >
              Qualified
            </Button>
            <Button
              color="red"
              w={130}
              onClick={() => openModel("UNQUALIFIED")}
            >
              Unqualified
            </Button>
            <Button
              color="gray"
              w={130}
              onClick={() => openModel("UNRESPONSIVE")}
            >
              Unresponsive
            </Button>
          </Flex>
        )}
      </td>
    </tr>
  );
};

export default TradeTestMainTableRow;
