import {
  getEquipmentDescription,
  getEquipmentName,
  getEquipmentPropertyNumber,
  getItemSectionChoices,
  getItemUnitOfMeasurement,
  getProjectSignerWithTeamMember,
} from "@/backend/api/get";
import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { createRange } from "@/utils/arrayFunctions/arrayFunctions";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
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
  LoadingOverlay,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
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
  form: FormType;
  projectOptions: OptionTableRow[];
  categoryOptions: OptionTableRow[];
};

const CreatePEDPartRequestPage = ({
  form,
  projectOptions,
  categoryOptions,
}: Props) => {
  const router = useRouter();
  const formId = router.query.formId as string;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

  const [signerList, setSignerList] = useState(
    form.form_signer.map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
    }))
  );
  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [storedFields, setStoredFields] = useState<Section["section_field"]>(
    []
  );
  const [generalItemNameChoices, setGeneralItemNameChoices] = useState<
    OptionTableRow[]
  >([]);
  const [equipmentId, setEquipmentId] = useState("");

  const requestorProfile = useUserProfile();
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
    const newFields = form.form_section[0].section_field.filter(
      (field) => field.field_type !== "FILE"
    );
    replaceSection([
      {
        ...form.form_section[0],
        section_field: newFields,
      },
      form.form_section[1],
    ]);
  }, [form, requestFormMethods]);

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      setIsLoading(true);

      const response = data.sections[0].section_field[0]
        .field_response as string;

      const projectId = data.sections[0].section_field[0].field_option.find(
        (option) => option.option_value === response
      )?.option_id as string;

      const request = await createRequest(supabaseClient, {
        requestFormValues: data,
        formId,
        teamMemberId: teamMember.team_member_id,
        signers: signerList,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: form.form_name,
        isFormslyForm: true,
        projectId,
        teamName: formatTeamNameToUrlKey(team.team_name ?? ""),
      });

      notifications.show({
        message: "Request created.",
        color: "green",
      });

      router.push(
        `/${formatTeamNameToUrlKey(team.team_name ?? "")}/requests/${
          request.request_formsly_id_prefix
        }-${request.request_formsly_id_serial}`
      );
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
          if (field.field_name === "General Item Name")
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: generalItemNameChoices,
            };

          return {
            ...field,
            field_section_duplicatable_id: sectionDuplicatableId,
          };
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

  const resetItemSection = () => {
    const itemSection = getValues(`sections.1`);
    if (formSections.length > 2) {
      removeSection(createRange(2, formSections.length - 1));
    }
    const newItemField = itemSection.section_field.map((field) => {
      return {
        ...field,
        field_response: "",
        field_option: [],
      };
    });
    updateSection(1, { ...itemSection, section_field: newItemField });
  };

  const handleCategoryChange = async (value: string | null) => {
    const newSection = getValues(`sections.0`);
    try {
      resetItemSection();
      if (value) {
        const categoryId = categoryOptions.find(
          (category) => category.option_value === value
        );
        if (!categoryId) return;
        const equipmentName = await getEquipmentName(supabaseClient, {
          category: categoryId.option_id,
        });

        const generalField = [
          ...newSection.section_field.slice(0, 3),
          {
            ...newSection.section_field[3],
            field_response: "",
            field_option: equipmentName.map((equipment, index) => {
              return {
                option_field_id: form.form_section[0].section_field[3].field_id,
                option_id: equipment.equipment_id,
                option_order: index,
                option_value: equipment.equipment_name,
              };
            }),
          },
          ...newSection.section_field.slice(4, 8).map((field) => {
            return {
              ...field,
              field_response: "",
            };
          }),
          ...newSection.section_field.slice(8),
        ];

        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 3),
          ...newSection.section_field.slice(3, 8).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
          ...newSection.section_field.slice(8),
        ];
        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.0.section_field.${1}.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
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
      const fields = getValues(`sections.0.section_field`);
      setValue(
        `sections.0.section_field.${fields.length - 1}.field_response`,
        ""
      );
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  const handleEquipmentNameChange = async (value: string | null) => {
    const newSection = getValues(`sections.0`);
    resetItemSection();
    try {
      if (value) {
        const equipmentOptions = newSection.section_field[3].field_option;
        const equipmentId = equipmentOptions.find(
          (equipment) => equipment.option_value === value
        );
        if (!equipmentId) return;
        const equipmentPropertyNumber = await getEquipmentPropertyNumber(
          supabaseClient,
          {
            equipmentId: equipmentId?.option_id,
          }
        );

        const generalField = [
          ...newSection.section_field.slice(0, 4),
          {
            ...newSection.section_field[4],
            field_response: "",
            field_option: equipmentPropertyNumber.map(
              (propertyNumber, index) => {
                return {
                  option_field_id:
                    form.form_section[0].section_field[0].field_id,
                  option_id:
                    propertyNumber.equipment_description_property_number,
                  option_order: index,
                  option_value:
                    propertyNumber.equipment_description_property_number,
                };
              }
            ),
          },
          ...newSection.section_field.slice(5, 8).map((field) => {
            return {
              ...field,
              field_response: "",
            };
          }),
          ...newSection.section_field.slice(8),
        ];

        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });

        const data = await getItemSectionChoices(supabaseClient, {
          equipmentId: equipmentId.option_id,
        });
        const equipmentGeneralNameChoices = data as {
          equipment_part_id: string;
          equipment_general_name: string;
        }[];

        setEquipmentId(equipmentId.option_id);

        const generalItemNameOption = equipmentGeneralNameChoices.map(
          (choice, index) => {
            return {
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: choice.equipment_part_id,
              option_order: index,
              option_value: choice.equipment_general_name,
            };
          }
        );
        setGeneralItemNameChoices(generalItemNameOption);

        createRange(1, formSections.length - 1).forEach((index) => {
          setValue(
            `sections.${index}.section_field.0.field_option`,
            generalItemNameOption
          );
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 4),
          ...newSection.section_field.slice(4, 8).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
          ...newSection.section_field.slice(8),
        ];
        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
        setEquipmentId("");
        setGeneralItemNameChoices([]);
      }
    } catch (e) {
      setValue(`sections.0.section_field.${3}.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handlePropertyNumberChange = async (value: string | null) => {
    const newSection = getValues(`sections.0`);
    try {
      if (value) {
        const equipmentDescription = await getEquipmentDescription(
          supabaseClient,
          {
            propertyNumber: value,
          }
        );

        const generalField = [
          ...newSection.section_field.slice(0, 5),
          {
            ...newSection.section_field[5],
            field_response:
              equipmentDescription.equipment_description_brand.equipment_brand,
          },
          {
            ...newSection.section_field[6],
            field_response:
              equipmentDescription.equipment_description_model.equipment_model,
          },
          {
            ...newSection.section_field[7],
            field_response:
              equipmentDescription.equipment_description_serial_number,
          },
          ...newSection.section_field.slice(8),
        ];

        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 5),
          ...newSection.section_field.slice(5, 8).map((field) => {
            return {
              ...field,
              field_response: "",
            };
          }),
          ...newSection.section_field.slice(8),
        ];
        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.0.section_field.${4}.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleTypeOfOrderChange = async (
    prevValue: string | null,
    value: string | null
  ) => {
    const section = getValues(`sections.0`);
    try {
      resetItemSection();

      if (value === "Bulk") {
        setStoredFields([
          ...section.section_field.slice(3, 8).map((field) => {
            return {
              ...field,
              field_response: "",
            };
          }),
        ]);
        const generalField = [
          ...section.section_field.slice(0, 3),
          ...section.section_field.slice(8),
        ];
        updateSection(0, {
          ...section,
          section_field: generalField,
        });

        const data = await getItemSectionChoices(supabaseClient, {});
        const equipmentGeneralNameChoices = data as {
          equipment_part_id: string;
          equipment_general_name: string;
        }[];

        const generalItemNameOption = equipmentGeneralNameChoices.map(
          (choice, index) => {
            return {
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: choice.equipment_part_id,
              option_order: index,
              option_value: choice.equipment_general_name,
            };
          }
        );
        setGeneralItemNameChoices(generalItemNameOption);

        createRange(1, formSections.length - 1).forEach((index) => {
          setValue(
            `sections.${index}.section_field.0.field_option`,
            generalItemNameOption
          );
        });

        setEquipmentId("");
      } else if (prevValue === "Bulk") {
        const generalField = [
          ...section.section_field.slice(0, 3),
          ...storedFields,
          ...section.section_field.slice(3),
        ];
        setStoredFields([]);
        updateSection(0, {
          ...section,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...section.section_field.slice(0, 3),
          {
            ...section.section_field[3],
            field_response: "",
          },
          ...section.section_field.slice(4, 8).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
          ...section.section_field.slice(8),
        ];
        updateSection(0, {
          ...section,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.0.section_field.${2}.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleGeneralItemNameChange = async (
    value: string | null,
    index: number
  ) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        const data = await getItemSectionChoices(supabaseClient, {
          equipmentId: equipmentId,
          generalName: value,
        });

        const equipmentComponentCategoryChoices = data as {
          equipment_part_id: string;
          equipment_component_category: string;
        }[];

        const componentCategoryOption = equipmentComponentCategoryChoices.map(
          (choice, index) => {
            return {
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: choice.equipment_part_id,
              option_order: index,
              option_value: choice.equipment_component_category,
            };
          }
        );

        const generalField = [
          { ...newSection.section_field[0] },
          {
            ...newSection.section_field[1],
            field_option: componentCategoryOption,
          },
          ...newSection.section_field.slice(2).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          { ...newSection.section_field[0] },
          ...newSection.section_field.slice(1).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.${0}.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleComponentCategoryChange = async (
    value: string | null,
    index: number
  ) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        const data = await getItemSectionChoices(supabaseClient, {
          equipmentId: equipmentId,
          generalName: newSection.section_field[0].field_response as string,
          componentCategory: value,
        });
        const brandOptionChoices = data as {
          equipment_part_id: string;
          equipment_brand: string;
        }[];

        const brandOption = brandOptionChoices.map((choice, index) => {
          return {
            option_field_id: form.form_section[0].section_field[0].field_id,
            option_id: choice.equipment_part_id,
            option_order: index,
            option_value: choice.equipment_brand,
          };
        });

        const generalField = [
          ...newSection.section_field.slice(0, 2),
          {
            ...newSection.section_field[2],
            field_option: brandOption,
          },
          ...newSection.section_field.slice(3).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 2),
          ...newSection.section_field.slice(2).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.${1}.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleBrandChange = async (value: string | null, index: number) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        const data = await getItemSectionChoices(supabaseClient, {
          equipmentId: equipmentId,
          generalName: newSection.section_field[0].field_response as string,
          componentCategory: newSection.section_field[1]
            .field_response as string,
          brand: value,
        });
        const modelOptionChoices = data as {
          equipment_part_id: string;
          equipment_model: string;
        }[];

        const modelOption = modelOptionChoices.map((choice, index) => {
          return {
            option_field_id: form.form_section[0].section_field[0].field_id,
            option_id: choice.equipment_part_id,
            option_order: index,
            option_value: choice.equipment_model,
          };
        });

        const generalField = [
          ...newSection.section_field.slice(0, 3),
          {
            ...newSection.section_field[3],
            field_option: modelOption,
          },
          ...newSection.section_field.slice(4).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 3),
          ...newSection.section_field.slice(3).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.${2}.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleModelChange = async (value: string | null, index: number) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        const data = await getItemSectionChoices(supabaseClient, {
          equipmentId: equipmentId,
          generalName: newSection.section_field[0].field_response as string,
          componentCategory: newSection.section_field[1]
            .field_response as string,
          brand: newSection.section_field[2].field_response as string,
          model: value,
        });
        const partNumberOptionChoices = data as {
          equipment_part_id: string;
          equipment_part_number: string;
        }[];

        const partNumberOption = partNumberOptionChoices.map(
          (choice, index) => {
            return {
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: choice.equipment_part_id,
              option_order: index,
              option_value: choice.equipment_part_number,
            };
          }
        );

        const generalField = [
          ...newSection.section_field.slice(0, 4),
          {
            ...newSection.section_field[4],
            field_option: partNumberOption,
          },
          ...newSection.section_field.slice(5).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 4),
          ...newSection.section_field.slice(4).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.${3}.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handlePartNumberChange = async (
    value: string | null,
    index: number
  ) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        const equipmentPartUoM = await getItemUnitOfMeasurement(
          supabaseClient,
          {
            generalName: newSection.section_field[0].field_response as string,
            componentCategory: newSection.section_field[1]
              .field_response as string,
            brand: newSection.section_field[2].field_response as string,
            model: newSection.section_field[3].field_response as string,
            partNumber: value,
          }
        );

        const generalField = [
          ...newSection.section_field.slice(0, 6),
          {
            ...newSection.section_field[6],
            field_response: equipmentPartUoM,
          },
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 5),
          ...newSection.section_field.slice(5).map((field) => {
            return {
              ...field,
              field_response: "",
              field_option: [],
            };
          }),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.${4}.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Container>
      <Title order={2} color="dimmed">
        Create Request
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

              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    onRemoveSection={handleRemoveSection}
                    formslyFormName="PED Part"
                    pedPartFormMethods={{
                      onProjectNameChange: handleProjectNameChange,
                      onCategoryChange: handleCategoryChange,
                      onEquipmentNameChange: handleEquipmentNameChange,
                      onPropertyNumberChange: handlePropertyNumberChange,
                      onTypeOfOrderChange: handleTypeOfOrderChange,
                      onGeneralItemNameChange: handleGeneralItemNameChange,
                      onComponentCategoryChange: handleComponentCategoryChange,
                      onBrandChange: handleBrandChange,
                      onModelChange: handleModelChange,
                      onPartNumberChange: handlePartNumberChange,
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
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreatePEDPartRequestPage;
