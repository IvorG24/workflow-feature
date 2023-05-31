import { TeamMemberWithUserType } from "@/utils/types";
import {
  Box,
  Button,
  Center,
  Container,
  ContainerProps,
  List,
  Text,
  ThemeIcon,
  createStyles,
} from "@mantine/core";
import { IconCircleDashed, IconCirclePlus } from "@tabler/icons-react";
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
        : mode === "edit"
        ? theme.colors.gray[0]
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
  ...props
}: Props) => {
  const { classes } = useStyles({ mode });
  const methods = useFormContext<FormBuilderData>();

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
          {signers.map((signer, signerIndex) => (
            <Box key={signer.id} mt={signerIndex === 0 ? 24 : 16}>
              <SignerForm
                signerIndex={signerIndex}
                signer={signer as RequestSigner}
                onDelete={() => removeSigner(signerIndex)}
                onMakePrimaryApprover={() =>
                  handleMakePrimaryApprover(signerIndex)
                }
                mode={mode}
                teamMemberList={teamMemberList}
              />
            </Box>
          ))}
        </List>
      </Box>

      {mode === "edit" && (
        <>
          <Button
            onClick={() =>
              appendSigner({
                signer_id: uuidv4(),
                signer_action: "",
                signer_is_primary_signer: false,
                signer_team_member_id: "",
                signer_form_id: formId,
                signer_order: signers.length + 1,
              })
            }
            size="xs"
            mt={signers.length > 0 ? 32 : 64}
            leftIcon={<IconCirclePlus height={16} />}
          >
            Add a Signer
          </Button>
        </>
      )}
    </Container>
  );
};

export default SignerSection;
