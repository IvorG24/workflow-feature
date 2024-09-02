import { createAttachment } from "@/backend/api/post";
import { updateJobOffer } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import {
  formatDate,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_IN_MB,
} from "@/utils/constant";
import { Database } from "@/utils/database";
import { safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { getStatusToColor, mobileNumberFormatter } from "@/utils/styling";
import { JobOfferSpreadsheetData, OptionType } from "@/utils/types";
import {
  Anchor,
  Badge,
  Button,
  createStyles,
  FileInput,
  Flex,
  Group,
  Modal,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconBriefcase, IconFile } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

const useStyles = createStyles((theme) => ({
  row: {
    "& td": {
      backgroundColor: theme.colors.blue[0],
    },
  },
}));

type Props = {
  item: JobOfferSpreadsheetData;
  hiddenColumnList: string[];
  setData: Dispatch<SetStateAction<JobOfferSpreadsheetData[]>>;
  positionOptionList: OptionType[];
};

const JobOfferMainTableRow = ({
  item,
  hiddenColumnList,
  setData,
  positionOptionList,
}: Props) => {
  const { classes } = useStyles();
  const supabaseClient = createPagesBrowserClient<Database>();
  const team = useActiveTeam();
  const teamMember = useUserTeamMember();

  const [opened, { open, close }] = useDisclosure(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm<{
    title: string;
    attachment: File | null;
  }>({ defaultValues: { title: "", attachment: null } });

  useEffect(() => {
    if (!opened) {
      setValue("title", "");
      setValue("attachment", null);
      clearErrors();
    }
  }, [opened]);

  const handleAddOffer = async (data: {
    title: string;
    attachment: File | null;
  }) => {
    try {
      if (!teamMember?.team_member_id || !data.attachment) throw new Error();
      setIsScheduling(true);

      const { data: attachmentData, url } = await createAttachment(
        supabaseClient,
        {
          attachmentData: {
            attachment_name: data.attachment.name,
            attachment_bucket: "JOB_OFFER_ATTACHMENTS",
            attachment_value: uuidv4(),
          },
          file: data.attachment,
        }
      );

      await updateJobOffer(supabaseClient, {
        teamMemberId: teamMember.team_member_id,
        requestReferenceId: item.hr_request_reference_id,
        userEmail: item.application_information_email,
        applicationInformationFormslyId:
          item.application_information_request_id,
        jobTitle: data.title,
        attachmentId: attachmentData.attachment_id,
      });

      setData((prev) =>
        prev.map((prevItem) => {
          if (prevItem.hr_request_reference_id !== item.hr_request_reference_id)
            return prevItem;
          return {
            ...prevItem,
            job_offer_title: data.title,
            job_offer_attachment_url: url,
            job_offer_status: "PENDING",
            job_offer_attachment_id: attachmentData.attachment_id,
          };
        })
      );
      notifications.show({
        message: "Job Offer scheduled successfully.",
        color: "green",
      });
    } catch (e) {
      console.log(e);
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
        title="Add Offer"
        centered
        closeOnEscape={false}
        closeOnClickOutside={false}
        withCloseButton={false}
        trapFocus={false}
      >
        <Stack spacing="xl">
          <Text color="dimmed" size={14}>
            Job Offer for <b>{item.application_information_full_name}</b>{" "}
            applying for <b>{item.position.replaceAll('"', "")}</b> position.
          </Text>

          <form
            id="offer"
            onSubmit={handleSubmit(async (data) => {
              await handleAddOffer(data);
              close();
            })}
          >
            <Stack spacing="xs">
              <Controller
                control={control}
                name="title"
                render={({ field: { value, onChange } }) => {
                  return (
                    <Select
                      label="Job Title"
                      icon={<IconBriefcase size={16} />}
                      clearable
                      value={value}
                      required
                      searchable
                      onChange={onChange}
                      error={errors.title?.message}
                      data={positionOptionList}
                      withinPortal
                      autoFocus={false}
                    />
                  );
                }}
                rules={{
                  required: "Job title is required.",
                }}
              />
              <Controller
                control={control}
                name="attachment"
                render={({ field: { value, onChange } }) => {
                  return (
                    <FileInput
                      label="Attachment"
                      icon={<IconFile size={16} />}
                      clearable
                      value={value}
                      required
                      onChange={onChange}
                      error={errors.attachment?.message}
                      multiple={false}
                    />
                  );
                }}
                rules={{
                  required: "Attachment is required.",
                  validate: {
                    fileSize: (value) => {
                      if (!value) return true;
                      const formattedValue = value as File;
                      return formattedValue.size <= MAX_FILE_SIZE
                        ? true
                        : `File exceeds ${MAX_FILE_SIZE_IN_MB}mb`;
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
            <Button type="submit" form="offer" loading={isScheduling}>
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
      {!hiddenColumnList.includes("job_offer_date_created") && (
        <td>
          <Text sx={{ whiteSpace: "nowrap" }}>
            {formatDate(new Date(item.job_offer_date_created))}
          </Text>
        </td>
      )}
      {!hiddenColumnList.includes("job_offer_status") && (
        <td>
          <Badge
            variant="filled"
            color={getStatusToColor(item.job_offer_status)}
          >
            {item.job_offer_status}
          </Badge>
        </td>
      )}

      <td>
        {item.job_offer_status === "WAITING FOR OFFER" && (
          <Flex align="center" justify="center" gap="xs" wrap="wrap">
            <Button color="green" w={130} onClick={open}>
              Add Offer
            </Button>
          </Flex>
        )}
      </td>
    </tr>
  );
};

export default JobOfferMainTableRow;
