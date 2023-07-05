import {
  Box,
  Checkbox,
  Container,
  ContainerProps,
  Divider,
  MultiSelect,
  Text,
  createStyles,
} from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";
import { FormBuilderData } from "./FormBuilder";

export type Mode = "answer" | "edit" | "view";

export type SignerActions = "approved" | "noted" | "purchased";

export type RequestSigner = {
  signer_id: string;
  signer_team_member_id: string;
  signer_action: SignerActions | string;
  signer_is_primary_signer: boolean;
  signer_order: number;
  signer_form_id: string;
};

type UseStylesProps = {
  mode: Mode;
};

const useStyles = createStyles((theme, { mode }: UseStylesProps) => ({
  container: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? mode === "edit"
          ? theme.colors.dark[7]
          : theme.colors.dark[7]
        : "#fff",
    borderRadius: 4,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]
    }
    `,
    paddingInline: "32px",
    paddingTop: "16px",
    paddingBottom: mode === "edit" ? "16px" : "32px",
  },
}));

type Props = {
  mode?: Mode;
  teamGroupList: string[];
} & ContainerProps;

const GroupSection = ({ mode = "edit", teamGroupList, ...props }: Props) => {
  const { classes } = useStyles({ mode });
  const { control, register, watch } = useFormContext<FormBuilderData>();

  const isForEveryone = watch("isForEveryone");

  return (
    <Container maw={768} className={classes.container} {...props}>
      <Box>
        <Text weight={600} size={18}>
          Groups
        </Text>
        <Controller
          control={control}
          name="groupList"
          render={({ field: { value, onChange } }) => (
            <MultiSelect
              label="Select group"
              value={value}
              onChange={(value) => onChange(value)}
              data={teamGroupList}
              mt="md"
              disabled={isForEveryone}
            />
          )}
        />
      </Box>

      <>
        <Divider mt="md" />

        <Checkbox
          label="All members have access to create request from this form"
          {...register("isForEveryone")}
          my="xl"
          sx={{ input: { cursor: "pointer" } }}
        />
      </>
    </Container>
  );
};

export default GroupSection;
