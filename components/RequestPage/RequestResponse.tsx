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
import CurrencyFormField from "../CreateRequestPage/SpecialField/CurrencyFormField";

type RequestReponseProps = {
  response: {
    id: string;
    label: string;
    type: FieldType;
    value: string;
    options: OptionTableRow[];
    prefix?: string | null;
    isSpecialField?: boolean;
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
  const [ticketExists, setTicketExists] = useState(false);

  const formatTime = (timeString: string) => {
    const [hoursStr, minutesStr] = timeString.split(":");
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes}`;
  };

  const getRequestPath = (requestId: string) => {
    if (team.team_name) {
      return requestPath(requestId, team.team_name);
    } else {
      return `${process.env.NEXT_PUBLIC_SITE_URL}/public-request/${requestId}`;
    }
  };

  useEffect(() => {
    const fetchRequestFormslyId = async () => {
      if (
        validate(linkDisplayValue.toString()) ||
        response.label === "Ticket ID"
      ) {
        const requestFormslyId = await getRequestFormslyId(supabaseClient, {
          requestId: linkDisplayValue.trim(),
        });

        if (requestFormslyId) {
          setLinkDisplayValue(requestFormslyId);
          setTicketExists(true);
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
              onClick={() => window.open(getRequestPath(parsedValue), "_blank")}
            >
              <IconExternalLink />
            </ActionIcon>
          </Flex>
        );
      case "TEXT":
        return (
          <Flex w="100%" align="flex-end" gap="xs">
            <TextInput
              label={response.label}
              value={parsedValue}
              {...inputProps}
              sx={{ flex: 1 }}
            />
            {ticketExists && (
              <ActionIcon
                mb={4}
                p={4}
                variant="light"
                color="blue"
                onClick={() =>
                  window.open(getRequestPath(parsedValue), "_blank")
                }
              >
                <IconExternalLink />
              </ActionIcon>
            )}
          </Flex>
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
        if (response.isSpecialField && response.prefix) {
          return (
            <CurrencyFormField
              label={response.label}
              selectInputProps={{
                data: [`${response.prefix}`],
                value: response.prefix,
                variant: "filled",
                readOnly: true,
              }}
              numberInputProps={{
                value: parsedValue,
                variant: "filled",
                readOnly: true,
              }}
            />
          );
        } else {
          return (
            <NumberInput
              label={response.label}
              value={parsedValue}
              {...inputProps}
              precision={2}
            />
          );
        }

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

        return isFormslyForm || Boolean(response.isSpecialField) ? (
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
