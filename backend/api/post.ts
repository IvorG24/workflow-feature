import { RequestFormValues } from "@/components/CreateRequestPage/CreateRequestPage";
import { FormBuilderData } from "@/components/FormBuilder/FormBuilder";
import { TeamMemberType as GroupTeamMemberType } from "@/components/TeamPage/TeamGroup/TeamGroups/GroupMembers";
import { TeamMemberType as ProjectTeamMemberType } from "@/components/TeamPage/TeamProject/ProjectMembers";
import {
  APP_SOURCE_ID,
  BASE_URL,
  formatDate,
  formslyPremadeFormsData,
} from "@/utils/constant";
import { Database } from "@/utils/database";
import { formatJiraItemUserTableData, shortId } from "@/utils/functions";
import {
  escapeQuotes,
  escapeQuotesForObject,
  getFileType,
} from "@/utils/string";
import {
  AdOwnerRequestTableInsert,
  AttachmentBucketType,
  AttachmentTableInsert,
  CommentTableInsert,
  CreatePracticalTestFormType,
  CreateTicketFormValues,
  EquipmentDescriptionTableInsert,
  EquipmentPartTableInsert,
  EquipmentTableInsert,
  ErrorTableInsert,
  FieldCorrectResponseTableInsert,
  FieldTableInsert,
  FormTableRow,
  FormType,
  InterviewOnlineMeetingTableInsert,
  InterviewOnlineMeetingTableRow,
  InvitationTableRow,
  ItemDescriptionFieldTableInsert,
  ItemDescriptionFieldUOMTableInsert,
  ItemDescriptionTableUpdate,
  ItemForm,
  ItemTableInsert,
  JiraFormslyItemCategoryWithUserDataType,
  JiraItemCategoryTableInsert,
  JiraItemCategoryUserTableInsert,
  JiraItemUserTableData,
  JiraOrganizationTableInsert,
  JiraProjectTableInsert,
  JiraUserAccountTableInsert,
  JobTitleTableInsert,
  MemoAgreementTableRow,
  MemoLineItem,
  MemoTableRow,
  NotificationTableInsert,
  OtherExpensesTypeTableInsert,
  QuestionOption,
  ReferenceMemoType,
  RequestResponseTableInsert,
  RequestSignerTableInsert,
  RequestTableRow,
  SCICEmployeeTableInsert,
  SCICEmployeeTableUpdate,
  SignerTableInsert,
  TeamGroupTableInsert,
  TeamMemberTableInsert,
  TeamProjectWithAddressType,
  TeamTableInsert,
  TechnicalAssessmentTableRow,
  TechnicalQuestionFormValues,
  TicketCommentTableInsert,
  TicketCommentTableRow,
  TicketResponseTableInsert,
  TicketTableRow,
  UserSSSTableInsert,
  UserTableInsert,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import Compressor from "compressorjs";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { getCurrentDate } from "./get";

export const uploadImage = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    image: Blob | File;
    bucket: AttachmentBucketType;
    fileType: string;
    userId: string;
    sssId?: string;
    applicationInformationFormslyId?: string;
  }
) => {
  const {
    image,
    bucket,
    fileType,
    userId,
    sssId,
    applicationInformationFormslyId,
  } = params;

  const { data: uploadData, error: uploadDataError } = await supabaseClient
    .rpc("get_storage_upload_details", {
      input_data: {
        userId,
        sssId,
        applicationInformationFormslyId,
      },
    })
    .select("*");
  if (uploadDataError) throw uploadDataError;
  const { sssIDNumber, currentDate } = uploadData as unknown as {
    sssIDNumber: string;
    currentDate: string;
  };

  // compress image
  let compressedImage: Blob;

  if (
    ["image/jpeg", "image/png", "image/webp"].includes(
      image.type.toLocaleLowerCase()
    )
  ) {
    compressedImage = await new Promise((resolve, reject) => {
      new Compressor(image, {
        quality: 0.6,
        success(result) {
          resolve(result);
        },
        error(error) {
          reject(error);
        },
      });
    });
  } else {
    compressedImage = image;
  }

  const formattedFileName = `${formatDate(
    new Date(currentDate)
  )}-${sssIDNumber}-${fileType}-${shortId()}.${image.name.split(".").pop()}`;

  // upload image
  const { error: uploadError } = await supabaseClient.storage
    .from(bucket)
    .upload(formattedFileName, compressedImage, { upsert: true });
  if (uploadError) throw uploadError;

  // get public url
  const { data } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(formattedFileName);

  return {
    fileName: formattedFileName,
    publicUrl: data.publicUrl,
  };
};

export const uploadFile = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    file: Blob | File;
    bucket: AttachmentBucketType;
    fileType: string;
    userId: string;
    sssId?: string;
    applicationInformationFormslyId?: string;
  }
) => {
  const {
    file,
    bucket,
    fileType,
    userId,
    sssId,
    applicationInformationFormslyId,
  } = params;

  const { data: uploadData, error: uploadDataError } = await supabaseClient
    .rpc("get_storage_upload_details", {
      input_data: {
        userId,
        sssId,
        applicationInformationFormslyId,
      },
    })
    .select("*");
  if (uploadDataError) throw uploadDataError;
  const { sssIDNumber, currentDate } = uploadData as unknown as {
    sssIDNumber: string;
    currentDate: string;
  };

  const formattedFileName = `${formatDate(
    new Date(currentDate)
  )}-${sssIDNumber}-${fileType}-${shortId()}.${file.name.split(".").pop()}`;

  // upload file
  const { error: uploadError } = await supabaseClient.storage
    .from(bucket)
    .upload(formattedFileName, file, { upsert: true });
  if (uploadError) throw uploadError;

  // get public url
  const { data } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(formattedFileName);

  return {
    fileName: formattedFileName,
    publicUrl: data.publicUrl,
  };
};

export const createTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamTableInsert
) => {
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_table")
    .insert(params)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createTeamMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamMemberTableInsert
) => {
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_member_table")
    .insert(params)
    .select();
  if (error) throw error;
  return data;
};

export const createTeamMemberReturnTeamName = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamMemberTableInsert
) => {
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_member_table")
    .insert(params)
    .select("*, team:team_table(team_name)");
  if (error) throw error;
  return data as unknown as [
    {
      team: { team_name: string };
    } & TeamMemberTableInsert,
  ];
};

export const createTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    emailList: string[];
    teamMemberId: string;
    teamName: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("create_team_invitation", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as InvitationTableRow[];
};

export const signUpUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: { email: string; password: string }
) => {
  const { data, error } = await supabaseClient.auth.signUp({
    ...params,
  });
  if (error) throw error;

  if (data.user && data.user.identities && data.user.identities?.length > 0) {
    return { data, error: null };
  } else {
    return { data, error: "Email already registered." };
  }
};

export const signInUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: { email: string; password: string }
) => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      ...params,
    });
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    return { data: null, error: `${e}` };
  }
};

export const checkIfEmailExists = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    email: string;
  }
) => {
  const { data, error } = await supabaseClient
    .schema("user_schema")
    .from("user_table")
    .select("user_email")
    .eq("user_email", params.email);
  if (error) throw error;
  return data.length > 0;
};

