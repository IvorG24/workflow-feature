import { FormType } from "@/utils/types";
import { Container, Stack } from "@mantine/core";
import RequestFormDetails from "./RequestFormDetails";

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

  const sectionList = form.form_section;
  console.log(sectionList);
  return (
    <Container>
      <Stack spacing="xl">
        <RequestFormDetails formDetails={formDetails} />

        {/* {sectionList.map((section) => {
          const duplicateSectionIdList = section.section_field[0].field_response
            .map(
              (response) => response.request_response_duplicatable_section_id
            )
            .filter((id) => id !== null);
          // if duplicateSectionIdList is empty, use section_id instead
          const newSectionIdList =
            duplicateSectionIdList.length > 0
              ? duplicateSectionIdList
              : [section.section_id];

          return (
            <>
              {newSectionIdList.map((sectionId) => (
                <RequestFormSection
                  key={sectionId}
                  duplicateSectionId={sectionId}
                  section={section}
                />
              ))}
            </>
          );
        })} */}
      </Stack>
    </Container>
  );
};

export default CreateRequestPage;
