import {
  checkIfRequestIsEditable,
  getEquipmentDescription,
  getEquipmentName,
  getEquipmentPropertyNumber,
  getItemSectionChoices,
  getItemUnitOfMeasurement,
  getProjectSignerWithTeamMember,
} from "@/backend/api/get";
import { createRequest, editRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/EditRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/EditRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/EditRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { createRange } from "@/utils/arrayFunctions/arrayFunctions";
import { Database } from "@/utils/database";
import { isStringParsable, safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestWithResponseType,
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
import { RequestFormValues } from "../EditRequestPage/EditRequestPage";

export type RequestFormValuesForReferenceRequest = {
  sections: FormWithResponseType["form_section"];
};

type Props = {
  request: RequestWithResponseType;
  projectOptions: OptionTableRow[];
  categoryOptions: OptionTableRow[];
  referenceOnly: boolean;
  generalItemNameOptions: OptionTableRow[];
  equipmentId: string;
};

const EditPEDPartRequestPage = ({
  request,
  projectOptions,
  categoryOptions,
  referenceOnly,
  generalItemNameOptions,
  equipmentId: initialEquipmentId,
}: Props) => {
  const router = useRouter();
  const formId = request.request_form_id;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

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

  const [signerList, setSignerList] = useState(initialSignerList);
  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [storedFields, setStoredFields] = useState<
    RequestFormValues["sections"][0]["section_field"]
  >([]);
  const [generalItemNameChoices, setGeneralItemNameChoices] = useState<
    OptionTableRow[]
  >(generalItemNameOptions);
  const [equipmentId, setEquipmentId] = useState(initialEquipmentId);

  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const { request_form } = request;
  const formDetails = {
    form_name: request_form.form_name,
    form_description: request_form.form_description,
    form_date_created: request.request_date_created,
    form_team_member: request.request_team_member,
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
    if (
      JSON.parse(
        request_form.form_section[0].section_field[3].field_response[0]
          .request_response
      ) === "Bulk"
    ) {
      setStoredFields([
        ...request_form.form_section[0].section_field
          .slice(4, 9)
          .map((field) => {
            return {
              ...field,
              field_response: [],
            };
          }),
      ]);
      replaceSection([
        {
          ...request_form.form_section[0],
          section_field: [
            ...request_form.form_section[0].section_field.slice(0, 4),
            ...request_form.form_section[0].section_field.slice(9),
          ],
        },
        ...request_form.form_section.slice(1),
      ]);
    } else {
      replaceSection(request_form.form_section);
    }
  }, [
    request.request_form,
    replaceSection,
    requestFormMethods,
    categoryOptions,
    request_form.form_section,
  ]);

  const handleEditRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      setIsLoading(true);

      const isPending = await checkIfRequestIsEditable(supabaseClient, {
        requestId: request.request_id,
      });

      if (!isPending) {
        notifications.show({
          message: "A signer reviewed your request. Request can't be edited",
          color: "red",
          autoClose: false,
        });
        router.push(
          `/${formatTeamNameToUrlKey(team.team_name ?? "")}/requests/${
            request.request_formsly_id_prefix
          }-${request.request_formsly_id_serial}`
        );
        return;
      }

      const edittedRequest = await editRequest(supabaseClient, {
        requestId: request.request_id,
        requestFormValues: data,
        signers: signerList,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: request_form.form_name,
        teamName: formatTeamNameToUrlKey(team.team_name ?? ""),
      });

      notifications.show({
        message: "Request edited.",
        color: "green",
      });

      router.push(
        `/${formatTeamNameToUrlKey(team.team_name ?? "")}/requests/${
          edittedRequest.request_formsly_id_prefix
        }-${edittedRequest.request_formsly_id_serial}`
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

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      setIsLoading(true);
      const formattedData = data.sections.map((section, index) => {
        const duplicatableId = uuidv4();
        return {
          ...section,
          section_field: section.section_field.map((field) => {
            return {
              ...field,
              field_section_duplicatable_id:
                index > 1 ? duplicatableId : undefined,
              field_response: isStringParsable(
                field.field_response[0].request_response
              )
                ? JSON.parse(field.field_response[0].request_response)
                : field.field_response[0].request_response ?? undefined,
            };
          }),
        };
      });
      const response = safeParse(
        data.sections[0].section_field[0].field_response[0].request_response
      );

      const projectId = data.sections[0].section_field[0].field_option.find(
        (option) => option.option_value === response
      )?.option_id as string;

      const newRequest = await createRequest(supabaseClient, {
        requestFormValues: { sections: formattedData },
        formId,
        teamMemberId: teamMember.team_member_id,
        signers: signerList,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: request.request_form.form_name,
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
          newRequest.request_formsly_id_prefix
        }-${newRequest.request_formsly_id_serial}`
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
    const sectionMatch = request_form.form_section.find(
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
              field_response: [],
            };

          return {
            ...field,
            field_section_duplicatable_id: sectionDuplicatableId,
            field_response: [],
            field_option: [],
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
  const handleRemoveSection = (sectionMatchIndex: number) =>
    removeSection(sectionMatchIndex);

  const resetSigner = () => {
    setSignerList(initialSignerList);
  };

  const resetItemSection = () => {
    const itemSection = getValues(`sections.1`);
    if (formSections.length > 2) {
      removeSection(createRange(2, formSections.length - 1));
    }
    const newItemField = itemSection.section_field.map((field) => {
      return {
        ...field,
        field_response: [],
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
          ...newSection.section_field.slice(0, 4),
          {
            ...newSection.section_field[4],
            field_response: [],
            field_option: equipmentName.map((equipment, index) => {
              return {
                option_field_id:
                  request_form.form_section[0].section_field[4].field_id,
                option_id: equipment.equipment_id,
                option_order: index,
                option_value: equipment.equipment_name,
              };
            }),
          },
          ...newSection.section_field.slice(5, 9).map((field) => {
            return {
              ...field,
              field_response: [],
              field_option: [],
            };
          }),
          ...newSection.section_field.slice(9),
        ];

        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 4),
          ...newSection.section_field.slice(4, 9).map((field) => {
            return {
              ...field,
              field_response: [
                {
                  ...field.field_response[0],
                  request_response: "",
                },
              ],
              field_option: [],
            };
          }),
          ...newSection.section_field.slice(9),
        ];
        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.0.section_field.${2}.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
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

  const handleEquipmentNameChange = async (value: string | null) => {
    const newSection = getValues(`sections.0`);
    resetItemSection();
    try {
      if (value) {
        const equipmentOptions = newSection.section_field[4].field_option;
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
          ...newSection.section_field.slice(0, 5),
          {
            ...newSection.section_field[5],
            field_response: [],
            field_option: equipmentPropertyNumber.map(
              (propertyNumber, index) => {
                return {
                  option_field_id:
                    request_form.form_section[0].section_field[5].field_id,
                  option_id: `${propertyNumber.equipment_description_id}`,
                  option_order: index,
                  option_value: `${propertyNumber.equipment_description_property_number_with_prefix}`,
                };
              }
            ),
          },
          ...newSection.section_field.slice(6, 9).map((field) => {
            return {
              ...field,
              field_response: [],
            };
          }),
          ...newSection.section_field.slice(9),
        ];

        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });

        const data = await getItemSectionChoices(supabaseClient, {
          equipmentId: equipmentId.option_id,
        });
        const equipmentGeneralNameChoices = data as unknown as {
          equipment_part_id: string;
          equipment_general_name: string;
        }[];

        setEquipmentId(equipmentId.option_id);

        const generalItemNameOption = equipmentGeneralNameChoices.map(
          (choice, index) => {
            return {
              option_field_id:
                request_form.form_section[1].section_field[0].field_id,
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
          ...newSection.section_field.slice(0, 5),
          ...newSection.section_field.slice(5, 9).map((field) => {
            return {
              ...field,
              field_response: [
                {
                  ...field.field_response[0],
                  request_response: "",
                },
              ],
              field_option: [],
            };
          }),
          ...newSection.section_field.slice(9),
        ];
        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
        setEquipmentId("");
        setGeneralItemNameChoices([]);
      }
    } catch (e) {
      setValue(`sections.0.section_field.${4}.field_response`, []);
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
          ...newSection.section_field.slice(0, 6),
          {
            ...newSection.section_field[6],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response:
                  equipmentDescription.equipment_description_brand
                    .equipment_brand,
                request_response_duplicatable_section_id:
                  newSection.section_field[6].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[6].field_id,
              },
            ],
          },
          {
            ...newSection.section_field[7],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response:
                  equipmentDescription.equipment_description_model
                    .equipment_model,
                request_response_duplicatable_section_id:
                  newSection.section_field[7].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[7].field_id,
              },
            ],
          },
          {
            ...newSection.section_field[8],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response:
                  equipmentDescription.equipment_description_serial_number,
                request_response_duplicatable_section_id:
                  newSection.section_field[8].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[8].field_id,
              },
            ],
          },

          ...newSection.section_field.slice(9),
        ];

        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 6),
          ...newSection.section_field.slice(6, 9).map((field) => {
            return {
              ...field,
              field_response: [
                {
                  ...field.field_response[0],
                  request_response: "",
                },
              ],
            };
          }),
          ...newSection.section_field.slice(9),
        ];
        updateSection(0, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.0.section_field.${5}.field_response`, []);
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
          ...section.section_field.slice(4, 9).map((field) => {
            return {
              ...field,
              field_response: [],
            };
          }),
        ]);
        const generalField = [
          ...section.section_field.slice(0, 4),
          ...section.section_field.slice(9),
        ];
        updateSection(0, {
          ...section,
          section_field: generalField,
        });

        const data = await getItemSectionChoices(supabaseClient, {});
        const equipmentGeneralNameChoices = data as unknown as {
          equipment_part_id: string;
          equipment_general_name: string;
        }[];

        const generalItemNameOption = equipmentGeneralNameChoices.map(
          (choice, index) => {
            return {
              option_field_id:
                request_form.form_section[1].section_field[0].field_id,
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
      } else if (prevValue && safeParse(prevValue) === "Bulk") {
        const generalField = [
          ...section.section_field.slice(0, 4),
          ...storedFields,
          ...section.section_field.slice(4),
        ];
        setStoredFields([]);
        updateSection(0, {
          ...section,
          section_field: generalField,
        });
      } else {
        const generalField = [
          ...section.section_field.slice(0, 4),
          {
            ...section.section_field[4],
            field_response: [],
          },
          ...section.section_field.slice(5, 9).map((field) => {
            return {
              ...field,
              field_response: [],
              field_option: [],
            };
          }),
          ...section.section_field.slice(9),
        ];
        updateSection(0, {
          ...section,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.0.section_field.${3}.field_response`, []);
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

        const equipmentComponentCategoryChoices = data as unknown as {
          equipment_part_id: string;
          equipment_component_category: string;
        }[];

        const componentCategoryOption = equipmentComponentCategoryChoices.map(
          (choice, index) => {
            return {
              option_field_id:
                request_form.form_section[1].section_field[0].field_id,
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
            field_response: [
              {
                ...newSection.section_field[1].field_response[0],
                request_response: "",
              },
            ],
          },
          ...newSection.section_field.slice(2).map((field) => {
            return {
              ...field,
              field_response: [],
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
              field_response: [
                {
                  ...field.field_response[0],
                  request_response: "",
                },
              ],
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
      setValue(`sections.${index}.section_field.${0}.field_response`, []);
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
          generalName: newSection.section_field[0].field_response[0]
            .request_response as string,
          componentCategory: value,
        });
        const brandOptionChoices = data as unknown as {
          equipment_part_id: string;
          equipment_brand: string;
        }[];

        const brandOption = brandOptionChoices.map((choice, index) => {
          return {
            option_field_id:
              request_form.form_section[1].section_field[0].field_id,
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
            field_response: [
              {
                ...newSection.section_field[2].field_response[0],
                request_response: "",
              },
            ],
          },
          ...newSection.section_field.slice(3).map((field) => {
            return {
              ...field,
              field_response: [],
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
              field_response: [
                {
                  ...field.field_response[0],
                  request_response: "",
                },
              ],
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
      setValue(`sections.${index}.section_field.${1}.field_response`, []);
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
          generalName: newSection.section_field[0].field_response[0]
            .request_response as string,
          componentCategory: newSection.section_field[1].field_response[0]
            .request_response as string,
          brand: value,
        });
        const modelOptionChoices = data as unknown as {
          equipment_part_id: string;
          equipment_model: string;
        }[];

        const modelOption = modelOptionChoices.map((choice, index) => {
          return {
            option_field_id:
              request_form.form_section[1].section_field[0].field_id,
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
            field_response: [
              {
                ...newSection.section_field[3].field_response[0],
                request_response: "",
              },
            ],
          },
          ...newSection.section_field.slice(4).map((field) => {
            return {
              ...field,
              field_response: [],
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
              field_response: [
                {
                  ...field.field_response[0],
                  request_response: "",
                },
              ],
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
      setValue(`sections.${index}.section_field.${2}.field_response`, []);
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
          generalName: newSection.section_field[0].field_response[0]
            .request_response as string,
          componentCategory: newSection.section_field[1].field_response[0]
            .request_response as string,
          brand: newSection.section_field[2].field_response[0]
            .request_response as string,
          model: value,
        });
        const partNumberOptionChoices = data as unknown as {
          equipment_part_id: string;
          equipment_part_number: string;
        }[];

        const partNumberOption = partNumberOptionChoices.map(
          (choice, index) => {
            return {
              option_field_id:
                request_form.form_section[0].section_field[0].field_id,
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
            field_response: [
              {
                ...newSection.section_field[4].field_response[0],
                request_response: "",
              },
            ],
          },
          ...newSection.section_field.slice(5).map((field) => {
            return {
              ...field,
              field_response: [],
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
              field_response: [
                {
                  ...field.field_response[0],
                  request_response: "",
                },
              ],
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
      setValue(`sections.${index}.section_field.${3}.field_response`, []);
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
            generalName: safeParse(
              newSection.section_field[0].field_response[0].request_response
            ),
            componentCategory: safeParse(
              newSection.section_field[1].field_response[0].request_response
            ),
            brand: safeParse(
              newSection.section_field[2].field_response[0].request_response
            ),
            model: safeParse(
              newSection.section_field[3].field_response[0].request_response
            ),
            partNumber: value,
          }
        );

        const generalField = [
          ...newSection.section_field.slice(0, 6),
          {
            ...newSection.section_field[6],
            field_response: [
              {
                request_response_id: uuidv4(),
                request_response: equipmentPartUoM,
                request_response_duplicatable_section_id:
                  newSection.section_field[6].field_section_duplicatable_id ??
                  null,
                request_response_request_id: request.request_id,
                request_response_field_id: newSection.section_field[6].field_id,
              },
            ],
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
              field_response: [
                {
                  ...field.field_response[0],
                  request_response: "",
                },
              ],
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
      setValue(`sections.${index}.section_field.${4}.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Container>
      <Title order={2} color="dimmed">
        {referenceOnly ? "Reference" : "Edit"} Request
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form
          onSubmit={handleSubmit(
            referenceOnly ? handleCreateRequest : handleEditRequest
          )}
        >
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
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
                    onRemoveSection={handleRemoveSection}
                    isSectionRemovable={isRemovable}
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
                    formslyFormName={request_form.form_name}
                    referenceOnly={referenceOnly}
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

export default EditPEDPartRequestPage;