export const sendResetPasswordEmail = async (
  supabaseClient: SupabaseClient<Database>,
  email: string
) => {
  await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${BASE_URL}/reset-password`,
  });
};

export const resetPassword = async (
  supabaseClient: SupabaseClient<Database>,
  password: string
) => {
  const { error } = await supabaseClient.auth.updateUser({ password });
  return { error: error };
};

export const createAttachment = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    attachmentData: AttachmentTableInsert;
    file: File;
    fileType: string;
    userId: string;
    applicationInformationFormslyId?: string;
  }
) => {
  const {
    file,
    attachmentData,
    fileType,
    userId,
    applicationInformationFormslyId,
  } = params;

  let attachmentValue;
  if (file["type"].split("/")[0] === "image") {
    attachmentValue = await uploadImage(supabaseClient, {
      image: file,
      bucket: attachmentData.attachment_bucket as AttachmentBucketType,
      fileType,
      userId,
      applicationInformationFormslyId,
    });
  } else {
    attachmentValue = await uploadFile(supabaseClient, {
      file: file,
      bucket: attachmentData.attachment_bucket as AttachmentBucketType,
      fileType,
      userId,
      applicationInformationFormslyId,
    });
  }

  const { data, error } = await supabaseClient
    .from("attachment_table")
    .upsert({ ...attachmentData, attachment_value: attachmentValue.fileName })
    .select()
    .single();
  if (error) throw error;

  return { data, url: attachmentValue.publicUrl };
};

export const createNotification = async (
  supabaseClient: SupabaseClient<Database>,
  params: NotificationTableInsert
) => {
  const { error } = await supabaseClient
    .from("notification_table")
    .insert(params);
  if (error) throw error;
};

export const createComment = async (
  supabaseClient: SupabaseClient<Database>,
  params: CommentTableInsert
) => {
  const { data, error } = await supabaseClient
    .schema("request_schema")
    .from("comment_table")
    .insert(params)
    .select("*")
    .single();
  if (error) throw error;

  return { data, error };
};

export const createItem = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemData: ItemTableInsert & {
      item_division_id_list: string[];
      item_level_three_description?: string;
    };
    itemDescription: {
      description: string;
      withUoM: boolean;
      order: number;
    }[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("create_item", { input_data: params })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateItem = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemData: ItemTableInsert & {
      item_division_id_list: string[];
      item_level_three_description?: string;
    };
    toAdd: ItemForm["descriptions"];
    toUpdate: ItemDescriptionTableUpdate[];
    toRemove: { fieldId: string; descriptionId: string }[];
    formId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("update_item", { input_data: params })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createItemDescriptionField = async (
  supabaseClient: SupabaseClient<Database>,
  params: (ItemDescriptionFieldTableInsert & {
    item_description_field_uom: string | null;
  })[]
) => {
  const itemDescriptionFieldUomInput: ItemDescriptionFieldUOMTableInsert[] = [];
  const itemDescriptionFieldInput = params.map((field) => {
    const fieldId = uuidv4();
    if (field.item_description_field_uom) {
      itemDescriptionFieldUomInput.push({
        item_description_field_uom_item_description_field_id: fieldId,
        item_description_field_uom: field.item_description_field_uom,
      });
    }
    return {
      item_description_field_id: fieldId,
      item_description_field_value: field.item_description_field_value,
      item_description_field_is_available:
        field.item_description_field_is_available,
      item_description_field_item_description_id:
        field.item_description_field_item_description_id,
    };
  });
  const { data: item, error: itemError } = await supabaseClient
    .schema("item_schema")
    .from("item_description_field_table")
    .insert(itemDescriptionFieldInput)
    .select("*");
  if (itemError) throw itemError;
  const { data: uom, error: uomError } = await supabaseClient
    .schema("item_schema")
    .from("item_description_field_uom_table")
    .insert(itemDescriptionFieldUomInput)
    .select("*");
  if (uomError) throw uomError;
  return item.map((item) => {
    const itemUom = uom.find(
      (value) =>
        value.item_description_field_uom_item_description_field_id ===
        item.item_description_field_id
    );
    return {
      ...item,
      item_description_field_uom: itemUom?.item_description_field_uom,
    };
  });
};

export const createRequestForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formBuilderData: FormBuilderData;
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("create_request_form", {
      input_data: params,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as FormTableRow;
};

export const createRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestFormValues: RequestFormValues;
    formId: string;
    teamMemberId?: string;
    signers: FormType["form_signer"];
    teamId: string;
    requesterName: string;
    formName: string;
    isFormslyForm: boolean;
    projectId: string;
    teamName: string;
    status?: string;
    requestScore?: number;
    rootFormslyRequestId?: string;
    recruiter?: string;
    userId: string;
    sssId?: string;
    applicationInformationFormslyId?: string;
    applicationInformationParams?: {
      position: string;
      firstName: string;
      middleName: string;
      lastName: string;
      contactNumber: string;
      email: string;
    };
    interviewParams?: {
      status: string;
      teamMemberId: string;
      data: {
        hr_request_reference_id: string;
        application_information_email: string;
        application_information_request_id: string;
        position: string;
      };
      technicalInterviewNumber: number;
      technicalInterviewId: string;
    };
    backgroundCheckParams?: {
      status: string;
      teamMemberId: string;
      data: {
        hr_request_reference_id: string;
        application_information_email: string;
        application_information_request_id: string;
        position: string;
      };
      backgroundCheckId: string;
    };
    tradeTestParams?: {
      status: string;
      teamMemberId: string;
      data: {
        hr_request_reference_id: string;
        application_information_email: string;
        application_information_request_id: string;
        position: string;
      };
      tradeTestId: string;
    };
  }
) => {
  const {
    requestFormValues,
    signers,
    teamId,
    requesterName,
    formName,
    isFormslyForm,
    projectId,
    teamName,
    status,
    requestScore,
    rootFormslyRequestId,
    recruiter,
    userId,
    sssId,
    applicationInformationFormslyId,
    applicationInformationParams,
    interviewParams,
    backgroundCheckParams,
    tradeTestParams,
  } = params;

  const requestId = uuidv4();

  // get request response
  const requestResponseInput: RequestResponseTableInsert[] = [];
  for (const section of requestFormValues.sections) {
    for (const field of section.section_field) {
      let responseValue = field.field_response;

      if (
        typeof responseValue === "boolean" ||
        responseValue ||
        field.field_type === "SWITCH" ||
        (field.field_type === "NUMBER" && responseValue === 0)
      ) {
        if (field.field_type === "FILE") {
          const fileResponse = responseValue as File;

          const fileType = getFileType(field.field_name);
          if (fileResponse["type"].split("/")[0] === "image") {
            responseValue = (
              await uploadImage(supabaseClient, {
                image: fileResponse,
                bucket: "REQUEST_ATTACHMENTS",
                fileType,
                userId,
                sssId,
                applicationInformationFormslyId,
              })
            ).publicUrl;
          } else {
            responseValue = (
              await uploadFile(supabaseClient, {
                file: fileResponse,
                bucket: "REQUEST_ATTACHMENTS",
                fileType,
                userId,
                sssId,
                applicationInformationFormslyId,
              })
            ).publicUrl;
          }
        } else if (field.field_type === "SWITCH" && !field.field_response) {
          responseValue = false;
        } else if (
          ["TEXT", "TEXTAREA", "AUTOCOMPLETE"].includes(field.field_type)
        ) {
          responseValue = (responseValue ? `${responseValue}` : "")
            .trim()
            .replace(/\s\s+/g, " ");
        }

        if (
          isFormslyForm &&
          formName === "Application Information" &&
          [
            "SSS ID Number",
            "Philhealth Number",
            "Pag-IBIG Number",
            "TIN",
          ].includes(field.field_name)
        ) {
          responseValue = `${responseValue}`.replace(/\D/g, "");
        }

        const response = {
          request_response: JSON.stringify(responseValue),
          request_response_duplicatable_section_id:
            field.field_section_duplicatable_id ?? null,
          request_response_field_id: field.field_id,
          request_response_request_id: requestId,
          request_response_prefix: field.field_prefix ?? null,
        };
        requestResponseInput.push(response);
      }
    }
  }
  // get request signers
  const requestSignerInput: RequestSignerTableInsert[] = [];
  const signerIdList: string[] = [];

  // get signer notification
  const requestSignerNotificationInput: NotificationTableInsert[] = [];

  signers.forEach((signer) => {
    if (!signerIdList.includes(signer.signer_id)) {
      requestSignerInput.push({
        request_signer_signer_id: signer.signer_id,
        request_signer_request_id: requestId,
      });
      requestSignerNotificationInput.push({
        notification_app: "REQUEST",
        notification_content: `${requesterName} requested you to sign his/her ${formName} request`,
        notification_redirect_url: `/${teamName}/requests/${requestId}`,
        notification_team_id: teamId,
        notification_type: "REQUEST",
        notification_user_id:
          signer.signer_team_member.team_member_user.user_id,
      });
      signerIdList.push(signer.signer_id);
    }
  });

  const responseValues = requestResponseInput
    .map((response) => {
      const escapedResponse = escapeQuotes(response.request_response);
      return `('${escapedResponse}',${
        response.request_response_duplicatable_section_id
          ? `'${response.request_response_duplicatable_section_id}'`
          : "NULL"
      },'${response.request_response_field_id}','${
        response.request_response_request_id
      }', '${
        response.request_response_prefix
          ? `${response.request_response_prefix}`
          : "NULL"
      }')`;
    })
    .join(",");

  const signerValues = requestSignerInput
    .map(
      (signer) =>
        `('${signer.request_signer_signer_id}','${signer.request_signer_request_id}')`
    )
    .join(",");

  // create request
  const { data, error } = await supabaseClient
    .rpc("create_request", {
      input_data: {
        requestId,
        formId: params.formId,
        teamMemberId: params.teamMemberId,
        responseValues,
        signerValues,
        requestSignerNotificationInput,
        formName,
        isFormslyForm,
        projectId,
        teamId,
        status,
        requestScore,
        rootFormslyRequestId,
        recruiter,
        applicationInformationParams,
        interviewParams,
        backgroundCheckParams,
        tradeTestParams,
      },
    })
    .select()
    .single();
  if (error) throw error;

  return data as RequestTableRow;
};

