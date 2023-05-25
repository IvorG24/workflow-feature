import { Member } from "@/backend/utils/types";
import {
  ActionIcon,
  Autocomplete,
  Box,
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
import { useClickOutside } from "@mantine/hooks";
import {
  IconCircleCheck,
  IconCircleMinus,
  IconTrash,
} from "@tabler/icons-react";
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
  teamMemberList: Member[];
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

  const signerUsername = watch(`signers.${signerIndex}.signer_username`);
  const signerAction = watch(`signers.${signerIndex}.action`);
  const signerActionStatus = watch(`signers.${signerIndex}.status`);
  const isPrimaryApprover = watch(`signers.${signerIndex}.is_primary_approver`);

  const signerOptions = teamMemberList.map((member) => {
    return {
      value: member.user.username || "",
      label: member.user.username || "",
    };
  });

  useEffect(() => {
    if (mode !== "edit") return;
    const selectedUserId =
      teamMemberList.find((member) => member.user.username === signerUsername)
        ?.user.id || "";

    setValue(`signers.${signerIndex}.signer_user_id`, selectedUserId);
  }, [signerUsername]);

  if (!isActive) {
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
          {(!signerActionStatus || signerActionStatus === "ACTION_PENDING") && (
            <List.Item>
              Will be {signerAction} by {signerUsername}
            </List.Item>
          )}

          {signerActionStatus === "ACTION_APPROVED" && (
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

          {signerActionStatus === "ACTION_REJECTED" && (
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

          {/* {signerActionStatus === "CANCELED" && (
            <List.Item
              icon={
                <Center>
                  <ThemeIcon color="dark" size="xs" radius="xl">
                    <IconCircleDashed />
                  </ThemeIcon>
                </Center>
              }
            >
              Canceled by {signerUsername}
            </List.Item>
          )} */}

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
            name={`signers.${signerIndex}.signer_username`}
            control={control}
            render={({ field }) => (
              <Select
                maw={223}
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
            name={`signers.${signerIndex}.action`}
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                label="Action"
                maw={223}
                // value={actionName}
                // onChange={(value) => setActionName(value)}
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
          {...register(`signers.${signerIndex}.is_primary_approver`)}
          onClick={() => onMakePrimaryApprover(signerIndex)}
          className={classes.checkboxCursor}
        />
      </Container>
    </Paper>
  );
};

export default SignerForm;
