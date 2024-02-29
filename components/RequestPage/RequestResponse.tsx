import { getRequestFormslyId } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { requestPath } from "@/utils/string";
import { FieldType, OptionTableRow } from "@/utils/types";
import {
  ActionIcon,
  Flex,
  MultiSelect,
  NumberInput,
  Select,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconFile,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { validate } from "uuid";

type RequestReponseProps = {
  response: {
    id: string;
    label: string;
    type: FieldType;
    value: string;
    options: OptionTableRow[];
  };
  isFormslyForm?: boolean;
  isAnon?: boolean;
};

const RequestResponse = ({
  response,
  isFormslyForm = false,
  isAnon = false,
}: RequestReponseProps) => {
  const inputProps = {
    variant: "filled",
    readOnly: true,
  };
  const supabaseClient = useSupabaseClient();
  const team = useActiveTeam();
  const [linkDisplayValue, setLinkDisplayValue] = useState(
    response.value === "" ? "" : JSON.parse(response.value)
  );

  const formatTime = (timeString: string) => {
    const [hoursStr, minutesStr] = timeString.split(":");
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes}`;
  };

  useEffect(() => {
    const fetchRequestFormslyId = async () => {
      if (validate(linkDisplayValue.toString())) {
        const requestFormslyId = await getRequestFormslyId(supabaseClient, {
          requestId: linkDisplayValue,
        });
        if (requestFormslyId) {
          setLinkDisplayValue(requestFormslyId);
        }
      }
    };
    fetchRequestFormslyId();
  }, []);

  const renderResponse = (response: RequestReponseProps["response"]) => {
    const parsedValue = response.value === "" ? "" : JSON.parse(response.value);
    const responseType =
      response.type === "DROPDOWN" && isAnon ? "TEXT" : response.type;

    switch (responseType) {
      case "LINK":
        return (
          <Flex w="100%" align="flex-end" gap="xs">
            <TextInput
              label={response.label}
              value={linkDisplayValue}
              {...inputProps}
              style={{ flex: 1 }}
            />
            <ActionIcon
              mb={4}
              p={4}
              variant="light"
              color="blue"
              onClick={() =>
                window.open(requestPath(parsedValue, team.team_name), "_blank")
              }
            >
              <IconExternalLink />
            </ActionIcon>
          </Flex>
        );
      case "TEXT":
        return (
          <TextInput
            label={response.label}
            value={parsedValue}
            {...inputProps}
          />
        );
      case "TEXTAREA":
        return (
          <Textarea
            label={response.label}
            value={parsedValue}
            {...inputProps}
          />
        );
      case "NUMBER":
        return (
          <NumberInput
            label={response.label}
            value={parsedValue}
            {...inputProps}
            precision={2}
          />
        );
      case "SWITCH":
        return (
          <Switch
            label={response.label}
            checked={parsedValue}
            {...inputProps}
            mt="xs"
            sx={{ label: { cursor: "pointer" } }}
          />
        );
      case "DROPDOWN":
        const dropdownOption = response.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));

        return isFormslyForm ? (
          <TextInput
            label={response.label}
            value={parsedValue}
            {...inputProps}
          />
        ) : (
          <Select
            label={response.label}
            data={dropdownOption}
            value={parsedValue}
            {...inputProps}
            clearable
          />
        );
      case "MULTISELECT":
        let multiselectOption = response.options.map((option) => ({
          value: option.option_value,
          label: option.option_value,
        }));

        if (isFormslyForm) {
          multiselectOption = parsedValue.map((value: string) => ({
            value: value,
            label: value,
          }));
        }

        return (
          <MultiSelect
            label={response.label}
            value={parsedValue}
            data={multiselectOption}
            {...inputProps}
          />
        );
      case "DATE":
        return (
          <DateInput
            label={response.label}
            value={parsedValue ? new Date(parsedValue) : undefined}
            {...inputProps}
            icon={<IconCalendar size={16} />}
            valueFormat="YYYY-MM-DD"
          />
        );
      case "TIME":
        return (
          <TimeInput
            label={response.label}
            value={parsedValue ? formatTime(parsedValue) : undefined}
            icon={<IconClock size={16} />}
            {...inputProps}
          />
        );
      // case "SLIDER":
      //   const sliderOption = JSON.parse(
      //     response.options.map((option) => option.option_value)[0]
      //   );
      //   const max = Number(sliderOption[1]);
      //   const marks = Array.from({ length: max }, (_, index) => ({
      //     value: index + 1,
      //     label: index + 1,
      //   }));
      //   return (
      //     <Box pb="xl">
      //       <Text weight={600} size={14}>
      //         {response.label}
      //       </Text>
      //       <Slider
      //         defaultValue={Number(response.value)}
      //         min={sliderOption[0]}
      //         max={max}
      //         step={1}
      //         marks={marks}
      //         disabled
      //       />
      //     </Box>
      //   );
      case "FILE":
        return (
          <Flex w="100%" align="flex-end" gap="xs">
            <TextInput
              {...inputProps}
              label={response.label}
              value={parsedValue ? parsedValue : undefined}
              icon={<IconFile size={16} />}
              multiple={false}
              style={{ flex: 1 }}
            />
            <ActionIcon
              mb={4}
              p={4}
              variant="light"
              color="blue"
              onClick={() => window.open(parsedValue, "_blank")}
            >
              <IconExternalLink />
            </ActionIcon>
          </Flex>
        );
    }
  };

  return <>{renderResponse(response)}</>;
};

export default RequestResponse;
