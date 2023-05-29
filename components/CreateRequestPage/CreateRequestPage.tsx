import { FormType } from "@/utils/types";
import { Box, Button, Container, Stack } from "@mantine/core";
import { useState } from "react";
import RequestFormDetails from "./RequestFormDetails";
import RequestFormSection from "./RequestFormSection";
import RequestFormSigner from "./RequestFormSigner";

type CreateRequestPageProps = {
  form: FormType;
};

const CreateRequestPage = ({ form }: CreateRequestPageProps) => {
  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };
  const [sectionList, setSectionList] = useState(form.form_section);

  const handleAddDuplicate = (sectionId: string) => {
    const sectionMatch = form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      setSectionList((prev) => {
        const updatedSectionList = [...prev, { ...sectionMatch }];
        const sortSectionByOrder = updatedSectionList.sort(
          (a, b) => a.section_order - b.section_order
        );
        return sortSectionByOrder;
      });
    }
  };
  const signerList = form.form_signer.map((signer) => ({
    ...signer,
    signer_action: signer.signer_action.toUpperCase(),
  }));

  return (
    <Container>
      <Stack spacing="xl">
        <RequestFormDetails formDetails={formDetails} />
        {sectionList.map((section, idx) => {
          // used to render add duplicate button
          // find the last index of current section, and render add duplicate button if match
          const sectionIdToFind = section.section_id;
          const sectionLastIndex = sectionList
            .map((sectionItem) => sectionItem.section_id)
            .lastIndexOf(sectionIdToFind);

          return (
            <Box key={section.section_id + idx}>
              <RequestFormSection key={section.section_id} section={section} />
              {section.section_is_duplicatable && idx === sectionLastIndex && (
                <Button
                  mt="md"
                  variant="outline"
                  onClick={() => handleAddDuplicate(section.section_id)}
                  fullWidth
                >
                  Add Duplicate
                </Button>
              )}
            </Box>
          );
        })}

        <RequestFormSigner signerList={signerList} />
      </Stack>
    </Container>
  );
};

export default CreateRequestPage;
