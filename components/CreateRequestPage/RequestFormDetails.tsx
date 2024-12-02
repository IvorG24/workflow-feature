import { useUserProfile } from "@/stores/useUserStore";
import { formatDate } from "@/utils/constant";
import { FormType } from "@/utils/types";
import { Paper, Stack, Textarea, TextInput } from "@mantine/core";

type Props = {
  formDetails: {
    form_name: string;
    form_description: string;
    form_date_created: string;
    form_team_member: FormType["form_team_member"];
    form_type?: string;
    form_sub_type?: string;
    form_module_name?: string;
  };
  requestingProject?: string;
};

const RequestFormDetails = ({ formDetails, requestingProject }: Props) => {
  const userProfile = useUserProfile();

  const {
    form_name,
    form_description,
    form_type,
    form_sub_type,
    form_module_name,
  } = formDetails;

  const requestDate = formatDate(new Date());

  const fieldList = [
    {
      label: "Form Name",
      value: form_name,
    },
    {
      label: "Form Description",
      value: form_description,
    },
    {
      label: "Date Created",
      value: requestDate,
    },
    ...(form_type && form_sub_type
      ? [
          {
            label: "Type",
            value: form_type,
          },
          {
            label: "Sub Type",
            value: form_sub_type,
          },
        ]
      : []),
    ...(form_module_name
      ? [
          {
            label: "Module Name",
            value: form_module_name,
          },
        ]
      : []),
    ...(userProfile
      ? [
          {
            label: "Requested by",
            value: `${userProfile?.user_first_name} ${userProfile?.user_last_name}`,
          },
        ]
      : []),
    ...(requestingProject
      ? [
          {
            label: "Requesting Project",
            value: requestingProject,
          },
        ]
      : []),
  ];

  return (
    <Paper p="xl" shadow="xs">
      <Stack spacing="xs">
        {fieldList.map((field, index) => {
          if (field.label === "Form Description") {
            return (
              <Textarea
                key={index}
                label={field.label}
                value={field.value}
                readOnly
                variant="filled"
              />
            );
          } else {
            return (
              <TextInput
                key={index}
                label={field.label}
                value={field.value}
                readOnly
                variant="filled"
              />
            );
          }
        })}
      </Stack>
    </Paper>
  );
};

export default RequestFormDetails;
