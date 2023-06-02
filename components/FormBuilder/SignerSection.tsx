import { TeamMemberWithUserType } from "@/utils/types";
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
  Space,
  Text,
  ThemeIcon,
  createStyles,
} from "@mantine/core";
import {
  IconCircleDashed,
  IconCirclePlus,
  IconTrash,
} from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import useDeepCompareEffect from "use-deep-compare-effect";
import { v4 as uuidv4 } from "uuid";
import { FormBuilderData } from "./FormBuilder";
import SignerForm from "./SignerForm";

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

type Props = {
  formId: string;
  mode?: Mode;
  teamMemberList?: TeamMemberWithUserType[];
  activeSigner: number | null;
  onSetActiveSigner: Dispatch<SetStateAction<number | null>>;
} & ContainerProps;

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

const SignerSection = ({
  mode = "edit",
  teamMemberList = [],
  formId,
  activeSigner,
  onSetActiveSigner,
  ...props
}: Props) => {
  const { classes } = useStyles({ mode });
  const methods = useFormContext<FormBuilderData>();

  const [signerList, setSignerList] = useState<string[]>([]);

  const {
    fields: signers,
    append: appendSigner,
    remove: removeSigner,
  } = useFieldArray({
    control: methods.control,
    name: "signers",
  });

  const watchedData = useWatch({
    control: methods.control,
  });

  const handleMakePrimaryApprover = (index: number) => {
    signers.forEach((signer, signerIdx) => {
      methods.setValue(
        `signers.${signerIdx}.signer_is_primary_signer`,
        signerIdx === index
      );
    });
  };

  const handleChangeActiveSigner = (index: number | null) => {
    onSetActiveSigner(index);
  };

  // this is to update the field order when a field is removed
  useDeepCompareEffect(() => {
    signers.forEach((signer, index) => {
      methods.setValue(`signers.${index}.signer_order`, index + 1);
    });
  }, [watchedData]);

  return (
    <Container maw={768} className={classes.container} {...props}>
      <Box>
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
          <Space h="xs" />
          {signers.map((signer, signerIndex) => (
            <Flex
              align="center"
              gap="md"
              key={signer.id}
              w="100%"
              mt={activeSigner === signerIndex ? "xs" : 0}
            >
              <Box w="100%">
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
                  signerList={signerList}
                  onSetSignerList={setSignerList}
                />
              </Box>
              {activeSigner === null && (
                <ActionIcon
                  onClick={() => removeSigner(signerIndex)}
                  variant="light"
                  mt="sm"
                  color="red"
                  size="sm"
                >
                  <IconTrash size={14} stroke={1.5} />
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
                signer_action: "",
                signer_is_primary_signer: false,
                signer_team_member_id: "",
                signer_form_id: formId,
                signer_order: signers.length + 1,
              });
              handleChangeActiveSigner(signers.length);
            }}
            disabled={activeSigner !== null}
            size="xs"
            mt={signers.length > 0 ? 32 : 64}
            leftIcon={<IconCirclePlus height={16} />}
          >
            Add a Signer
          </Button>

          <Divider mt="md" />

          <Checkbox
            label="Require requester and approver's signature during request creation and approval"
            {...methods.register("isSignatureRequired")}
            my="xl"
            sx={{ input: { cursor: "pointer" } }}
          />
        </>
      )}
    </Container>
  );
};

export default SignerSection;