export const editRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestId: string;
    requestFormValues: RequestFormValues;
    signers: FormType["form_signer"];
    teamId: string;
    requesterName: string;
    formName: string;
    teamName: string;
    userId: string;
  }
) => {
  const {
    requestId,
    requestFormValues,
    signers,
    teamId,
    requesterName,
    formName,
    teamName,
    userId,
  } = params;

  // get request response
  const requestResponseInput: RequestResponseTableInsert[] = [];
  for (const section of requestFormValues.sections) {
    const duplicatableSectionId = section.section_is_duplicatable
      ? uuidv4()
      : null;
    for (const field of section.section_field) {
      let responseValue = field?.field_response as unknown;
      if (
        typeof responseValue === "boolean" ||
        responseValue ||
        field.field_type === "SWITCH" ||
        (field.field_type === "NUMBER" && responseValue === 0)
      ) {
        if (field.field_type === "FILE") {
          const fileResponse = responseValue as File;

          const fileType = getFileType(field.field_name);
          if (fileResponse["type"].split("/")[0] === "image") {
            responseValue = (
              await uploadImage(supabaseClient, {
                image: fileResponse,
                bucket: "REQUEST_ATTACHMENTS",
                fileType,
                userId,
              })
            ).publicUrl;
          } else {
            responseValue = (
              await uploadFile(supabaseClient, {
                file: fileResponse,
                bucket: "REQUEST_ATTACHMENTS",
                fileType,
                userId,
              })
            ).publicUrl;
          }
        } else if (field.field_type === "SWITCH" && !field.field_response) {
          responseValue = false;
        }

        const response = {
          request_response: JSON.stringify(responseValue),
          request_response_duplicatable_section_id: duplicatableSectionId,
          request_response_field_id: field.field_id,
          request_response_request_id: requestId,
          request_response_prefix: field.field_prefix ?? null,
        };
        requestResponseInput.push(response);
      }
    }
  }

  // get request signers
  const requestSignerInput: RequestSignerTableInsert[] = [];
  const signerIdList: string[] = [];

  // get signer notification
  const requestSignerNotificationInput: NotificationTableInsert[] = [];

  signers.forEach((signer) => {
    if (!signerIdList.includes(signer.signer_id)) {
      requestSignerInput.push({
        request_signer_signer_id: signer.signer_id,
        request_signer_request_id: requestId,
      });
      requestSignerNotificationInput.push({
        notification_app: "REQUEST",
        notification_content: `${requesterName} requested you to sign his/her ${formName} request`,
        notification_redirect_url: `/${teamName}/requests/${requestId}`,
        notification_team_id: teamId,
        notification_type: "REQUEST",
        notification_user_id:
          signer.signer_team_member.team_member_user.user_id,
      });
      signerIdList.push(signer.signer_id);
    }
  });

  const responseValues = requestResponseInput
    .map((response) => {
      const escapedResponse = escapeQuotes(response.request_response);
      return `('${escapedResponse}',${
        response.request_response_duplicatable_section_id
          ? `'${response.request_response_duplicatable_section_id}'`
          : "NULL"
      },'${response.request_response_field_id}','${
        response.request_response_request_id
      }', '${
        response.request_response_prefix
          ? `${response.request_response_prefix}`
          : "NULL"
      }')`;
    })
    .join(",");

  const signerValues = requestSignerInput
    .map(
      (signer) =>
        `('${signer.request_signer_signer_id}','${signer.request_signer_request_id}')`
    )
    .join(",");

  const notificationValues = requestSignerNotificationInput
    .map(
      (notification) =>
        `('${notification.notification_app}','${notification.notification_content}','${notification.notification_redirect_url}','${notification.notification_team_id}','${notification.notification_type}','${notification.notification_user_id}')`
    )
    .join(",");

  const { data, error } = await supabaseClient
    .rpc("edit_request", {
      input_data: {
        requestId,
        responseValues,
        signerValues,
        notificationValues,
      },
    })
    .select()
    .single();
  if (error) throw error;

  return data as RequestTableRow;
};

export const createFormslyPremadeForms = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
  }
) => {
  const { teamMemberId } = params;

  const { forms, sections, fieldWithId, fieldsWithoutId, options } =
    formslyPremadeFormsData(teamMemberId);

  const formValues = forms
    .map(
      (form) =>
        `('${form.form_id}','${form.form_name}','${form.form_description}','${form.form_app}','${form.form_is_formsly_form}','${form.form_is_hidden}','${form.form_team_member_id}','${form.form_is_disabled}')`
    )
    .join(",");

  const sectionValues = sections
    .map(
      (section) =>
        `('${section.section_form_id}','${section.section_id}','${section.section_is_duplicatable}','${section.section_name}','${section.section_order}')`
    )
    .join(",");

  const fieldWithIdValues = fieldWithId
    .map(
      (field) =>
        `('${field.field_id}','${field.field_is_read_only}','${field.field_is_required}','${field.field_name}','${field.field_order}','${field.field_section_id}','${field.field_type}')`
    )
    .join(",");

  const fieldsWithoutIdValues = fieldsWithoutId
    .map(
      (field) =>
        `('${field.field_is_read_only}','${field.field_is_required}','${field.field_name}','${field.field_order}','${field.field_section_id}','${field.field_type}')`
    )
    .join(",");

  const optionsValues = options
    .map(
      (option) =>
        `('${option.option_field_id}','${option.option_order}','${option.option_value}')`
    )
    .join(",");

  const { error } = await supabaseClient
    .rpc("create_formsly_premade_forms", {
      input_data: {
        formValues,
        sectionValues,
        fieldWithIdValues,
        fieldsWithoutIdValues,
        optionsValues,
      },
    })
    .select()
    .single();

  if (error) throw error;
};

export const createTeamGroup = async (
  supabaseClient: SupabaseClient<Database>,
  params: TeamGroupTableInsert
) => {
  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_group_table")
    .insert(params)
    .select("*")
    .single();
  if (error) throw error;

  return data;
};

export const createTeamProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamProjectName: string;
    teamProjectInitials: string;
    teamProjectTeamId: string;
    siteMapId: string;
    boqId: string;
    region: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    zipCode: string;
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("create_team_project", {
      input_data: {
        ...params,
      },
    })
    .select()
    .single();
  if (error) throw error;

  return data as TeamProjectWithAddressType;
};

