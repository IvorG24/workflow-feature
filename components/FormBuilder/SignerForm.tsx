import { TeamMemberWithUserType } from "@/utils/types";
import {
  ActionIcon,
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Container,
  createStyles,
  Flex,
  Group,
  List,
  Paper,
  Select,
} from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FormBuilderData } from "./FormBuilder";
import { Mode } from "./Section";
import { RequestSigner } from "./SignerSection";

type Props = {
  signer: RequestSigner;
  signerIndex: number;
  onDelete: (signerIndex: number) => void;
  mode: Mode;
  teamMemberList: TeamMemberWithUserType[];
  onMakePrimaryApprover: (signerIndex: number) => void;
};

type UseStylesProps = {
  mode: Mode;
};

const useStyles = createStyles((theme, { mode }: UseStylesProps) => ({
  notActiveContainer: {
    cursor: mode === "edit" ? "pointer" : "auto",
    position: "relative",
  },
  paper: {
    border: `1px solid ${theme.colors.blue[6]}`,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  checkboxCursor: {
    input: {
      cursor: "pointer",
    },
  },
}));

const SignerForm = ({
  signerIndex,
  onDelete,
  mode = "edit",
  teamMemberList,
  onMakePrimaryApprover,
}: Props) => {
  const [isActive, setIsActive] = useState(false);
  const [isSelectingSigner, setIsSelectingSigner] = useState(false);
  const [isSelectingAction, setIsSelectingAction] = useState(false);

  const ref = useClickOutside(() => {
    if (!isSelectingSigner && !isSelectingAction) {
      setIsActive(false);
    }
  });

  const { register, control, watch, setValue } =
    useFormContext<FormBuilderData>();

  const { classes } = useStyles({ mode });

  const signerUserId = watch(`signers.${signerIndex}.signer_team_member_id`);
  const signerAction = watch(`signers.${signerIndex}.signer_action`);
  const isPrimaryApprover = watch(
    `signers.${signerIndex}.signer_is_primary_signer`
  );

  const signerOptions = teamMemberList.map((member) => {
    return {
      value: member.team_member_id,
      label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
    };
  });

  useEffect(() => {
    if (mode !== "edit") return;
    const selectedUser = teamMemberList.find(
      (member) => member.team_member_user.user_id === signerUserId
    );

    if (selectedUser) {
      setValue(
        `signers.${signerIndex}.signer_team_member_id`,
        selectedUser.team_member_id
      );
    }
  }, [signerUserId]);

  if (!isActive) {
    const signerFullName = signerOptions.find(
      (signer) => signer.value === signerUserId
    );
    return (
      <Box
        role="button"
        aria-label="click to edit signer"
        onClick={() => {
          if (mode === "edit") setIsActive(true);
        }}
        className={classes.notActiveContainer}
      >
        <Group noWrap mt="xs">
          <List.Item>
            Will be signed as {signerAction} by {signerFullName?.label}
          </List.Item>
          {isPrimaryApprover && (
            <Chip size="xs" variant="outline" checked={isPrimaryApprover}>
              Primary
            </Chip>
          )}
        </Group>
      </Box>
    );
  }

  return (
    <Paper ref={ref} shadow="xs" radius="sm" className={classes.paper}>
      <ActionIcon
        className={classes.closeIcon}
        onClick={() => onDelete(signerIndex)}
        color="red"
      >
        <IconTrash height={16} />
      </ActionIcon>

      <Container fluid p={24}>
        <Flex gap="md" wrap="wrap">
          <Controller
            name={`signers.${signerIndex}.signer_team_member_id`}
            control={control}
            render={({ field }) => (
              <Select
                label="Signer"
                data={signerOptions}
                {...field}
                onDropdownOpen={() => setIsSelectingSigner(true)}
                onDropdownClose={() => {
                  setTimeout(() => setIsSelectingSigner(false), 100);
                }}
              />
            )}
          />

          <Controller
            name={`signers.${signerIndex}.signer_action`}
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                label="Action"
                data={["approved", "noted", "purchased"]}
                onDropdownOpen={() => setIsSelectingAction(true)}
                onDropdownClose={() => {
                  setTimeout(() => setIsSelectingAction(false), 100);
                }}
              />
            )}
          />
        </Flex>

        <Checkbox
          label="Make primary approver"
          mt={24}
          {...register(`signers.${signerIndex}.signer_is_primary_signer`)}
          onClick={() => onMakePrimaryApprover(signerIndex)}
          className={classes.checkboxCursor}
        />
      </Container>
    </Paper>
  );
};

export default SignerForm;
