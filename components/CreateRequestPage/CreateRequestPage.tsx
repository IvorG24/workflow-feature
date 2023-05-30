import { FormType } from "@/utils/types";
import { Box, Button, Container, Stack } from "@mantine/core";
import { useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import RequestFormDetails from "./RequestFormDetails";
import RequestFormSection from "./RequestFormSection";
import RequestFormSigner from "./RequestFormSigner";

export type Section = FormType["form_section"][0];

type CreateRequestPageProps = {
  form: FormType;
};

type RequestFormValues = {
  sections: Section[];
};

const CreateRequestPage = ({ form }: CreateRequestPageProps) => {
  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };
  const signerList = form.form_signer.map((signer) => ({
    ...signer,
    signer_action: signer.signer_action.toUpperCase(),
  }));

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues } = requestFormMethods;
  const { fields: formSections, insert: addSection } = useFieldArray({
    control,
    name: "sections",
  });
  const handleCreateRequest = (data: RequestFormValues) => console.log(data);

  useEffect(() => {
    requestFormMethods.setValue("sections", form.form_section);
  }, [form]);

  const handleDuplicateSection = (sectionId: string) => {
    const sectionLastIndex = formSections
      .map((sectionItem) => sectionItem.section_id)
      .lastIndexOf(sectionId);
    const sectionMatch = formSections.find(
      (section) => section.section_id === sectionId
    );
    console.log(sectionId);
    if (sectionMatch) {
      addSection(sectionLastIndex, sectionMatch);
      return;
    }
  };

  return (
    <Container>
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleCreateRequest)}>
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
            {formSections.map((section, idx) => {
              // used to render add duplicate button
              // find the last index of current section, and render add duplicate button if match
              const sectionIdToFind = section.section_id;
              const sectionLastIndex = getValues("sections")
                .map((sectionItem) => sectionItem.section_id)
                .lastIndexOf(sectionIdToFind);

              return (
                <Box key={section.section_id + idx}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                  />
                  {section.section_is_duplicatable &&
                    idx === sectionLastIndex && (
                      <Button
                        mt="md"
                        variant="default"
                        onClick={() =>
                          handleDuplicateSection(section.section_id)
                        }
                        fullWidth
                      >
                        Add Duplicate
                      </Button>
                    )}
                </Box>
              );
            })}
            <RequestFormSigner signerList={signerList} />
            <Stack>
              <Button type="submit">Submit</Button>
              <Button variant="outline">Cancel</Button>
            </Stack>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateRequestPage;
