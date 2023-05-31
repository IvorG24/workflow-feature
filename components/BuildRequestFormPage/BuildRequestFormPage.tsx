import { defaultRequestFormBuilderSection } from "@/utils/contant";
import { AppType, TeamMemberWithUserType } from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Divider,
  LoadingOverlay,
  createStyles,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import FormBuilder, { FormBuilderData } from "../FormBuilder/FormBuilder";

const useStyles = createStyles((theme) => ({
  formNameInput: {
    '& input[type="text"]': {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 600,
      fontSize: 24,
    },
  },
  button: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : "#444746",
    fontWeight: 400,
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },
}));

type Props = {
  teamMemberList: TeamMemberWithUserType[];
};

const BuildFormPage = ({ teamMemberList }: Props) => {
  const formId = uuidv4();
  const formType: AppType = "REQUEST";
  const { classes } = useStyles();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultValues: FormBuilderData = {
    formId: formId,
    form_name: "",
    form_description: "",
    formType,
    revieweeList: null,
    sections: defaultRequestFormBuilderSection,
    signers: [],
    is_signature_required: false,
    created_at: new Date().toISOString(),
  };

  const methods = useForm<FormBuilderData>({ defaultValues: defaultValues });

  const { getValues, control } = methods;

  const {
    fields: sections,
    remove: removeSection,
    insert: insertSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const checkForError = (formData: FormBuilderData) => {
    let error = "";
    let hasNoChoices = false;
    formData.sections.forEach((section) => {
      if (section.section_name?.length === 0) {
        error = "Each section should have a name";
      }
      if (section.field_table.length === 0) {
        error = "At least 1 question per section is required";
      } else {
        section.field_table.map((field) => {
          if (field.field_name.length === 0) {
            error = "Question label is required on each question";
          }
          if (
            (field.field_type === "MULTISELECT" ||
              field.field_type === "SELECT") &&
            field.options.length <= 0
          )
            hasNoChoices = true;
        });
      }
    });

    if (!error) {
      if (formData.form_name.length <= 0) error = "Form name is required";
      else if (formData.sections.length === 0) {
        error = "At least 1 section is required";
      } else if (
        formData.signers.filter((signer) => signer.signer_username.length <= 0)
          .length > 0
      )
        error = "Signer is required";
      else if (
        formData.signers.filter((signer) => signer.action.length <= 0).length >
        0
      )
        error = "Signer action is required";
      else if (hasNoChoices)
        error = "At least one option is required in a Select or Multiselect";
    }

    if (error.length > 0) {
      notifications.show({
        message: error,
        color: "orange",
      });
      return true;
    }
    return false;
  };

  const handleSaveForm = async (formData: FormBuilderData) => {
    if (checkForError(formData)) return;
    try {
      setIsSubmitting(true);
      console.log(formData);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Container fluid>
      <LoadingOverlay
        visible={isSubmitting}
        overlayBlur={2}
        sx={{ position: "fixed" }}
      />
      <FormProvider {...methods}>
        <Container maw={768} p={0}>
          <FormBuilder.Container mt="xl">
            <Box maw={522}>
              <FormBuilder.FormNameInput />

              <FormBuilder.DescriptionInput mt={32} />
            </Box>
          </FormBuilder.Container>

          {sections.length > 0 &&
            sections.map((section, sectionIndex) => {
              return (
                <FormBuilder.Section
                  key={section.id}
                  mt={32}
                  section={section}
                  sectionIndex={sectionIndex}
                  onDelete={() => removeSection(sectionIndex)}
                  fields={section.field_table}
                  formId={formId}
                  formType={formType}
                  mode={section.section_order === 999 ? "view" : "edit"}
                />
              );
            })}

          {/* add new section divider */}
          <Divider
            maw={768}
            mx="auto"
            labelPosition="center"
            mt={24}
            label={
              <Button
                leftIcon={<IconPlus height={20} />}
                variant="subtle"
                className={classes.button}
                onClick={() =>
                  insertSection(sections.length, {
                    section_id: uuidv4(),
                    section_name: "",
                    section_form_id: formId,
                    section_order: sections.length + 1,
                    section_is_duplicatable: false,
                    field_table: [],
                  })
                }
              >
                Add New Section
              </Button>
            }
          />

          {formType === "REQUEST" && (
            <FormBuilder.SignerSection
              mt={32}
              formId={formId}
              teamMemberList={teamMemberList}
            />
          )}

          <FormBuilder.SubmitButton
            mt={32}
            onClick={() => handleSaveForm(getValues())}
          >
            Finish Building Form
          </FormBuilder.SubmitButton>
        </Container>
      </FormProvider>
    </Container>
  );
};

export default BuildFormPage;
