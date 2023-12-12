import {
  getCSICode,
  getCSICodeOptionsForItems,
  getItem,
  getProjectSignerWithTeamMember,
  getSupplier,
} from "@/backend/api/get";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { Database } from "@/utils/database";
import { JoyRideNoSSR } from "@/utils/functions";
import {
  ONBOARDING_CREATE_REQUEST_STEP,
  ONBOARD_NAME,
} from "@/utils/onboarding";

import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  LoadingOverlay,
  Space,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { CallBackProps, STATUS } from "react-joyride";
import { v4 as uuidv4 } from "uuid";

export type Section = FormWithResponseType["form_section"][0];
export type Field = FormType["form_section"][0]["section_field"][0];

export type RequestFormValues = {
  sections: Section[];
};

export type FieldWithResponseArray = Field & {
  field_response: RequestResponseTableRow[];
};

type Props = {
  userId: string;
  teamId: string;
  form: FormType;
  itemOptions: OptionTableRow[];
  projectOptions: OptionTableRow[];
  specialApprover?: {
    special_approver_id: string;
    special_approver_item_list: string[];
    special_approver_signer: FormType["form_signer"][0];
  }[];
};

const OnboardingCreateRequisitionRequestPage = ({
  form,
  teamId,
  itemOptions,
  projectOptions,
}: Props) => {
  const router = useRouter();
  const formId = router.query.formId as string;
  const supabaseClient = createPagesBrowserClient<Database>();
  const { colors } = useMantineTheme();
  const [isOnboarding, setIsOnboarding] = useState(false);

  const [signerList, setSignerList] = useState(
    form.form_signer.map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
    }))
  );
  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues, setValue } = requestFormMethods;
  const {
    fields: formSections,
    insert: addSection,
    remove: removeSection,
    replace: replaceSection,
    update: updateSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    const newFields = form.form_section[1].section_field.map((field) => {
      if (field.field_name === "General Name") {
        return {
          ...field,
          field_option: itemOptions,
        };
      } else {
        return field;
      }
    });
    replaceSection([
      form.form_section[0],
      {
        ...form.form_section[1],
        section_field: newFields,
      },
    ]);
  }, [form, replaceSection, requestFormMethods, itemOptions]);

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      setIsLoading(true);
      if (data) {
        router.push(
          `/team-requests/forms/${router.query.formId}/create/onboarding/test?notice=success&path=/team-requests/forms/${router.query.formId}/create`
        );
      }
    } catch (error) {
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
    const sectionMatch = form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field.map(
        (field) => {
          if (field.field_name === "General Name") {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: itemOptions,
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

  const handleRemoveSection = (sectionDuplicatableId: string) => {
    const sectionMatchIndex = formSections.findIndex(
      (section) =>
        section.section_field[0].field_section_duplicatable_id ===
        sectionDuplicatableId
    );
    if (sectionMatchIndex) {
      removeSection(sectionMatchIndex);
      return;
    }
  };

  const handleGeneralNameChange = async (
    index: number,
    value: string | null
  ) => {
    const newSection = getValues(`sections.${index}`);
    if (value) {
      const item = await getItem(supabaseClient, {
        teamId: teamId,
        itemName: value,
      });

      const csiCodeList = await getCSICodeOptionsForItems(supabaseClient, {
        divisionIdList: item.item_division_id_list,
      });

      const generalField = [
        {
          ...newSection.section_field[0],
        },
        {
          ...newSection.section_field[1],
          field_response: item.item_unit,
        },
        {
          ...newSection.section_field[2],
        },
        {
          ...newSection.section_field[3],
          field_response: item.item_gl_account,
        },
        {
          ...newSection.section_field[4],
          field_response: "",
          field_option: csiCodeList.map((csiCode, index) => {
            return {
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: csiCode.csi_code_id,
              option_order: index,
              option_value: csiCode.csi_code_level_three_description,
            };
          }),
        },
        ...newSection.section_field.slice(5, 9).map((field) => {
          return {
            ...field,
            field_response: "",
          };
        }),
        {
          ...newSection.section_field[9],
        },
      ];
      const duplicatableSectionId = index === 1 ? undefined : uuidv4();

      const newFields = item.item_description.map((description) => {
        const options = description.item_description_field.map(
          (options, optionIndex) => {
            return {
              option_field_id: description.item_field.field_id,
              option_id: options.item_description_field_id,
              option_order: optionIndex + 1,
              option_value: `${options.item_description_field_value}${
                description.item_description_is_with_uom
                  ? ` ${options.item_description_field_uom[0].item_description_field_uom}`
                  : ""
              }`,
            };
          }
        );

        return {
          ...description.item_field,
          field_section_duplicatable_id: duplicatableSectionId,
          field_option: options,
          field_response: "",
        };
      });

      updateSection(index, {
        ...newSection,
        section_field: [
          ...generalField.map((field) => {
            return {
              ...field,
              field_section_duplicatable_id: duplicatableSectionId,
            };
          }),
          ...newFields,
        ],
      });
    } else {
      const generalField = [
        ...newSection.section_field.slice(0, 3),
        ...newSection.section_field.slice(3, 9).map((field) => {
          return {
            ...field,
            field_response: "",
            field_option: [],
          };
        }),
        newSection.section_field[9],
      ];
      updateSection(index, {
        ...newSection,
        section_field: generalField,
      });
    }
  };

  const handleCSICodeChange = async (index: number, value: string | null) => {
    const newSection = getValues(`sections.${index}`);

    if (value) {
      const csiCode = await getCSICode(supabaseClient, { csiCode: value });

      const generalField = [
        ...newSection.section_field.slice(0, 5),
        {
          ...newSection.section_field[5],
          field_response: csiCode?.csi_code_section,
        },
        {
          ...newSection.section_field[6],
          field_response: csiCode?.csi_code_division_description,
        },
        {
          ...newSection.section_field[7],
          field_response: csiCode?.csi_code_level_two_major_group_description,
        },
        {
          ...newSection.section_field[8],
          field_response: csiCode?.csi_code_level_two_minor_group_description,
        },
        ...newSection.section_field.slice(9),
      ];
      const duplicatableSectionId = index === 1 ? undefined : uuidv4();

      updateSection(index, {
        ...newSection,
        section_field: [
          ...generalField.map((field) => {
            return {
              ...field,
              field_section_duplicatable_id: duplicatableSectionId,
            };
          }),
        ],
      });
    } else {
      const generalField = [
        ...newSection.section_field.slice(0, 4),
        ...newSection.section_field.slice(4, 9).map((field) => {
          return {
            ...field,
            field_response: "",
          };
        }),
        ...newSection.section_field.slice(9),
      ];
      updateSection(index, {
        ...newSection,
        section_field: generalField,
      });
    }
  };

  const resetSigner = () => {
    setSignerList(
      form.form_signer.map((signer) => ({
        ...signer,
        signer_action: signer.signer_action.toUpperCase(),
      }))
    );
  };

  const handleProjectNameChange = async (value: string | null) => {
    try {
      setIsFetchingSigner(true);
      if (value) {
        const projectId = projectOptions.find(
          (option) => option.option_value === value
        )?.option_id;
        if (projectId) {
          const data = await getProjectSignerWithTeamMember(supabaseClient, {
            projectId,
            formId,
          });
          if (data.length !== 0) {
            setSignerList(data as unknown as FormType["form_signer"]);
          } else {
            resetSigner();
          }
        }
      } else {
        resetSigner();
      }
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  const supplierSearch = async (value: string, index: number) => {
    try {
      setIsSearching(true);
      const supplierList = await getSupplier(supabaseClient, {
        supplier: value ?? "",
        teamId: teamId,
        fieldId: form.form_section[1].section_field[9].field_id,
      });
      setValue(`sections.${index}.section_field.9.field_option`, supplierList);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const openCreateRequestOnboardingModal = () =>
    modals.open({
      centered: true,
      closeOnEscape: false,
      closeOnClickOutside: false,
      withCloseButton: false,
      children: (
        <Box>
          <Title order={3}>Welcome to Request Creation</Title>
          <Text mt="xs">
            Explore and test your skills in creating requests. This quick
            session will guide you through key features.
          </Text>
          <Text mt="md">
            Feel free to experiment, and don&apos;t worry—this is a safe space
            to learn and explore.
          </Text>
          <Flex justify="flex-end" direction="row" gap="md" mt="lg">
            <Button
              variant="outline"
              onClick={() => {
                modals.closeAll();
                router.push(
                  `/team-requests/forms/${router.query.formId}/create`
                );
              }}
            >
              Skip Onboarding
            </Button>
            <Button
              onClick={() => {
                modals.closeAll();
                setIsOnboarding(true);
              }}
            >
              Start
            </Button>
          </Flex>
        </Box>
      ),
    });

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED) {
      router.push(
        `/user/onboarding/test?notice=success&onboardName=${ONBOARD_NAME.CREATE_REQUISITION}`
      );
    }
  };

  useEffect(() => {
    openCreateRequestOnboardingModal();
  }, []);

  return (
    <Container>
      <Title order={2} color="dimmed">
        Create Request Onboarding
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleCreateRequest)}>
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
            {formSections.map((section, idx) => {
              const sectionIdToFind = section.section_id;
              const sectionLastIndex = getValues("sections")
                .map((sectionItem) => sectionItem.section_id)
                .lastIndexOf(sectionIdToFind);
              const duplicateSections = formSections.filter(
                (section) => section.section_name === "Item"
              );

              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    onRemoveSection={handleRemoveSection}
                    requisitionFormMethods={{
                      onGeneralNameChange: handleGeneralNameChange,
                      onProjectNameChange: handleProjectNameChange,
                      onCSICodeChange: handleCSICodeChange,
                      supplierSearch,
                      isSearching,
                    }}
                    formslyFormName="Requisition"
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
                        disabled={isOnboarding && duplicateSections.length > 1}
                        className="onboarding-create-request-duplicate-item"
                      >
                        {section.section_name} +
                      </Button>
                    )}
                </Box>
              );
            })}
            <Box
              pos="relative"
              className="onboarding-create-request-signer-section"
            >
              <LoadingOverlay visible={isFetchingSigner} overlayBlur={2} />
              <RequestFormSigner signerList={signerList} />
            </Box>
            <Button
              type="submit"
              className="onboarding-create-request-submit-button"
            >
              Submit
            </Button>
          </Stack>
        </form>
        <JoyRideNoSSR
          callback={handleJoyrideCallback}
          continuous
          run={true}
          steps={ONBOARDING_CREATE_REQUEST_STEP}
          scrollToFirstStep
          hideCloseButton
          disableCloseOnEsc
          disableOverlayClose
          showProgress
          styles={{
            buttonNext: { backgroundColor: colors.blue[6] },
            buttonBack: { color: colors.blue[6] },
            beaconInner: { backgroundColor: colors.blue[6] },
            tooltipContent: { padding: 0 },
          }}
        />
      </FormProvider>
    </Container>
  );
};

export default OnboardingCreateRequisitionRequestPage;