export const insertGroupMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    groupId: string;
    teamMemberIdList: string[];
    teamProjectIdList: string[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("insert_group_member", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as unknown as { data: GroupTeamMemberType[]; count: number };
};

export const insertProjectMember = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectId: string;
    teamMemberIdList: string[];
    teamGroupIdList: string[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("insert_project_member", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as unknown as { data: ProjectTeamMemberType[]; count: number };
};

export const cancelTeamInvitation = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    invitation_id: string;
  }
) => {
  const { invitation_id } = params;
  const { error } = await supabaseClient
    .schema("user_schema")
    .from("invitation_table")
    .update({ invitation_is_disabled: true })
    .eq("invitation_id", invitation_id)
    .select();

  if (error) throw error;
};

export const createTicketComment = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    commentInput: TicketCommentTableInsert;
    notificationInput: NotificationTableInsert[];
  }
) => {
  const { data, error } = await supabaseClient.rpc("create_ticket_comment", {
    input_data: params,
  });
  if (error) throw error;

  return data as TicketCommentTableRow;
};

export const createRowInLookupTable = async (
  supabaseClient: SupabaseClient,
  params: {
    inputData: JSON;
    tableName: string;
    schema: string;
  }
) => {
  const { tableName, inputData, schema } = params;
  const { data, error } = await supabaseClient
    .schema(schema)
    .from(`${tableName}_table`)
    .insert(inputData)
    .select()
    .single();
  if (error) throw error;

  const id = `${tableName}_id`;
  const value = tableName;
  const status = `${tableName}_is_available`;

  const formattedData = data as unknown as {
    [key: string]: string;
  };

  return {
    id: formattedData[id],
    status: Boolean(formattedData[status]),
    value: formattedData[value],
  };
};

export const createTeamMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    memoData: {
      memo_author_user_id: string;
      memo_subject: string;
      memo_team_id: string;
      memo_reference_number: string;
    };
    signerData: {
      memo_signer_order: number;
      memo_signer_is_primary: boolean;
      memo_signer_team_member_id: string;
      memo_signer_user_id: string;
    }[];
    lineItemData: MemoLineItem[];
    userId: string;
  }
) => {
  const { memoData, signerData, lineItemData, userId } = params;

  // upload attachments
  const updatedLineItemData = await processAllMemoLineItems(
    lineItemData,
    supabaseClient,
    userId
  );

  const input_data = {
    memoData,
    signerData,
    lineItemData: updatedLineItemData,
  };

  // create memo
  const { data, error } = await supabaseClient.rpc("create_memo", {
    input_data,
  });
  if (error) throw error;

  return data as MemoTableRow;
};

const processAllMemoLineItems = async (
  lineItemData: MemoLineItem[],
  supabaseClient: SupabaseClient<Database>,
  userId: string
) => {
  const processedLineItems = await Promise.all(
    lineItemData.map(async (lineItem) => {
      const memo_line_item_id = uuidv4();

      if (lineItem.memo_line_item_attachment_caption) {
        lineItem.memo_line_item_attachment_caption = escapeQuotes(
          lineItem.memo_line_item_attachment_caption
        );
      }

      if (lineItem.memo_line_item_attachment) {
        const bucket = "MEMO_ATTACHMENTS";
        const attachmentPublicUrl = (
          await uploadImage(supabaseClient, {
            image: lineItem.memo_line_item_attachment,
            bucket,
            fileType: "m",
            userId,
          })
        ).publicUrl;

        return {
          ...lineItem,
          memo_line_item_id,
          memo_line_item_attachment_public_url: attachmentPublicUrl,
          memo_line_item_attachment_storage_bucket: bucket,
        };
      }

      return {
        ...lineItem,
        memo_line_item_content: escapeQuotes(lineItem.memo_line_item_content),
        memo_line_item_id,
      };
    })
  );

  return JSON.parse(JSON.stringify(processedLineItems));
};

export const agreeToMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: { memoId: string; teamMemberId: string }
) => {
  const { data, error } = await supabaseClient
    .rpc("agree_to_memo", { input_data: params })
    .select("*");
  if (error) throw error;

  return data as unknown as MemoAgreementTableRow & {
    memo_agreement_by_team_member: {
      user_data: {
        user_avatar: string;
        user_id: string;
        user_first_name: string;
        user_last_name: string;
        user_employee_number: {
          user_employee_number: string;
        }[];
      };
    };
  };
};

export const createReferenceMemo = async (
  supabaseClient: SupabaseClient<Database>,
  params: ReferenceMemoType,
  userId: string
) => {
  const memoId = uuidv4();
  const updatedLineItemData: ReferenceMemoType["memo_line_item_list"] =
    await processReferenceMemoLineItems(
      params.memo_line_item_list,
      supabaseClient,
      memoId,
      userId
    );

  const memoSignerTableValues = params.memo_signer_list
    .map(
      (signer, signerIndex) =>
        `('${signer.memo_signer_is_primary}', '${signerIndex}', '${signer.memo_signer_team_member?.team_member_id}', '${memoId}')`
    )
    .join(",");

  const memoLineItemTableValues = updatedLineItemData
    .map(
      (lineItem, lineItemIndex) =>
        `('${lineItem.memo_line_item_id}', '${escapeQuotes(
          lineItem.memo_line_item_content
        )}', '${lineItemIndex}', '${memoId}')`
    )
    .join(",");

  const memoLineItemAttachmentTableValues = updatedLineItemData
    .filter(
      (lineItem) =>
        lineItem.memo_line_item_attachment?.memo_line_item_attachment_name
    )
    .map(
      ({ memo_line_item_id, memo_line_item_attachment: lineItemAttachment }) =>
        `('${lineItemAttachment?.memo_line_item_attachment_name}', '${
          escapeQuotes(
            `${lineItemAttachment?.memo_line_item_attachment_caption}`
          ) ?? ""
        }', '${
          lineItemAttachment?.memo_line_item_attachment_storage_bucket
        }', '${
          lineItemAttachment?.memo_line_item_attachment_public_url
        }', '${memo_line_item_id}')`
    )
    .join(",");

  const input_data = {
    memo_id: memoId,
    memo_subject: params.memo_subject,
    memo_reference_number: params.memo_reference_number,
    memo_team_id: params.memo_team_id,
    memo_author_user_id: params.memo_author_user_id,
    memoSignerTableValues,
    memoLineItemTableValues,
    memoLineItemAttachmentTableValues,
  };

  const { data, error } = await supabaseClient.rpc("create_reference_memo", {
    input_data,
  });

  if (error) throw error;

  return data as unknown as ReferenceMemoType;
};

const processReferenceMemoLineItems = async (
  lineItemData: ReferenceMemoType["memo_line_item_list"],
  supabaseClient: SupabaseClient<Database>,
  memoId: string,
  userId: string
) => {
  const processedLineItems = await Promise.all(
    lineItemData.map(async (lineItem) => {
      const memoLineItemId = uuidv4();
      const file =
        lineItem.memo_line_item_attachment &&
        lineItem.memo_line_item_attachment.memo_line_item_attachment_file;

      if (file) {
        const bucket = "MEMO_ATTACHMENTS";
        const attachmentPublicUrl = (
          await uploadImage(supabaseClient, {
            image: file,
            bucket,
            fileType: "m",
            userId,
          })
        ).publicUrl;

        return {
          memo_line_item_id: memoLineItemId,
          memo_line_item_content: lineItem.memo_line_item_content,
          memo_line_item_memo_id: memoId,
          memo_line_item_attachment: {
            memo_line_item_attachment_public_url: attachmentPublicUrl,
            memo_line_item_attachment_storage_bucket: bucket,
            memo_line_item_attachment_name: file.name,
            memo_line_item_attachment_caption:
              lineItem.memo_line_item_attachment
                ?.memo_line_item_attachment_caption ?? "",
          },
        };
      }

      return {
        memo_line_item_id: memoLineItemId,
        memo_line_item_content: lineItem.memo_line_item_content,
        memo_line_item_memo_id: memoId,
      };
    })
  );

  return JSON.parse(JSON.stringify(processedLineItems));
};

