import {
  checkIfRequestIsPending,
  checkRequisitionQuantity,
  getMultipleProjectSignerWithTeamMember,
} from "@/backend/api/get";
import { editRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/EditRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/EditRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/EditRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { areEqual } from "@/utils/arrayFunctions/arrayFunctions";
import { Database } from "@/utils/database";
import { parseJSONIfValid } from "@/utils/string";
import {
  FormType,
  OptionTableRow,
  RequestResponseTableRow,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  List,
  LoadingOverlay,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { toUpper } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { RequestFormValues } from "../EditRequestPage/EditRequestPage";

export type Section =
  RequestWithResponseType["request_form"]["form_section"][0];
export type Field = FormType["form_section"][0]["section_field"][0];

export type FieldWithResponseArray = Field & {
  field_response: RequestResponseTableRow[];
};

type Props = {
  request: RequestWithResponseType;
  itemOptions: OptionTableRow[];
  requestingProject: string;
};

const EditSourcedItemRequestPage = ({
  request,
  itemOptions,
  requestingProject,
}: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [previousProjectSite, setPreviousProjetcSite] = useState<string[]>([]);

  const initialSignerList: FormType["form_signer"] = request.request_signer
    .map((signer) => signer.request_signer_signer)
    .map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
      signer_team_member: {
        ...signer.signer_team_member,
        team_member_user: {
          ...signer.signer_team_member.team_member_user,
          user_id: signer.signer_team_member.team_member_user.user_id,
          user_avatar: "",
        },
      },
    }));

  const [signerList, setSignerList] =
    useState<FormType["form_signer"]>(initialSignerList);

  const { request_form } = request;
  const formDetails = {
    form_name: request_form.form_name,
    form_description: request_form.form_description,
    form_date_created: request.request_date_created,
    form_team_member: request.request_team_member,
  };

  const requestFormMethods = useForm<RequestFormValues>({
    defaultValues: { sections: request_form.form_section },
  });

  const {
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { isDirty },
  } = requestFormMethods;
  const {
    fields: formSections,
    insert: addSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const handleEditRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;
      setIsLoading(true);

      const requisitionID = JSON.stringify(
        data.sections[0].section_field[0].field_response[0].request_response
      );

      const tempRequestId = uuidv4();

      const itemFieldList: RequestResponseTableRow[] = [];
      const quantityFieldList: RequestResponseTableRow[] = [];

      const mergedSection: Section[] = [];
      const itemNameList: string[] = [];

      data.sections.slice(1).forEach((section) => {
        const response = parseJSONIfValid(
          section.section_field[0].field_response[0].request_response
        );
        const itemIndex = itemNameList.indexOf(`${response}`);
        if (itemIndex === -1) {
          mergedSection.push(section);
          itemNameList.push(`${response}`);
        } else {
          const sum =
            Number(
              mergedSection[itemIndex].section_field[1].field_response[0]
                .request_response
            ) +
            Number(section.section_field[1].field_response[0].request_response);
          mergedSection[
            itemIndex
          ].section_field[1].field_response[0].request_response = `${sum}`;
        }
      });

      mergedSection.forEach((section) => {
        section.section_field.forEach((field) => {
          if (field.field_name === "Item") {
            itemFieldList.push({
              request_response_id: uuidv4(),
              request_response: JSON.stringify(
                field.field_response[0].request_response
              ),
              request_response_duplicatable_section_id: null,
              request_response_field_id: field.field_id,
              request_response_request_id: tempRequestId,
            });
          } else if (field.field_name === "Quantity") {
            quantityFieldList.push({
              request_response_id: uuidv4(),
              request_response: JSON.stringify(
                field.field_response[0].request_response
              ),
              request_response_duplicatable_section_id: null,
              request_response_field_id: field.field_id,
              request_response_request_id: tempRequestId,
            });
          }
        });
      });

      console.log(mergedSection);
      console.log(itemNameList);

      const warningItemList = await checkRequisitionQuantity(supabaseClient, {
        requisitionID,
        itemFieldList,
        quantityFieldList,
      });

      if (warningItemList && warningItemList.length !== 0) {
        modals.open({
          title: "You cannot edit this request.",
          centered: true,
          children: (
            <Box maw={390}>
              <Title order={5}>
                There are items that will exceed the quantity limit of the
                Requisition
              </Title>
              <List size="sm" mt="md" spacing="xs">
                {warningItemList.map((item) => (
                  <List.Item key={item}>{item}</List.Item>
                ))}
              </List>
              <Button fullWidth onClick={() => modals.closeAll()} mt="md">
                Close
              </Button>
            </Box>
          ),
        });
      } else {
        const mergedSectionInput: Section[] = [];
        const itemNameListInput: string[] = [];

        const sectionData = getValues("sections");

        sectionData.slice(1).forEach((section) => {
          const firstFieldResponse = parseJSONIfValid(
            section.section_field[0].field_response[0].request_response
          );
          const lastFieldResponse = parseJSONIfValid(
            section.section_field[2].field_response[0].request_response
          );
          const inputIndex = itemNameListInput.indexOf(
            `${firstFieldResponse}+${lastFieldResponse}`
          );

          if (inputIndex === -1) {
            mergedSectionInput.push(section);

            itemNameListInput.push(
              `${firstFieldResponse}+${lastFieldResponse}`
            );
          } else {
            const sum =
              Number(
                mergedSectionInput[inputIndex].section_field[1]
                  .field_response[0].request_response
              ) +
              Number(
                section.section_field[1].field_response[0].request_response
              );
            mergedSectionInput[
              inputIndex
            ].section_field[1].field_response[0].request_response = `${sum}`;
          }
        });

        const isPending = await checkIfRequestIsPending(supabaseClient, {
          requestId: request.request_id,
        });

        if (!isPending) {
          notifications.show({
            message: "Request can't be edited",
            color: "red",
          });
          router.push(`/team-requests/requests/${request.request_id}`);
          return;
        }

        await editRequest(supabaseClient, {
          requestId: request.request_id,
          requestFormValues: {
            sections: [data.sections[0], ...mergedSectionInput],
          },
          signers: signerList,
          teamId: teamMember.team_member_team_id,
          requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
          formName: request_form.form_name,
        });

        notifications.show({
          message: "Request edited.",
          color: "green",
        });
        router.push(`/team-requests/requests/${request.request_id}`);
      }
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateSection = (sectionId: string) => {
    const sectionLastIndex = formSections
      .map((sectionItem) => sectionItem.section_id)
      .lastIndexOf(sectionId);
    const sectionMatch = request_form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field.map(
        (field) => {
          if (field.field_name === "Item") {
            return {
              ...field,
              field_option: itemOptions,
              field_section_duplicatable_id: sectionDuplicatableId,
            };
          } else {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
            };
          }
        }
      );
      const newSection = {
        ...sectionMatch,
        section_field: duplicatedFieldsWithDuplicatableId,
      };
      addSection(sectionLastIndex + 1, newSection);
      return;
    }
  };

  const handleRemoveSection = (sectionMatchIndex: number) => {
    removeSection(sectionMatchIndex);
    handleProjectSiteChange();
  };

  const handleProjectSiteChange = async () => {
    const sectionList = getValues(`sections`);
    const itemSectionList = sectionList.slice(1);

    const currentProjectSiteList = [
      ...new Set(
        itemSectionList.map(
          (section) =>
            section.section_field[2].field_response[0].request_response
        )
      ),
    ].filter((project) => project !== null);
    const previousProjectSiteList = [...new Set(previousProjectSite)].filter(
      (project) => project !== null
    );

    if (
      areEqual(
        currentProjectSiteList as string[],
        previousProjectSiteList as string[]
      )
    )
      return;

    setIsFetchingSigner(true);
    const newSignerList = currentProjectSiteList as string[];
    setPreviousProjetcSite(newSignerList);
    const data = await getMultipleProjectSignerWithTeamMember(supabaseClient, {
      formId: request_form.form_id,
      projectName: newSignerList,
    });
    const formattedData = data as unknown as FormType["form_signer"];

    const teamMemberIdList = [
      ...initialSignerList.map(
        (signer) => signer.signer_team_member.team_member_id
      ),
    ];
    const finalSigners = [...initialSignerList];

    formattedData.forEach((signer) => {
      if (
        !teamMemberIdList.includes(signer.signer_team_member.team_member_id)
      ) {
        teamMemberIdList.push(signer.signer_team_member.team_member_id);
        finalSigners.push({
          ...signer,
          signer_is_primary_signer: false,
          signer_action: toUpper(signer.signer_action),
        } as FormType["form_signer"][0]);
      }
    });
    setSignerList(finalSigners);

    try {
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  return (
    <Container>
      <Title order={2} color="dimmed">
        Edit Request
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleEditRequest)}>
          <Stack spacing="xl">
            <RequestFormDetails
              formDetails={formDetails}
              requestingProject={requestingProject}
            />
            {formSections.map((section, idx) => {
              const sectionIdToFind = section.section_id;
              const sectionLastIndex = getValues("sections")
                .map((sectionItem) => sectionItem.section_id)
                .lastIndexOf(sectionIdToFind);
              const isRemovable =
                formSections[idx - 1]?.section_is_duplicatable &&
                section.section_is_duplicatable;
              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    formslyFormName="Sourced Item"
                    isSectionRemovable={isRemovable}
                    onRemoveSection={handleRemoveSection}
                    sourcedItemFormMethods={{
                      onProjectSiteChange: handleProjectSiteChange,
                    }}
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
                        {section.section_name} +
                      </Button>
                    )}
                </Box>
              );
            })}
            <Box pos="relative">
              <LoadingOverlay visible={isFetchingSigner} overlayBlur={2} />
              <RequestFormSigner signerList={signerList} />
            </Box>
            <Flex direction="column" gap="sm">
              {isDirty && (
                <Button variant="outline" color="red" onClick={() => reset()}>
                  Reset
                </Button>
              )}
              <Button type="submit" disabled={!isDirty}>
                Submit
              </Button>
            </Flex>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default EditSourcedItemRequestPage;
