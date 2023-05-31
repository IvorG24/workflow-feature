import { ReceiverStatusType, TeamMemberWithUserType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  Container,
  ContainerProps,
  Divider,
  Flex,
  List,
  Text,
  ThemeIcon,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCircleDashed,
  IconCirclePlus,
  IconSettings,
} from "@tabler/icons-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { FormBuilderData } from "./FormBuilder";
import SignerForm from "./SignerForm";

export type Mode = "answer" | "edit" | "view";

export type SignerActions = "approved" | "noted" | "purchased";

export type RequestSigner = {
  signer_id: string;
  signer_user_id: string;
  signer_username: string;
  action: SignerActions | string;
  status: ReceiverStatusType;
  is_primary_approver: boolean;
};

type Props = {
  formId?: string;
  mode?: Mode;
  teamMemberList?: TeamMemberWithUserType[];
} & ContainerProps;

type UseStylesProps = {
  mode: Mode;
};

const useStyles = createStyles((theme, { mode }: UseStylesProps) => ({
  container: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? mode === "edit"
          ? theme.colors.dark[6]
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

const SignerSection = ({
  mode = "edit",
  teamMemberList = [],
  ...props
}: Props) => {
  const { classes } = useStyles({ mode });
  const methods = useFormContext<FormBuilderData>();
  const [activeSigner, setActiveSigner] = useState<number | null>(null);
  const { colorScheme } = useMantineTheme();

  const {
    fields: signers,
    append: appendSigner,
    remove: removeSigner,
  } = useFieldArray({
    control: methods.control,
    name: "signers",
  });

  const handleMakePrimaryApprover = (index: number) => {
    signers.forEach((signer, signerIdx) => {
      methods.setValue(
        `signers.${signerIdx}.is_primary_approver`,
        signerIdx === index
      );
    });
  };

  const handleChangeActiveSigner = (index: number | null) => {
    setActiveSigner(index);
  };

  return (
    <Container maw={768} className={classes.container} {...props}>
      <Box maw={522}>
        <Text weight={600} size={18}>
          Signers
        </Text>
        <List
          spacing={4}
          size="xs"
          center
          icon={
            <Center>
              <ThemeIcon color="blue" size="xs" radius="xl">
                <IconCircleDashed />
              </ThemeIcon>
            </Center>
          }
        >
          {signers.map((signer, signerIndex) => (
            <Flex
              align="center"
              gap="xs"
              key={signer.id}
              mt={signerIndex === 0 ? 24 : 16}
              w="100%"
            >
              <Box>
                <SignerForm
                  signerIndex={signerIndex}
                  signer={signer as RequestSigner}
                  onDelete={() => removeSigner(signerIndex)}
                  onMakePrimaryApprover={() =>
                    handleMakePrimaryApprover(signerIndex)
                  }
                  mode={mode}
                  teamMemberList={teamMemberList}
                  isActive={activeSigner === signerIndex}
                  onNotActiveSigner={() => handleChangeActiveSigner(null)}
                />
              </Box>
              {activeSigner === null && (
                <ActionIcon
                  onClick={() => handleChangeActiveSigner(signerIndex)}
                >
                  <IconSettings
                    color={colorScheme === "dark" ? "#c3c3c3" : "#2e2e2e"}
                    size={18}
                  />
                </ActionIcon>
              )}
            </Flex>
          ))}
        </List>
      </Box>

      {mode === "edit" && (
        <>
          <Button
            onClick={() => {
              appendSigner({
                signer_id: uuidv4(),
                action: "",
                status: "PENDING",
                is_primary_approver: false,
                signer_user_id: "",
                signer_username: "",
              });
              handleChangeActiveSigner(signers.length);
            }}
            size="xs"
            mt={signers.length > 0 ? 32 : 64}
            leftIcon={<IconCirclePlus height={16} />}
          >
            Add a Signer
          </Button>

          <Divider mt="md" />

          <Checkbox
            label="Require requester and approver's signature during request creation and approval"
            {...methods.register("is_signature_required")}
            my="xl"
          />
        </>
      )}
    </Container>
  );
};

export default SignerSection;