export const createRowInOtherExpensesTypeTable = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    inputData: OtherExpensesTypeTableInsert;
  }
) => {
  const { inputData } = params;
  const { data, error } = await supabaseClient
    .schema("other_expenses_schema")
    .from("other_expenses_type_table")
    .insert(inputData)
    .select()
    .single();
  if (error) throw error;

  return data;
};

export const createTicket = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberId: string;
    category: string;
    ticketFormValues: CreateTicketFormValues;
    userId: string;
  }
) => {
  const { category, teamMemberId, ticketFormValues, userId } = params;

  const ticketId = uuidv4();

  // get request response
  const requestResponseInput: TicketResponseTableInsert[] = [];
  for (const section of ticketFormValues.ticket_sections) {
    for (const field of section.ticket_section_fields) {
      let responseValue = field.ticket_field_response;
      if (responseValue) {
        if (field.ticket_field_type === "FILE") {
          const fileResponse = responseValue as File;

          const fileType = getFileType(field.ticket_field_name);
          if (fileResponse["type"].split("/")[0] === "image") {
            responseValue = (
              await uploadImage(supabaseClient, {
                image: fileResponse,
                bucket: "TICKET_ATTACHMENTS",
                fileType,
                userId,
              })
            ).publicUrl;
          } else {
            responseValue = (
              await uploadFile(supabaseClient, {
                file: fileResponse,
                bucket: "TICKET_ATTACHMENTS",
                fileType,
                userId,
              })
            ).publicUrl;
          }
        }
        const response = {
          ticket_response_value: JSON.stringify(`${responseValue}`.trim()),
          ticket_response_duplicatable_section_id:
            section.field_section_duplicatable_id ?? null,
          ticket_response_field_id: field.ticket_field_id,
          ticket_response_ticket_id: ticketId,
        };
        requestResponseInput.push(response);
      }
    }
  }

  const responseValues = requestResponseInput
    .map((response) => {
      const escapedResponse = escapeQuotes(response.ticket_response_value);
      return `('${escapedResponse}',${
        response.ticket_response_duplicatable_section_id
          ? `'${response.ticket_response_duplicatable_section_id}'`
          : "NULL"
      },'${response.ticket_response_field_id}','${
        response.ticket_response_ticket_id
      }')`;
    })
    .join(",");

  // create ticket
  const { data, error } = await supabaseClient
    .rpc("create_ticket", {
      input_data: {
        category,
        ticketId,
        teamMemberId,
        responseValues,
      },
    })
    .select()
    .single();
  if (error) throw error;

  return data as TicketTableRow;
};

export const editTicket = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    ticketId: string;
    ticketFormValues: CreateTicketFormValues;
    userId: string;
  }
) => {
  const { ticketId, ticketFormValues, userId } = params;

  // get request response
  const requestResponseInput: TicketResponseTableInsert[] = [];
  for (const section of ticketFormValues.ticket_sections) {
    for (const field of section.ticket_section_fields) {
      let responseValue = field.ticket_field_response;
      if (responseValue) {
        if (
          field.ticket_field_type === "FILE" &&
          typeof responseValue !== "string"
        ) {
          const fileResponse = responseValue as File;

          const fileType = getFileType(field.ticket_field_name);
          if (fileResponse["type"].split("/")[0] === "image") {
            responseValue = (
              await uploadImage(supabaseClient, {
                image: fileResponse,
                bucket: "TICKET_ATTACHMENTS",
                fileType,
                userId,
              })
            ).publicUrl;
          } else {
            responseValue = (
              await uploadFile(supabaseClient, {
                file: fileResponse,
                bucket: "TICKET_ATTACHMENTS",
                fileType,
                userId,
              })
            ).publicUrl;
          }
        }
        const response = {
          ticket_response_value: JSON.stringify(`${responseValue}`.trim()),
          ticket_response_duplicatable_section_id:
            section.field_section_duplicatable_id ?? null,
          ticket_response_field_id: field.ticket_field_id,
          ticket_response_ticket_id: ticketId,
        };
        requestResponseInput.push(response);
      }
    }
  }

  const responseValues = requestResponseInput
    .map((response) => {
      const escapedResponse = escapeQuotes(response.ticket_response_value);
      return `('${escapedResponse}',${
        response.ticket_response_duplicatable_section_id
          ? `'${response.ticket_response_duplicatable_section_id}'`
          : "NULL"
      },'${response.ticket_response_field_id}','${
        response.ticket_response_ticket_id
      }')`;
    })
    .join(",");

  // edit ticket
  const { error } = await supabaseClient.rpc("edit_ticket", {
    input_data: {
      ticketId,
      responseValues,
    },
  });
  if (error) throw error;
  else return true;
};

export const createCustomCSI = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemName: string;
    csiCodeDescription: string;
    csiCode: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("create_custom_csi", {
    input_data: {
      ...params,
    },
  });
  if (error) throw error;
  return Boolean(data);
};

export const createItemDivision = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    itemId: string;
    divisionId: string;
  }
) => {
  const { divisionId, itemId } = params;
  const { data, error } = await supabaseClient
    .schema("item_schema")
    .from("item_division_table")
    .insert({ item_division_value: divisionId, item_division_item_id: itemId });
  if (error) throw error;
  return data;
};

export const createEquipment = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentData: EquipmentTableInsert;
    category: string;
  }
) => {
  const { equipmentData, category } = params;
  const { data, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_table")
    .insert(equipmentData)
    .select()
    .single();
  if (error) throw error;

  return {
    ...data,
    equipment_category: category,
  };
};

export const createEquipmentDescription = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentDescriptionData: EquipmentDescriptionTableInsert;
    brand: string;
    model: string;
  }
) => {
  const { equipmentDescriptionData, brand, model } = params;
  const { data, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_description_table")
    .insert(equipmentDescriptionData)
    .select()
    .single();
  if (error) throw error;

  return {
    ...data,
    equipment_description_brand: brand,
    equipment_description_model: model,
  };
};

export const createEquipmentPart = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentPartData: EquipmentPartTableInsert;
    name: string;
    brand: string;
    model: string;
    uom: string;
    category: string;
  }
) => {
  const { equipmentPartData, name, brand, model, uom, category } = params;
  const { data, error } = await supabaseClient
    .schema("equipment_schema")
    .from("equipment_part_table")
    .insert(equipmentPartData)
    .select()
    .single();
  if (error) throw error;

  return {
    ...data,
    equipment_part_general_name: name,
    equipment_part_brand: brand,
    equipment_part_model: model,
    equipment_part_unit_of_measurement: uom,
    equipment_part_component_category: category,
  };
};

export const createPedPartFromTicketRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    equipmentName: string;
    partName: string;
    partNumber: string;
    brand: string;
    model: string;
    unitOfMeasure: string;
    category: string;
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "create_ped_part_from_ticket_request",
    {
      input_data: escapeQuotesForObject(params),
    }
  );
  if (error) throw error;
  return data;
};

export const assignJiraFormslyProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formslyProjectId: string;
    jiraProjectId: string;
  }
) => {
  const { formslyProjectId, jiraProjectId } = params;

  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_formsly_project_table")
    .insert({
      formsly_project_id: formslyProjectId,
      jira_project_id: jiraProjectId,
    })
    .select()
    .maybeSingle();

  if (error) throw error;

  return { success: true, data: data };
};

