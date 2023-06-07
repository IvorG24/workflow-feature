import { TeamMemberWithUserType } from "@/utils/types";
import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
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
} from "@mantine/core";
import { IconArrowsExchange, IconTrash } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FormBuilderData } from "./FormBuilder";
import { Mode } from "./Section";
import { RequestSigner } from "./SignerSection";

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

type Props = {
  signer: RequestSigner;
  signerIndex: number;
  onDelete: (signerIndex: number) => void;
  mode: Mode;
  teamMemberList: TeamMemberWithUserType[];
  onMakePrimarySigner: (signerIndex: number) => void;
  isActive: boolean;
  onNotActiveSigner: () => void;
  signerList: string[];
  onSetSignerList: Dispatch<SetStateAction<string[]>>;
  handleMakePrimarySigner: (index: number) => void;
  isTransferVisible: boolean;
};

const SignerForm = ({
  signerIndex,
  onDelete,
  mode = "edit",
  teamMemberList,
  onMakePrimarySigner,
  isActive,
  onNotActiveSigner,
  signerList,
  onSetSignerList,
  handleMakePrimarySigner,
  isTransferVisible,
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
    (signer) => signer.signer_team_member_id
  );
  const signerUserId = watch(`signers.${signerIndex}.signer_team_member_id`);
  const signerAction = watch(`signers.${signerIndex}.signer_action`);
  const isPrimarySigner = watch(
    `signers.${signerIndex}.signer_is_primary_signer`
  );

  const filteredSignerOptions = teamMemberList.filter(
    (member) => !signerList?.includes(member.team_member_id)
  );

  const signerOptions = filteredSignerOptions.map((member) => {
    return {
      value: member.team_member_id,
      label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
    };
  });

  const handleDone = () => {
    if (signerUserId.length <= 0) {
      setError(`signers.${signerIndex}.signer_team_member_id`, {
        message: "Signer is required",
      });
    }

    if (signerAction.length <= 0) {
      setError(`signers.${signerIndex}.signer_action`, {
        message: "Action is required",
      });
    }
    if (signerUserId.length > 0 && signerAction.length > 0) {
      onSetSignerList(signerUserIdList);
      setError(`signers.${signerIndex}.signer_action`, { message: "" });
      setError(`signers.${signerIndex}.signer_team_member_id`, { message: "" });
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
        `signers.${signerIndex}.signer_team_member_id`,
        selectedUser.team_member_id
      );
    }
  }, [signerUserId]);

  if (!isActive) {
    const signer = teamMemberList.find(
      (member) => member.team_member_id === signerUserId
    );

    return (
      <Box
        role="button"
        aria-label="click to edit signer"
        onClick={() => {
          if (mode === "edit") onNotActiveSigner();
        }}
        className={classes.notActiveContainer}
      >
        <Group noWrap>
          <List.Item>
            Will be signed as {signerAction} by{" "}
            {`${signer?.team_member_user.user_first_name} ${signer?.team_member_user.user_last_name}`}
          </List.Item>
          {isPrimarySigner && (
            <Chip size="xs" variant="outline" checked={isPrimarySigner}>
              Primary
            </Chip>
          )}
          {!isPrimarySigner && isTransferVisible ? (
            <ActionIcon
              onClick={() => {
                handleMakePrimarySigner(signerIndex);
              }}
              variant="light"
              color="blue"
              size="sm"
            >
              <IconArrowsExchange size={14} stroke={1.5} />
            </ActionIcon>
          ) : null}
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
        variant="light"
      >
        <IconTrash height={16} />
      </ActionIcon>

      <Container fluid p={24}>
        <Flex gap="md" wrap="wrap" w="100%">
          <Controller
            name={`signers.${signerIndex}.signer_team_member_id`}
            control={control}
            rules={{ required: "Signer is required" }}
            render={({ field }) => (
              <Select
                label="Signer"
                data={signerOptions}
                {...field}
                error={
                  errors.signers?.[signerIndex]?.signer_team_member_id?.message
                }
                sx={{ flex: 1 }}
                miw={150}
              />
            )}
          />

          <Controller
            name={`signers.${signerIndex}.signer_action`}
            control={control}
            rules={{ required: "Action is required" }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                label="Action"
                data={["approved", "noted", "purchased"]}
                error={errors.signers?.[signerIndex]?.signer_action?.message}
                sx={{ flex: 1 }}
                miw={150}
              />
            )}
          />
        </Flex>

        <Checkbox
          label="Make primary signer"
          mt={24}
          {...register(`signers.${signerIndex}.signer_is_primary_signer`)}
          onClick={() => onMakePrimarySigner(signerIndex)}
          className={classes.checkboxCursor}
        />

        <Center mt="md">
          <Button onClick={() => handleDone()} w={80} variant="light">
            Done
          </Button>
        </Center>
      </Container>
    </Paper>
  );
};

export default SignerForm;
