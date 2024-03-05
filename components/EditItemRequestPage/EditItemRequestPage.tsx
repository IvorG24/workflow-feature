import {
  checkIfRequestIsEditable,
  getCSI,
  getCSICode,
  getCSICodeOptionsForItems,
  getItem,
  getLevelThreeDescription,
  getProjectSignerWithTeamMember,
  getSectionInEditRequest,
  getSupplier,
} from "@/backend/api/get";
import { createRequest, editRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/EditRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/EditRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/EditRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { isStringParsable, safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  CSICodeTableRow,
  FieldTableRow,
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestWithResponseType,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
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
  itemOptions: OptionTableRow[];
  projectOptions: OptionTableRow[];
  specialApprover: {
    special_approver_id: string;
    special_approver_item_list: string[];
    special_approver_signer: FormType["form_signer"][0];
  }[];
  referenceOnly: boolean;
  supplierOptions: OptionTableRow[];
  preferredSupplierField?: FieldTableRow;
};

const EditItemRequestPage = ({
  request,
  itemOptions,
  projectOptions,
  specialApprover,
  referenceOnly,
  supplierOptions,
  preferredSupplierField,
}: Props) => {
  const router = useRouter();
  const formId = request.request_form_id;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();

  const specialApproverList = specialApprover.map(
    (approver) => approver.special_approver_signer.signer_id
  );

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
  const [isSearchingSupplier, setIsSearching] = useState(false);
  const [isSearchingCSI, setIsSearchingCSI] = useState(false);
  const [itemDivisionIdList, setItemDivisionIdList] = useState<string[][]>([
    [],
  ]);
  const [originalSections, setOriginalSections] = useState<
    RequestWithResponseType["request_form"]["form_section"]
  >([]);

  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const { request_form } = request;
  const formDetails = {
    form_name: request_form.form_name,
    form_description: request_form.form_description,
    form_date_created: request.request_date_created,
    form_team_member: request.request_team_member,
    form_type: request_form.form_type,
    form_sub_type: request_form.form_sub_type,
  };

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues, setValue } = requestFormMethods;
  const {
    fields: formSections,
    insert: addSection,
    remove: removeSection,
    update: updateSection,
    replace: replaceSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    if (!team.team_id || !preferredSupplierField) return;
    try {
      const fetchSections = async () => {
        const newSection: RequestWithResponseType["request_form"]["form_section"] =
          [];
        let index = 1;
        while (1) {
          setIsLoading(true);
          const { sectionData, itemDivisionIdList } =
            await getSectionInEditRequest(supabaseClient, {
              index,
              supplierOptions,
              requestId: request.request_id,
              teamId: team.team_id,
              itemOptions,
              preferredSupplierField,
            });
          if (sectionData.length === 0) break;
          newSection.push(...sectionData);
          setItemDivisionIdList((prev) => [...prev, ...itemDivisionIdList]);
          index += 10;
        }
        replaceSection([{ ...request_form.form_section[0] }, ...newSection]);
        setOriginalSections([
          { ...request_form.form_section[0] },
          ...newSection,
        ]);
        setIsLoading(false);
      };
      fetchSections();
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  }, [team.team_id]);

  const handleEditRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      setIsLoading(true);

      const toBeCheckedSections = data.sections.slice(1);
      const newSections: RequestFormValues["sections"] = [];
      toBeCheckedSections.forEach((section) => {
        // if new section if empty
        if (newSections.length === 0) {
          newSections.push(section);
        } else {
          let uniqueItem = true;
          newSections.forEach((newSection) => {
            // if section general name is equal
            if (
              safeParse(
                newSection.section_field[0].field_response[0].request_response
              ) ==
              safeParse(
                section.section_field[0].field_response[0].request_response
              )
            ) {
              let uniqueField = false;
              // loop on every field except name and quantity
              for (let i = 5; i < newSection.section_field.length; i++) {
                const newSectionField =
                  safeParse(
                    newSection.section_field[i].field_response[0]
                      .request_response
                  ) ?? "";
                const sectionField =
                  safeParse(
                    section.section_field[i].field_response[0].request_response
                  ) ?? "";
                if (newSectionField != sectionField) {
                  uniqueField = true;
                  break;
                }
              }
              if (!uniqueField) {
                newSection.section_field[2].field_response[0].request_response = `${
                  Number(
                    newSection.section_field[2].field_response[0]
                      .request_response
                  ) +
                  Number(
                    section.section_field[2].field_response[0].request_response
                  )
                }`;
                uniqueItem = false;
              }
            }
          });
          if (uniqueItem) {
            newSections.push(section);
          }
        }
      });

      const newData = {
        sections: [data.sections[0], ...newSections],
      };

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

      const filteredSignerList = signerList.filter(
        (signer) => !specialApproverList.includes(signer.signer_id)
      );

      // special approver
      const additionalSignerList: FormType["form_signer"] = [];
      const alreadyAddedAdditionalSigner: string[] = [];
      if (specialApprover && specialApprover.length !== 0) {
        const generalNameList = newSections.map((section) =>
          safeParse(section.section_field[0].field_response[0].request_response)
        );
        specialApprover.map((approver) => {
          if (
            alreadyAddedAdditionalSigner.includes(
              approver.special_approver_signer.signer_id
            )
          )
            return;
          if (
            approver.special_approver_item_list.some((item) =>
              generalNameList.includes(item)
            )
          ) {
            additionalSignerList.push(approver.special_approver_signer);
            alreadyAddedAdditionalSigner.push(
              approver.special_approver_signer.signer_id
            );
          }
        });
      }

      const edittedRequest = await editRequest(supabaseClient, {
        requestId: request.request_id,
        requestFormValues: newData,
        signers: [...filteredSignerList, ...additionalSignerList],
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
      const toBeCheckedSections = formattedData.slice(1);
      const newSections: RequestFormValuesForReferenceRequest["sections"] = [];
      toBeCheckedSections.forEach((section) => {
        // if new section if empty
        if (newSections.length === 0) {
          newSections.push(section);
        } else {
          let uniqueItem = true;
          newSections.forEach((newSection) => {
            // if section general name is equal

            if (
              safeParse(newSection.section_field[0].field_response as string) ==
              safeParse(section.section_field[0].field_response)
            ) {
              let uniqueField = false;
              // loop on every field except name and quantity
              for (let i = 5; i < newSection.section_field.length; i++) {
                const newSectionField =
                  safeParse(
                    newSection.section_field[i].field_response as string
                  ) ?? "";
                const sectionField =
                  safeParse(section.section_field[i].field_response) ?? "";
                if (newSectionField != sectionField) {
                  uniqueField = true;
                  break;
                }
              }
              if (!uniqueField) {
                newSection.section_field[2].field_response =
                  Number(newSection.section_field[2].field_response) +
                  Number(section.section_field[2].field_response);
                uniqueItem = false;
              }
            }
          });
          if (uniqueItem) {
            newSections.push(section);
          }
        }
      });

      const newData = {
        sections: [formattedData[0], ...newSections],
      };

      const response = formattedData[0].section_field[0]
        .field_response as string;

      const projectId = formattedData[0].section_field[0].field_option.find(
        (option) => option.option_value === response
      )?.option_id as string;

      const filteredSignerList = signerList.filter(
        (signer) => !specialApproverList.includes(signer.signer_id)
      );

      // special approver
      const additionalSignerList: FormType["form_signer"] = [];
      const alreadyAddedAdditionalSigner: string[] = [];
      if (specialApprover && specialApprover.length !== 0) {
        const generalNameList = newSections.map(
          (section) => section.section_field[0].field_response
        );
        specialApprover.map((approver) => {
          if (
            alreadyAddedAdditionalSigner.includes(
              approver.special_approver_signer.signer_id
            )
          )
            return;
          if (
            approver.special_approver_item_list.some((item) =>
              generalNameList.includes(item)
            )
          ) {
            additionalSignerList.push(approver.special_approver_signer);
            alreadyAddedAdditionalSigner.push(
              approver.special_approver_signer.signer_id
            );
          }
        });
      }

      const newRequest = await createRequest(supabaseClient, {
        requestFormValues: newData,
        formId,
        teamMemberId: teamMember.team_member_id,
        signers: [...filteredSignerList, ...additionalSignerList],
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
    const sectionMatch = formSections.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field
        .slice(0, 10)
        .map((field) => {
          if (field.field_name === "General Name") {
            return {
              ...field,
              field_response: field.field_response.map((response) => ({
                ...response,
                request_response_duplicatable_section_id: sectionDuplicatableId,
                request_response: "",
              })),
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: itemOptions,
            };
          } else {
            return {
              ...field,
              field_response: field.field_response.map((response) => ({
                ...response,
                request_response_duplicatable_section_id: sectionDuplicatableId,
                request_response: "",
              })),
              field_section_duplicatable_id: sectionDuplicatableId,
            };
          }
        });
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

  const handleGeneralNameChange = async (
    index: number,
    value: string | null
  ) => {
    const newSection = getValues(`sections.${index}`);

    try {
      if (value) {
        const item = await getItem(supabaseClient, {
          teamId: team.team_id,
          itemName: value,
        });
        const isWithDescription = Boolean(item.item_level_three_description);
        let csiCodeList: CSICodeTableRow[] = [];

        if (item.item_level_three_description) {
          csiCodeList = await getLevelThreeDescription(supabaseClient, {
            levelThreeDescription: item.item_level_three_description,
          });
        } else {
          csiCodeList = await getCSICodeOptionsForItems(supabaseClient, {
            divisionIdList: item.item_division_id_list,
          });
        }

        const generalField: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
          [
            {
              ...newSection.section_field[0],
            },
            {
              ...newSection.section_field[1],
              field_response: newSection.section_field[1].field_response.map(
                (response) => ({
                  ...response,
                  request_response: item.item_unit,
                  request_response_id: uuidv4(),
                })
              ),
            },
            {
              ...newSection.section_field[2],
            },
            {
              ...newSection.section_field[3],
              field_response: newSection.section_field[3].field_response.map(
                (response) => ({
                  ...response,
                  request_response: item.item_gl_account,
                  request_response_id: uuidv4(),
                })
              ),
            },
            {
              ...newSection.section_field[4],
              field_response: newSection.section_field[4].field_response.map(
                (response) => ({
                  ...response,
                  request_response: isWithDescription
                    ? csiCodeList[0].csi_code_level_three_description
                    : "",
                  request_response_id: uuidv4(),
                })
              ),
              field_option: csiCodeList.map((csiCode, index) => {
                return {
                  option_field_id:
                    request_form.form_section[0].section_field[0].field_id,
                  option_id: csiCode.csi_code_id,
                  option_order: index,
                  option_value: csiCode.csi_code_level_three_description,
                };
              }),
            },
            ...newSection.section_field.slice(5, 9).map((field, fieldIdx) => {
              if (isWithDescription) {
                switch (field.field_name) {
                  case "CSI Code":
                    return {
                      ...field,
                      field_response: newSection.section_field[
                        5 + fieldIdx
                      ].field_response.map((response) => ({
                        ...response,
                        request_response: csiCodeList[0].csi_code_section,
                        request_response_duplicatable_section_id:
                          newSection.section_field[0].field_response[0]
                            .request_response_duplicatable_section_id,
                        request_response_id: uuidv4(),
                      })),
                    };
                  case "Division Description":
                    return {
                      ...field,
                      field_response: newSection.section_field[
                        5 + fieldIdx
                      ].field_response.map((response) => ({
                        ...response,
                        request_response:
                          csiCodeList[0].csi_code_division_description,
                        request_response_duplicatable_section_id:
                          newSection.section_field[0].field_response[0]
                            .request_response_duplicatable_section_id,
                        request_response_id: uuidv4(),
                      })),
                    };
                  case "Level 2 Major Group Description":
                    return {
                      ...field,
                      field_response: newSection.section_field[
                        5 + fieldIdx
                      ].field_response.map((response) => ({
                        ...response,
                        request_response:
                          csiCodeList[0]
                            .csi_code_level_two_major_group_description,
                        request_response_duplicatable_section_id:
                          newSection.section_field[0].field_response[0]
                            .request_response_duplicatable_section_id,
                        request_response_id: uuidv4(),
                      })),
                    };
                  case "Level 2 Minor Group Description":
                    return {
                      ...field,
                      field_response: newSection.section_field[
                        5 + fieldIdx
                      ].field_response.map((response) => ({
                        ...response,
                        request_response:
                          csiCodeList[0]
                            .csi_code_level_two_minor_group_description,
                        request_response_duplicatable_section_id:
                          newSection.section_field[0].field_response[0]
                            .request_response_duplicatable_section_id,
                        request_response_id: uuidv4(),
                      })),
                    };
                  default:
                    return {
                      ...field,
                      field_response: newSection.section_field[
                        5 + fieldIdx
                      ].field_response.map((response) => ({
                        ...response,
                        request_response: "",
                        request_response_duplicatable_section_id:
                          newSection.section_field[0].field_response[0]
                            .request_response_duplicatable_section_id,
                        request_response_id: uuidv4(),
                      })),
                    };
                }
              } else {
                return {
                  ...field,
                  field_response: newSection.section_field[
                    5 + fieldIdx
                  ].field_response.map((response) => ({
                    ...response,
                    request_response: "",
                    request_response_duplicatable_section_id:
                      newSection.section_field[0].field_response[0]
                        .request_response_duplicatable_section_id,
                    request_response_id: uuidv4(),
                  })),
                };
              }
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
            field_response: [
              {
                request_response: "",
                request_response_id: uuidv4(),
                request_response_duplicatable_section_id:
                  newSection.section_field[0].field_response[0]
                    .request_response_duplicatable_section_id,
                request_response_field_id: description.item_field.field_id,
                request_response_request_id: request.request_id,
              },
            ],
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
          ] as RequestWithResponseType["request_form"]["form_section"][0]["section_field"],
        });
        setItemDivisionIdList((prev) => {
          prev[index] = item.item_division_id_list;
          return prev;
        });
      } else {
        const generalField: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
          [
            newSection.section_field[0],
            {
              ...newSection.section_field[1],
              field_response: [],
            },
            newSection.section_field[2],
            ...newSection.section_field.slice(3, 9).map((field) => {
              return {
                ...field,
                field_response: [
                  {
                    request_response: "",
                    request_response_duplicatable_section_id:
                      field.field_section_duplicatable_id || null,
                    request_response_field_id: field.field_id,
                    request_response_id:
                      field.field_response[0].request_response_id,
                    request_response_request_id: request.request_id,
                  },
                ],
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
    } catch (e) {
      setValue(`sections.${index}.section_field.0.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleCSICodeChange = async (index: number, value: string | null) => {
    const newSection = getValues(`sections.${index}`);

    try {
      if (value) {
        const csiCode = await getCSICode(supabaseClient, { csiCode: value });

        const generalField = [
          ...newSection.section_field.slice(0, 5),
          {
            ...newSection.section_field[5],
            field_response: newSection.section_field[5].field_response.map(
              (response) => ({
                ...response,
                request_response: csiCode?.csi_code_section,
                request_response_id: uuidv4(),
              })
            ),
          },
          {
            ...newSection.section_field[6],
            field_response: newSection.section_field[6].field_response.map(
              (response) => ({
                ...response,
                request_response: csiCode?.csi_code_division_description,
                request_response_id: uuidv4(),
              })
            ),
          },
          {
            ...newSection.section_field[7],
            field_response: newSection.section_field[7].field_response.map(
              (response) => ({
                ...response,
                request_response:
                  csiCode?.csi_code_level_two_major_group_description,
                request_response_id: uuidv4(),
              })
            ),
          },
          {
            ...newSection.section_field[8],
            field_response: newSection.section_field[8].field_response.map(
              (response) => ({
                ...response,
                request_response:
                  csiCode?.csi_code_level_two_minor_group_description,
                request_response_id: uuidv4(),
              })
            ),
          },
          ...newSection.section_field.slice(9),
        ];
        const duplicatableSectionId = index === 1 ? undefined : uuidv4();
        const newFields: RequestWithResponseType["request_form"]["form_section"][0]["section_field"] =
          [
            ...generalField.map((field) => {
              return {
                ...field,
                field_section_duplicatable_id: duplicatableSectionId,
              };
            }),
          ];

        updateSection(index, {
          ...newSection,
          section_field: newFields,
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 4),
          ...newSection.section_field.slice(4, 9).map((field) => {
            return {
              ...field,
              field_response: field.field_response.map((response) => ({
                ...response,
                request_response: "",
                request_response_id: uuidv4(),
              })),
            };
          }),
          ...newSection.section_field.slice(9),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.4.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const resetSigner = () => {
    setSignerList(initialSignerList);
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
      setValue(`sections.0.section_field.0.field_response`, []);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  const supplierSearch = async (value: string, index: number) => {
    if (!teamMember?.team_member_team_id || !formSections[1]) return;
    try {
      setIsSearching(true);
      const supplierList = await getSupplier(supabaseClient, {
        supplier: value ?? "",
        teamId: teamMember.team_member_team_id,
        fieldId: formSections[1].section_field[9].field_id,
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

  const csiSearch = async (value: string, index: number) => {
    if (!teamMember?.team_member_team_id || !formSections[1]) return;
    if (!itemDivisionIdList[index]) return;

    try {
      setIsSearchingCSI(true);
      const csiList = await getCSI(supabaseClient, {
        csi: value ?? "",
        fieldId: formSections[1].section_field[4].field_id,
        divisionIdList: itemDivisionIdList[index],
      });

      setValue(`sections.${index}.section_field.4.field_option`, csiList);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsSearchingCSI(false);
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
                    itemFormMethods={{
                      onGeneralNameChange: handleGeneralNameChange,
                      onProjectNameChange: handleProjectNameChange,
                      onCSICodeChange: handleCSICodeChange,
                      supplierSearch,
                      isSearchingSupplier,
                      csiSearch,
                      isSearchingCSI,
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
            <Flex direction="column" gap="sm">
              <Button
                variant="outline"
                color="red"
                onClick={() => replaceSection(originalSections)}
              >
                Reset
              </Button>
              <Button type="submit">Submit</Button>
            </Flex>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default EditItemRequestPage;