export const assignJiraUserToProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userAccountId: string;
    userRoleId: string;
    teamProjectId: string;
    selectedRoleLabel: string;
  }
) => {
  const { userAccountId, teamProjectId, userRoleId, selectedRoleLabel } =
    params;

  // check for duplicate
  const { count, error: CountError } = await supabaseClient
    .schema("jira_schema")
    .from("jira_project_user_table")
    .select("jira_project_user_id", { count: "exact" })
    .eq("jira_project_user_account_id", userAccountId)
    .eq("jira_project_user_team_project_id", teamProjectId);
  if (CountError) throw CountError;

  if (Number(count) > 1) {
    return { success: false, data: null, error: "Duplicate entry." };
  }

  if (
    ["WAREHOUSE REPRESENTATIVE", "WAREHOUSE AREA LEAD"].includes(
      selectedRoleLabel
    )
  ) {
    const { count, error: CountError } = await supabaseClient
      .schema("jira_schema")
      .from("jira_project_user_table")
      .select("jira_project_user_id", { count: "exact" })
      .eq("jira_project_user_role_id", userRoleId)
      .eq("jira_project_user_team_project_id", teamProjectId);
    if (CountError) throw CountError;

    if (Number(count) >= 1) {
      return {
        success: false,
        data: null,
        error: `${selectedRoleLabel} must only have 1 entry per project.`,
      };
    }
  }

  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_project_user_table")
    .insert({
      jira_project_user_account_id: userAccountId,
      jira_project_user_team_project_id: teamProjectId,
      jira_project_user_role_id: userRoleId,
    })
    .select()
    .maybeSingle();
  if (error) throw error;

  if (data) {
    return { success: true, data: data, error: null };
  } else {
    return { success: true, data: null, error: null };
  }
};

export const assignJiraUserToItemCategory = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    data: JiraItemCategoryUserTableInsert;
    isUpdate: boolean;
  }
) => {
  if (params.isUpdate) {
    return await updateJiraItemCategory(supabaseClient, params);
  } else {
    return await insertJiraItemCategory(supabaseClient, params);
  }
};

const updateJiraItemCategory = async (
  supabaseClient: SupabaseClient<Database>,
  params: { data: JiraItemCategoryUserTableInsert }
) => {
  if (!params.data.jira_item_user_id) throw new Error();
  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_item_user_table")
    .update(params.data)
    .eq("jira_item_user_id", params.data.jira_item_user_id)
    .select(
      `
      jira_item_user_id,
      jira_item_user_item_category_id,
      jira_item_user_account_id(jira_user_account_jira_id, jira_user_account_display_name, jira_user_account_id),
      jira_item_user_role_id(jira_user_role_id, jira_user_role_label)
      `
    )
    .maybeSingle();

  if (error) throw error;

  return formatJiraItemUserTableData(data as unknown as JiraItemUserTableData);
};

const insertJiraItemCategory = async (
  supabaseClient: SupabaseClient<Database>,
  params: { data: JiraItemCategoryUserTableInsert }
) => {
  const { count } = await supabaseClient
    .schema("jira_schema")
    .from("jira_item_user_table")
    .select("jira_item_user_id", { count: "exact" })
    .eq(
      "jira_item_user_item_category_id",
      params.data.jira_item_user_item_category_id
    );

  if (Number(count)) {
    return { success: false, data: null, error: "Duplicate entry" };
  }

  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_item_user_table")
    .insert(params.data)
    .select(
      `
      jira_item_user_id,
      jira_item_user_item_category_id,
      jira_item_user_account_id(jira_user_account_jira_id, jira_user_account_display_name, jira_user_account_id),
      jira_item_user_role_id(jira_user_role_id, jira_user_role_label)
      `
    )
    .maybeSingle();

  if (error) throw error;

  return formatJiraItemUserTableData(data as unknown as JiraItemUserTableData);
};

export const createJiraProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: JiraProjectTableInsert
) => {
  // check if duplicate
  const { count, error: duplicateError } = await supabaseClient
    .schema("jira_schema")
    .from("jira_project_table")
    .select("jira_project_id", { count: "exact" })
    .eq("jira_project_jira_id", params.jira_project_jira_id);

  if (duplicateError) throw duplicateError;

  if (Number(count)) {
    return { data: null, error: "Jira project already exists." };
  }

  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_project_table")
    .insert(params)
    .select("*");

  if (error) throw error;

  return { data, error: null };
};

export const createJiraUser = async (
  supabaseClient: SupabaseClient<Database>,
  params: JiraUserAccountTableInsert
) => {
  // check if duplicate
  const { count, error: duplicateError } = await supabaseClient
    .schema("jira_schema")
    .from("jira_user_account_table")
    .select("jira_user_account_id", { count: "exact" })
    .eq("jira_user_account_jira_id", params.jira_user_account_jira_id);

  if (duplicateError) throw duplicateError;

  if (Number(count)) {
    return { success: false, error: "Jira user already exists." };
  }

  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_user_account_table")
    .insert(params);

  if (error) throw error;

  return { data, error: null };
};

export const createJiraFormslyItemCategory = async (
  supabaseClient: SupabaseClient<Database>,
  params: JiraItemCategoryTableInsert
) => {
  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_item_category_table")
    .insert(params)
    .select(
      "*, assigned_jira_user: jira_item_user_table(jira_item_user_id, jira_item_user_account_id(jira_user_account_jira_id, jira_user_account_display_name, jira_user_account_id), jira_item_user_role_id(jira_user_role_id, jira_user_role_label))"
    )
    .maybeSingle();

  if (error) throw error;

  const assignedUser = data?.assigned_jira_user as unknown as {
    jira_item_user_id: string;
    jira_item_user_account_id: {
      jira_user_account_jira_id: string;
      jira_user_account_display_name: string;
      jira_user_account_id: string;
    };
    jira_item_user_role_id: {
      jira_user_role_id: string;
      jira_user_role_label: string;
    };
  }[];

  const formattedData = {
    ...data,
    assigned_jira_user: {
      ...assignedUser[0],
      ...assignedUser[0]?.jira_item_user_account_id,
      ...assignedUser[0]?.jira_item_user_role_id,
    },
  };

  return formattedData as unknown as JiraFormslyItemCategoryWithUserDataType;
};

export const createItemCategory = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    category: string;
    teamMemberId: string;
  }
) => {
  const { error } = await supabaseClient.rpc("create_item_category", {
    input_data: params,
  });

  if (error) throw error;
};

export const createJiraOrganization = async (
  supabaseClient: SupabaseClient<Database>,
  params: JiraOrganizationTableInsert
) => {
  // check if duplicate
  const { count, error: duplicateError } = await supabaseClient
    .schema("jira_schema")
    .from("jira_organization_table")
    .select("jira_organization_id", { count: "exact", head: true })
    .eq("jira_organization_jira_id", params.jira_organization_jira_id);

  if (duplicateError) throw duplicateError;

  if (Number(count)) {
    return { success: false, error: "Jira organization already exists." };
  }

  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_organization_table")
    .insert(params)
    .select();

  if (error) throw error;

  return { data, error: null };
};

export const assignJiraFormslyOrganization = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formslyProjectId: string;
    jiraOrganizationId?: string;
  }
) => {
  const { formslyProjectId, jiraOrganizationId } = params;
  if (!jiraOrganizationId) return null;

  const { data, error } = await supabaseClient
    .schema("jira_schema")
    .from("jira_organization_team_project_table")
    .insert({
      jira_organization_team_project_project_id: formslyProjectId,
      jira_organization_team_project_organization_id: jiraOrganizationId,
    })
    .select()
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const encryptAppSourceId = async () => {
  const response = await fetch("/api/jwt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "encrypt",
      value: APP_SOURCE_ID,
    }),
  });

  if (response.status !== 200) throw new Error("Encryption Error");
  const { data } = await response.json();

  return data as string;
};

export const createJobTitle = async (
  supabaseClient: SupabaseClient<Database>,
  params: JobTitleTableInsert
) => {
  // check if duplicate
  const { count, error: duplicateError } = await supabaseClient
    .schema("lookup_schema")
    .from("employee_job_title_table")
    .select("employee_job_title_id", { count: "exact" })
    .eq("employee_job_title_label", params.employee_job_title_label);

  if (duplicateError) throw duplicateError;

  if (Number(count)) {
    return { data: null, error: "Job title already exists." };
  }

  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("employee_job_title_table")
    .insert(params)
    .select("*");

  if (error) throw error;

  return { data, error: null };
};

