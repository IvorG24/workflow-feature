import { TeamMemberWithUserType } from "@/utils/types";
import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  ButtonProps,
  Center,
  Checkbox,
  Chip,
  Container,
  createStyles,
  Flex,
  Group,
  List,
  Paper,
  Select,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleMinus,
  IconTrash,
} from "@tabler/icons-react";
import { Dispatch, MouseEventHandler, SetStateAction, useEffect } from "react";
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
  isActive: boolean;
  onNotActiveSigner: () => void;
  signerList: string[];
  onSetSignerList: Dispatch<SetStateAction<string[]>>;
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
  isActive,
  onNotActiveSigner,
  signerList,
  onSetSignerList,
}: Props) => {
  const {
    register,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useFormContext<FormBuilderData>();

  const { classes } = useStyles({ mode });

  const signerUserIdList = watch(`signers`).map(
    (signer) => signer.signer_user_id
  );
  const signerUserId = watch(`signers.${signerIndex}.signer_user_id`);
  const signerUsername = watch(`signers.${signerIndex}.signer_username`);
  const signerAction = watch(`signers.${signerIndex}.action`);
  const signerActionStatus = watch(`signers.${signerIndex}.status`);
  const isPrimaryApprover = watch(`signers.${signerIndex}.is_primary_approver`);

  const filteredSignerOptions = teamMemberList.filter(
    (member) => !signerList?.includes(member.team_member_user.user_id)
  );

  const signerOptions = filteredSignerOptions.map((member) => {
    return {
      value: member.team_member_user.user_id,
      label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
    };
  });

  const handleSave = () => {
    if (signerUserId.length <= 0) {
      setError(`signers.${signerIndex}.signer_user_id`, {
        message: "Signer is required",
      });
    }

    if (signerAction.length <= 0) {
      setError(`signers.${signerIndex}.action`, {
        message: "Action is required",
      });
    }
    if (signerUserId.length > 0 && signerAction.length > 0) {
      onSetSignerList(signerUserIdList);
      setError(`signers.${signerIndex}.action`, { message: "" });
      setError(`signers.${signerIndex}.signer_user_id`, { message: "" });
      onNotActiveSigner();
    }
  };

  useEffect(() => {
    if (mode !== "edit") return;
    const selectedUser = teamMemberList.find(
      (member) => member.team_member_user.user_id === signerUserId
    );

    if (selectedUser) {
      setValue(
        `signers.${signerIndex}.signer_user_id`,
        selectedUser.team_member_user.user_id
      );
      setValue(
        `signers.${signerIndex}.signer_username`,
        `${selectedUser.team_member_user.user_first_name} ${selectedUser.team_member_user.user_last_name}`
      );
    }
  }, [signerUserId]);

  if (!isActive) {
    return (
      <Box role="button" className={classes.notActiveContainer}>
        <Group noWrap>
          {(!signerActionStatus || signerActionStatus === "PENDING") && (
            <List.Item>
              Will be {signerAction} by {signerUsername}
            </List.Item>
          )}

          {signerActionStatus === "APPROVED" && (
            <List.Item
              icon={
                <Center>
                  <ThemeIcon color="green" size="xs" radius="xl">
                    <IconCircleCheck />
                  </ThemeIcon>
                </Center>
              }
            >
              Signed as {signerAction} by {signerUsername}
            </List.Item>
          )}

          {signerActionStatus === "REJECTED" && (
            <List.Item
              icon={
                <Center>
                  <ThemeIcon color="red" size="xs" radius="xl">
                    <IconCircleMinus />
                  </ThemeIcon>
                </Center>
              }
            >
              Rejected by {signerUsername}
            </List.Item>
          )}

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
    <Paper shadow="xs" radius="sm" className={classes.paper}>
      <ActionIcon
        className={classes.closeIcon}
        onClick={() => {
          onDelete(signerIndex);
          onNotActiveSigner();
        }}
        color="red"
      >
        <IconTrash height={16} />
      </ActionIcon>

      <Container fluid p={24}>
        <Flex gap="md" wrap="wrap">
          <Controller
            name={`signers.${signerIndex}.signer_user_id`}
            control={control}
            rules={{ required: "Signer is required" }}
            render={({ field }) => (
              <Select
                maw={223}
                label="Signer"
                data={signerOptions}
                {...field}
                error={errors.signers?.[signerIndex]?.signer_user_id?.message}
              />
            )}
          />

          <Controller
            name={`signers.${signerIndex}.action`}
            control={control}
            rules={{ required: "Action is required" }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                label="Action"
                maw={223}
                data={["approved", "noted", "purchased"]}
                error={errors.signers?.[signerIndex]?.action?.message}
              />
            )}
          />
        </Flex>

        <Checkbox
          label="Make primary approver"
          mt={24}
          {...register(`signers.${signerIndex}.is_primary_approver`)}
          onClick={() => onMakePrimaryApprover(signerIndex)}
          className={classes.checkboxCursor}
        />

        <FieldAddAndCancel
          onCancel={() => alert("cancel")}
          onSave={() => handleSave()}
        />
      </Container>
    </Paper>
  );
};

export default SignerForm;

type FieldAddAndCancelProps = {
  onCancel: MouseEventHandler<HTMLButtonElement>;
  onSave: MouseEventHandler<HTMLButtonElement>;
} & ButtonProps;

export const FieldAddAndCancel = ({
  onCancel,
  onSave,
}: FieldAddAndCancelProps) => {
  return (
    <Flex mt="xl" justify="center" gap="xl">
      <Button onClick={onCancel} variant="outline" color="red">
        Cancel
      </Button>
      <Button variant="light" onClick={onSave}>
        Save
      </Button>
    </Flex>
  );
};