export const createDepartmentSigner = async (
  supabaseClient: SupabaseClient<Database>,
  params: SignerTableInsert
) => {
  // check if duplicate
  const {
    data: duplicateData,
    count,
    error: duplicateError,
  } = await supabaseClient
    .schema("form_schema")
    .from("signer_table")
    .select("signer_id, signer_is_disabled", {
      count: "exact",
    })
    .eq("signer_form_id", `${params.signer_form_id}`)
    .eq("signer_team_project_id", `${params.signer_team_project_id}`)
    .eq("signer_team_department_id", `${params.signer_team_department_id}`)
    .eq("signer_team_member_id", `${params.signer_team_member_id}`)
    .eq("signer_is_primary_signer", Boolean(params.signer_is_primary_signer))
    .maybeSingle();

  if (duplicateError) throw duplicateError;

  if (!duplicateData?.signer_is_disabled && Number(count)) {
    return null;
  }

  if (duplicateData?.signer_is_disabled) {
    const { data, error } = await supabaseClient
      .schema("form_schema")
      .from("signer_table")
      .update({ signer_is_disabled: false })
      .eq("signer_id", duplicateData.signer_id)
      .select("*");

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabaseClient
    .schema("form_schema")
    .from("signer_table")
    .insert(params)
    .select("*");

  if (error) throw error;

  return data;
};

export const sendNotificationToCostEngineer = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectId: string;
    requesterName: string;
    redirectUrl: string;
    teamId: string;
  }
) => {
  const { error } = await supabaseClient.rpc(
    "send_notification_to_project_cost_engineer",
    { input_data: params }
  );
  if (error) throw error;
};

export const createItemFromTicketRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    generalName: string;
    unitOfMeasurement: string;
    glAccount: string;
    divisionList: string[];
    divisionDescription: string;
    isPedItem: boolean;
    isITAssetItem: boolean;
    descriptionList: { description: string; isWithUom: boolean }[];
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "create_item_from_ticket_request",
    {
      input_data: params,
    }
  );
  if (error) throw error;
  return data;
};

export const addMemberToAllProject = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamMemberIdList: string[];
  }
) => {
  const { data, error } = await supabaseClient
    .rpc("add_team_member_to_all_project", { input_data: params })
    .select("*");

  if (error) throw error;

  return data as InvitationTableRow[];
};

export const createInterviewOnlineMeeting = async (
  supabaseClient: SupabaseClient<Database>,
  params: InterviewOnlineMeetingTableInsert & {
    updateScheduleProps: {
      interviewSchedule: string;
      targetId: string;
      status: string;
      table: string;
      meetingTypeNumber?: number;
      team_member_id: string;
    };
  }
) => {
  const { data, error } = await supabaseClient.rpc("create_schedule", {
    input_data: params,
  });
  if (error) throw error;

  return data as InterviewOnlineMeetingTableRow;
};
export const generateApiKey = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    keyLabel: string;
  }
) => {
  const apiKey = uuidv4();
  const { teamId, keyLabel } = params;

  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_key_table")
    .insert({
      team_key_team_id: teamId,
      team_key_api_key: apiKey,
      team_key_label: keyLabel.toUpperCase(),
    })
    .select("team_key_api_key, team_key_label")
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const createAdOwnerRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: AdOwnerRequestTableInsert
) => {
  const { error } = await supabaseClient.rpc("create_ad_owner_request", {
    input_data: params,
  });

  if (error) throw error;
};

export const createTechnicalQuestions = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    requestFormValues: TechnicalQuestionFormValues;
    questionnaireId: string;
  }
) => {
  const { requestFormValues, questionnaireId } = params;

  let fieldOrder = await getQuestionFieldOrder(supabaseClient, {
    questionnaireId,
  });

  fieldOrder = fieldOrder + 1;

  const FieldTableInput: FieldTableInsert[] = [];
  const OptionTableInput: QuestionOption[] = [];
  const CorrectResponseTableInput: FieldCorrectResponseTableInsert[] = [];
  const QuestionId: string[] = [];
  let FieldId = "";
  let correctAnswerFieldResponse = "";
  let correctAnswerFieldId = "";

  for (const section of requestFormValues.sections) {
    const technicalQuestion = section.field_name === "Technical Question";

    if (technicalQuestion) {
      const fieldId = uuidv4();
      FieldId = fieldId;
      correctAnswerFieldId = fieldId;

      const fieldEntry: FieldTableInsert = {
        field_id: fieldId,
        field_name: String(section.question.trim()),
        field_is_required: true,
        field_type: "MULTIPLE CHOICE",
        field_order: fieldOrder,
        field_section_id: "45a29efd-e90c-4fdd-8cb0-17d3b5a5e739",
      };

      FieldTableInput.push(fieldEntry);
      fieldOrder++;

      let optionOrder = 1;
      for (const optionField of section.choices) {
        if (optionField.field_name.toLowerCase().includes("question choice")) {
          const optionId = uuidv4();
          const optionEntry: QuestionOption = {
            option_id: optionId,
            option_value:
              String(optionField.choice) === "undefined"
                ? null
                : String(optionField.choice.trim()),
            option_order: optionOrder,
            option_field_id: FieldId,
          };

          OptionTableInput.push(optionEntry);
          optionOrder++;

          if (optionField.isCorrectAnswer) {
            correctAnswerFieldResponse = String(optionField.choice.trim());
          }
        }
      }

      if (correctAnswerFieldResponse) {
        const correctResponseEntry: FieldCorrectResponseTableInsert = {
          correct_response_id: uuidv4(),
          correct_response_value: correctAnswerFieldResponse,
          correct_response_field_id: correctAnswerFieldId,
        };
        CorrectResponseTableInput.push(correctResponseEntry);
      }
    }
  }

  const fieldResponseValues = FieldTableInput.map((response) => {
    const escapedResponse = escapeQuotes(response.field_name || "");
    return `('${response.field_id}', '${escapedResponse}', '${response.field_is_required}', '${response.field_type}', ${response.field_order}, '${response.field_section_id}')`;
  }).join(",");

  const correctResponseValues = CorrectResponseTableInput.map((response) => {
    const escapedResponse = escapeQuotes(response.correct_response_value || "");
    return `('${response.correct_response_id}', '${escapedResponse}', '${response.correct_response_field_id}')`;
  }).join(",");

  const questionResponseValues = FieldTableInput.map((response) => {
    const questionId = uuidv4();
    QuestionId.push(questionId);
    const escapedResponse = escapeQuotes(response.field_name || "");
    return `('${questionId}', '${escapedResponse}', '${response.field_id}', '${questionnaireId}')`;
  }).join(",");

  const questionOptionResponseValues = OptionTableInput.map(
    (response, index) => {
      const escapedResponse = escapeQuotes(response.option_value || "");
      const fieldUuid = QuestionId[Math.floor(index / 4)];
      return `('${escapedResponse}', '${response.option_order}', '${fieldUuid}')`;
    }
  ).join(",");

  const { data, error } = await supabaseClient
    .rpc("create_technical_question", {
      input_data: {
        fieldResponseValues,
        correctResponseValues,
        questionResponseValues,
        questionOptionResponseValues,
      },
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const checkIfQuestionExists = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    data: TechnicalQuestionFormValues;
    questionnaireId: string;
  }
) => {
  const { data: requestFormValues, questionnaireId } = params;
  const technicalQuestionData = [];
  for (const section of requestFormValues.sections) {
    if (section.field_name.toLowerCase().includes("technical question")) {
      technicalQuestionData.push(String(section.question.trim().toLowerCase()));
    }
  }

  const { data: fieldData, error: fieldError } = await supabaseClient.rpc(
    "check_technical_question",
    {
      input_data: {
        data: technicalQuestionData,
        questionnaireId,
      },
    }
  );

  if (fieldError) throw fieldError;

  return fieldData as boolean;
};

export const createQuestionnaire = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    questionnaireName: string;
    teamId: string;
    team_member_id: string;
  }
) => {
  const { data, error } = await supabaseClient
    .schema("form_schema")
    .from("questionnaire_table")
    .insert({
      questionnaire_name: params.questionnaireName,
      questionnaire_team_id: params.teamId,
      questionnaire_created_by: params.team_member_id,
    })
    .select()
    .single();

  if (error) throw error;

  return data as unknown as TechnicalAssessmentTableRow;
};

export const checkQuestionnaireName = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    questionnaireName: string;
  }
) => {
  const { data, error } = await supabaseClient
    .schema("form_schema")
    .from("questionnaire_table")
    .select("*")
    .ilike("questionnaire_name", params.questionnaireName)
    .limit(1);

  if (error) throw error;

  return data;
};

export const insertError = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    errorTableRow: ErrorTableInsert;
  }
) => {
  const { errorTableRow } = params;
  const { error } = await supabaseClient
    .from("error_table")
    .insert(errorTableRow);
  if (error) throw error;
};

export const resendEmail = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    email: string;
  }
) => {
  const { email } = params;
  const { error } = await supabaseClient
    .schema("user_schema")
    .from("email_resend_table")
    .insert({
      email_resend_email: email,
    });
  if (error) throw error;
};

export const getQuestionFieldOrder = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    questionnaireId: string;
  }
) => {
  const { questionnaireId } = params;
  const { data, error } = await supabaseClient.rpc("get_question_field_order", {
    input_data: {
      questionnaireId,
    },
  });

  if (error) throw error;

  return data as unknown as number;
};

export const createUserWithSSSID = async (
  supabaseClient: SupabaseClient<Database>,
  params: UserTableInsert & {
    user_employee_number: string;
    sss_number: string;
    sss_front_image_url: string;
    sss_back_image_url: string;
  }
) => {
  const { user_phone_number } = params;

  const { error } = await supabaseClient
    .rpc("create_user_with_sss_id", {
      input_data: {
        ...params,
        user_phone_number: user_phone_number || "",
      },
    })
    .select()
    .single();
  if (error) throw error;
};

export const createSSSID = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    sssData: UserSSSTableInsert;
  }
) => {
  const { sssData } = params;

  const { error } = await supabaseClient
    .schema("user_schema")
    .from("user_sss_table")
    .insert(sssData);
  if (error) throw error;
};

export const checkHRISNumber = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    hrisNumber: string;
  }
) => {
  const { hrisNumber } = params;
  let isUnique = false;
  const { data, error } = await supabaseClient
    .schema("lookup_schema")
    .from("scic_employee_table")
    .select("scic_employee_hris_id_number")
    .eq("scic_employee_hris_id_number", hrisNumber)
    .limit(1);
  if (error) throw error;

  if (data.length > 0) {
    isUnique = true;
  }

  return isUnique;
};

export const createNewEmployee = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    employeeData: SCICEmployeeTableInsert;
  }
) => {
  const { employeeData } = params;

  const { error } = await supabaseClient
    .schema("lookup_schema")
    .from("scic_employee_table")
    .insert(employeeData);
  if (error) throw error;
};

export const updateEmployee = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    employeeData: SCICEmployeeTableUpdate;
  }
) => {
  const { employeeData } = params;

  const { error } = await supabaseClient
    .schema("lookup_schema")
    .from("scic_employee_table")
    .update(employeeData)
    .eq("scic_employee_id", employeeData.scic_employee_id as string);
  if (error) throw error;
};

export const createRequesterPrimarySigner = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    formId: string;
    requesterTeamMemberId: string[];
    signerTeamMemberId: string;
    signerAction: string;
  }
) => {
  const { error } = await supabaseClient.rpc(
    "create_requester_primary_signer",
    {
      input_data: params,
    }
  );
  if (error) throw error;
};

export const createPracticalTestForm = async (
  supabaseClient: SupabaseClient<Database>,
  params: CreatePracticalTestFormType & { teamMemberId: string; teamId: string }
) => {
  const {
    practical_test_id,
    practical_test_label,
    practical_test_passing_score,
    practical_test_position_list,
    practical_test_question_list,
    teamMemberId,
    teamId,
  } = params;

  const currentDate = moment(await getCurrentDate(supabaseClient)).format();
  const isEdit = Boolean(practical_test_id);
  const practicalTestId = isEdit ? practical_test_id : uuidv4();

  let practicalTestQuery = "";
  if (isEdit) {
    practicalTestQuery = `
      UPDATE hr_schema.practical_test_table
      SET
        practical_test_date_updated = '${currentDate}',
        practical_test_label = '${practical_test_label.trim()}',
        practical_test_passing_score = ${practical_test_passing_score},
        practical_test_updated_by = '${teamMemberId}'
      WHERE practical_test_id = '${practicalTestId}'
    `;
  } else {
    practicalTestQuery = `
      INSERT INTO hr_schema.practical_test_table
      (
        practical_test_id,
        practical_test_label,
        practical_test_passing_score,
        practical_test_created_by,
        practical_test_team_id
      )
      VALUES
      (
        '${practicalTestId}',
        '${practical_test_label.trim()}',
        ${practical_test_passing_score},
        '${teamMemberId}',
        '${teamId}'
      )
    `;
  }

  const practicalTestPositionList: string[] = [];
  const positionList: string[] = [];
  practical_test_position_list.forEach((position) => {
    practicalTestPositionList.push(`('${practicalTestId}', '${position}')`);
    positionList.push(`'${position}'`);
  });

  const practicalTestPositionInput = practicalTestPositionList.join(", ");

  const fieldList: string[] = [];
  const practicalTestQuestionList: string[] = [];

  practical_test_question_list.forEach((question, index) => {
    const fieldId = uuidv4();
    fieldList.push(
      `('${fieldId}', '${question.practical_test_question.trim()}', true, 'NUMBER', ${
        index + 1
      }, 'ebda2641-77c2-4d0b-a117-84daadd5eb27')`
    );
    practicalTestQuestionList.push(
      `('${question.practical_test_question.trim()}', ${
        question.practical_test_question_weight
      }, ${index + 1}, '${fieldId}', '${practicalTestId}')`
    );
  });

  const fieldInput = fieldList.join(", ");
  const practicalTestQuestionInput = practicalTestQuestionList.join(", ");

  const { error } = await supabaseClient.rpc("create_practical_test_form", {
    input_data: {
      practicalTestQuery,
      practicalTestPositionInput,
      fieldInput,
      practicalTestQuestionInput,
      practicalTestId: isEdit ? practicalTestId : "",
      positionList: positionList.join(", "),
    },
  });
  if (error) throw error;
};

export const sendRequestToJoinTeam = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    teamId: string;
    userId: string;
  }
) => {
  const { teamId, userId } = params;
  const { count, error: checkIfUserIsMemberError } = await supabaseClient
    .schema("team_schema")
    .from("team_member_table")
    .select("*", { count: "exact", head: true })
    .eq("team_member_user_id", userId)
    .eq("team_member_team_id", teamId);
  if (checkIfUserIsMemberError) throw checkIfUserIsMemberError;

  if (Number(count)) throw Error("Member already exists");

  const { data, error } = await supabaseClient
    .schema("team_schema")
    .from("team_membership_request_table")
    .insert({
      team_membership_request_to_team_id: teamId,
      team_membership_request_from_user_id: userId,
    })
    .select("*");

  if (error) throw error;

  return data[0];
};

export const acceptTeamMembershipRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    userIdList: string[];
    teamId: string;
    memberRole: string;
  }
) => {
  const { error } = await supabaseClient.rpc("accept_team_member_request", {
    input_data: params,
  });
  if (error) throw error;
};

export const joinTeamGroupByTicketRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    groupList: string;
    teamMemberId: string;
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "join_team_group_by_ticket_request",
    {
      input_data: params,
    }
  );
  if (error) throw error;
  return data;
};

export const joinTeamProjectByTicketRequest = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    projectList: string;
    teamMemberId: string;
    teamId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "join_team_project_by_ticket_request",
    {
      input_data: params,
    }
  );
  if (error) throw error;
  return data;
};

export const insertUpdateHrPreferredPosition = async (
  supabaseClient: SupabaseClient<Database>,
  params: {
    positionData: string[];
    memberId: string;
  }
) => {
  console.log(params);

  const { data, error } = await supabaseClient.rpc(
    "insert_update_hr_preferred_position",
    {
      input_data: params,
    }
  );
  if (error) throw error;
  return data;
};
