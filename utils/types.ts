import { Database } from "@/utils/database";

// Start: Database Table Types
export type AttachmentTableRow =
  Database["public"]["Tables"]["attachment_table"]["Row"];
export type AttachmentTableInsert =
  Database["public"]["Tables"]["attachment_table"]["Insert"];
export type AttachmentTableUpdate =
  Database["public"]["Tables"]["attachment_table"]["Update"];

export type CommentTableRow =
  Database["public"]["Tables"]["comment_table"]["Row"];
export type CommentTableInsert =
  Database["public"]["Tables"]["comment_table"]["Insert"];
export type CommentTableUpdate =
  Database["public"]["Tables"]["comment_table"]["Update"];

export type FieldTableRow = Database["public"]["Tables"]["field_table"]["Row"];
export type FieldTableInsert =
  Database["public"]["Tables"]["field_table"]["Insert"];
export type FieldTableUpdate =
  Database["public"]["Tables"]["field_table"]["Update"];

export type FormTableRow = Database["public"]["Tables"]["form_table"]["Row"];
export type FormTableInsert =
  Database["public"]["Tables"]["form_table"]["Insert"];
export type FormTableUpdate =
  Database["public"]["Tables"]["form_table"]["Update"];

export type InvitationTableRow =
  Database["public"]["Tables"]["invitation_table"]["Row"];
export type InvitationTableInsert =
  Database["public"]["Tables"]["invitation_table"]["Insert"];
export type InvitationTableUpdate =
  Database["public"]["Tables"]["invitation_table"]["Update"];

export type NotificationTableRow =
  Database["public"]["Tables"]["notification_table"]["Row"];
export type NotificationTableInsert =
  Database["public"]["Tables"]["notification_table"]["Insert"];
export type NotificationTableUpdate =
  Database["public"]["Tables"]["notification_table"]["Update"];

export type OptionTableRow =
  Database["public"]["Tables"]["option_table"]["Row"];
export type OptionTableInsert =
  Database["public"]["Tables"]["option_table"]["Insert"];
export type OptionTableUpdate =
  Database["public"]["Tables"]["option_table"]["Update"];

export type RequestResponseTableRow =
  Database["public"]["Tables"]["request_response_table"]["Row"];
export type RequestResponseTableInsert =
  Database["public"]["Tables"]["request_response_table"]["Insert"];
export type RequestResponseTableUpdate =
  Database["public"]["Tables"]["request_response_table"]["Update"];

export type RequestSignerTableRow =
  Database["public"]["Tables"]["request_signer_table"]["Row"];
export type RequestSignerTableInsert =
  Database["public"]["Tables"]["request_signer_table"]["Insert"];
export type RequestSignerTableUpdate =
  Database["public"]["Tables"]["request_signer_table"]["Update"];

export type RequestTableRow =
  Database["public"]["Tables"]["request_table"]["Row"];
export type RequestTableInsert =
  Database["public"]["Tables"]["request_table"]["Insert"];
export type RequestTableUpdate =
  Database["public"]["Tables"]["request_table"]["Update"];

export type SectionTableRow =
  Database["public"]["Tables"]["section_table"]["Row"];
export type SectionTableInsert =
  Database["public"]["Tables"]["section_table"]["Insert"];
export type SectionTableUpdate =
  Database["public"]["Tables"]["section_table"]["Update"];

export type SignerTableRow =
  Database["public"]["Tables"]["signer_table"]["Row"];
export type SignerTableInsert =
  Database["public"]["Tables"]["signer_table"]["Insert"];
export type SignerTableUpdate =
  Database["public"]["Tables"]["signer_table"]["Update"];

export type TeamMemberTableRow =
  Database["public"]["Tables"]["team_member_table"]["Row"];
export type TeamMemberTableInsert =
  Database["public"]["Tables"]["team_member_table"]["Insert"];
export type TeamMemberTableUpdate =
  Database["public"]["Tables"]["team_member_table"]["Update"];

export type TeamTableRow = Database["public"]["Tables"]["team_table"]["Row"];
export type TeamTableInsert =
  Database["public"]["Tables"]["team_table"]["Insert"];
export type TeamTableUpdate =
  Database["public"]["Tables"]["team_table"]["Update"];

export type UserTableRow = Database["public"]["Tables"]["user_table"]["Row"];
export type UserTableInsert =
  Database["public"]["Tables"]["user_table"]["Insert"];
export type UserTableUpdate =
  Database["public"]["Tables"]["user_table"]["Update"];

export type ItemTableRow = Database["public"]["Tables"]["item_table"]["Row"];
export type ItemTableInsert =
  Database["public"]["Tables"]["item_table"]["Insert"];
export type ItemTableUpdate =
  Database["public"]["Tables"]["item_table"]["Update"];

export type ItemDescriptionTableRow =
  Database["public"]["Tables"]["item_description_table"]["Row"];
export type ItemDescriptionTableInsert =
  Database["public"]["Tables"]["item_description_table"]["Insert"];
export type ItemDescriptionTableUpdate =
  Database["public"]["Tables"]["item_description_table"]["Update"];

export type ItemDescriptionFieldTableRow =
  Database["public"]["Tables"]["item_description_field_table"]["Row"];
export type ItemDescriptionFieldTableInsert =
  Database["public"]["Tables"]["item_description_field_table"]["Insert"];
export type ItemDescriptionFieldTableUpdate =
  Database["public"]["Tables"]["item_description_field_table"]["Update"];

export type ItemDescriptionFieldUOMTableRow =
  Database["public"]["Tables"]["item_description_field_uom_table"]["Row"];
export type ItemDescriptionFieldUOMTableInsert =
  Database["public"]["Tables"]["item_description_field_uom_table"]["Insert"];
export type ItemDescriptionFieldUOMTableUpdate =
  Database["public"]["Tables"]["item_description_field_uom_table"]["Update"];

export type SupplierTableRow =
  Database["public"]["Tables"]["supplier_table"]["Row"];
export type SupplierTableInsert =
  Database["public"]["Tables"]["supplier_table"]["Insert"];
export type SupplierTableUpdate =
  Database["public"]["Tables"]["supplier_table"]["Update"];

export type TeamGroupTableRow =
  Database["public"]["Tables"]["team_group_table"]["Row"];
export type TeamGroupTableInsert =
  Database["public"]["Tables"]["team_group_table"]["Insert"];
export type TeamGroupTableUpdate =
  Database["public"]["Tables"]["team_group_table"]["Update"];

export type TeamProjectTableRow =
  Database["public"]["Tables"]["team_project_table"]["Row"];
export type TeamProjectTableInsert =
  Database["public"]["Tables"]["team_project_table"]["Insert"];
export type TeamProjectTableUpdate =
  Database["public"]["Tables"]["team_project_table"]["Update"];

export type CSICodeTableRow =
  Database["public"]["Tables"]["csi_code_table"]["Row"];
export type CSICodeTableInsert =
  Database["public"]["Tables"]["csi_code_table"]["Insert"];
export type CSICodeTableUpdate =
  Database["public"]["Tables"]["csi_code_table"]["Update"];

export type ServiceTableRow =
  Database["public"]["Tables"]["service_table"]["Row"];
export type ServiceTableInsert =
  Database["public"]["Tables"]["service_table"]["Insert"];
export type ServiceTableUpdate =
  Database["public"]["Tables"]["service_table"]["Update"];

export type ServiceScopeTableRow =
  Database["public"]["Tables"]["service_scope_table"]["Row"];
export type ServiceScopeTableInsert =
  Database["public"]["Tables"]["service_scope_table"]["Insert"];
export type ServiceScopeTableUpdate =
  Database["public"]["Tables"]["service_scope_table"]["Update"];

export type ServiceScopeChoiceTableRow =
  Database["public"]["Tables"]["service_scope_choice_table"]["Row"];
export type ServiceScopeChoiceTableInsert =
  Database["public"]["Tables"]["service_scope_choice_table"]["Insert"];
export type ServiceScopeChoiceTableUpdate =
  Database["public"]["Tables"]["service_scope_choice_table"]["Update"];

export type TicketTableRow =
  Database["public"]["Tables"]["ticket_table"]["Row"];
export type TicketTableInsert =
  Database["public"]["Tables"]["ticket_table"]["Insert"];
export type TicketTableUpdate =
  Database["public"]["Tables"]["ticket_table"]["Update"];

export type TicketCommentTableRow =
  Database["public"]["Tables"]["ticket_comment_table"]["Row"];
export type TicketCommentTableInsert =
  Database["public"]["Tables"]["ticket_comment_table"]["Insert"];
export type TicketCommentTableUpdate =
  Database["public"]["Tables"]["ticket_comment_table"]["Update"];

export type ServiceCategoryTableRow =
  Database["public"]["Tables"]["service_category_table"]["Row"];
export type ServiceCategoryTableInsert =
  Database["public"]["Tables"]["service_category_table"]["Insert"];
export type ServiceCategoryTableUpdate =
  Database["public"]["Tables"]["service_category_table"]["Update"];

export type EquipmentTableRow =
  Database["public"]["Tables"]["equipment_table"]["Row"];
export type EquipmentTableInsert =
  Database["public"]["Tables"]["equipment_table"]["Insert"];
export type EquipmentTableUpdate =
  Database["public"]["Tables"]["equipment_table"]["Update"];

export type EquipmentDescriptionTableRow =
  Database["public"]["Tables"]["equipment_description_table"]["Row"];
export type EquipmentDescriptionTableInsert =
  Database["public"]["Tables"]["equipment_description_table"]["Insert"];
export type EquipmentDescriptionTableUpdate =
  Database["public"]["Tables"]["equipment_description_table"]["Update"];

export type EquipmentPartTableRow =
  Database["public"]["Tables"]["equipment_part_table"]["Row"];
export type EquipmentPartTableInsert =
  Database["public"]["Tables"]["equipment_part_table"]["Insert"];
export type EquipmentPartTableUpdate =
  Database["public"]["Tables"]["equipment_part_table"]["Update"];

export type EquipmentCategoryTableRow =
  Database["public"]["Tables"]["equipment_category_table"]["Row"];
export type EquipmentCategoryTableInsert =
  Database["public"]["Tables"]["equipment_category_table"]["Insert"];
export type EquipmentCategoryTableUpdate =
  Database["public"]["Tables"]["equipment_category_table"]["Update"];

export type EquipmentBrandTableRow =
  Database["public"]["Tables"]["equipment_brand_table"]["Row"];
export type EquipmentBrandTableInsert =
  Database["public"]["Tables"]["equipment_brand_table"]["Insert"];
export type EquipmentBrandTableUpdate =
  Database["public"]["Tables"]["equipment_brand_table"]["Update"];

export type EquipmentModelTableRow =
  Database["public"]["Tables"]["equipment_model_table"]["Row"];
export type EquipmentModelTableInsert =
  Database["public"]["Tables"]["equipment_model_table"]["Insert"];
export type EquipmentModelTableUpdate =
  Database["public"]["Tables"]["equipment_model_table"]["Update"];

export type EquipmentUnitOfMeasurementTableRow =
  Database["public"]["Tables"]["equipment_unit_of_measurement_table"]["Row"];
export type EquipmentUnitOfMeasurementTableInsert =
  Database["public"]["Tables"]["equipment_brand_table"]["Insert"];
export type EquipmentUnitOfMeasurementTableUpdate =
  Database["public"]["Tables"]["equipment_unit_of_measurement_table"]["Update"];

export type EquipmentComponentCategoryTableRow =
  Database["public"]["Tables"]["equipment_component_category_table"]["Row"];
export type EquipmentComponentCategoryTableInsert =
  Database["public"]["Tables"]["equipment_component_category_table"]["Insert"];
export type EquipmentComponentCategoryTableUpdate =
  Database["public"]["Tables"]["equipment_component_category_table"]["Update"];

export type MemoTableRow = Database["public"]["Tables"]["memo_table"]["Row"];
export type MemoTableInsert =
  Database["public"]["Tables"]["memo_table"]["Insert"];
export type MemoTableUpdate =
  Database["public"]["Tables"]["memo_table"]["Update"];

export type MemoSignerTableRow =
  Database["public"]["Tables"]["memo_signer_table"]["Row"];
export type MemoSignerTableInsert =
  Database["public"]["Tables"]["memo_signer_table"]["Insert"];
export type MemoSignerTableUpdate =
  Database["public"]["Tables"]["memo_signer_table"]["Update"];

export type MemoLineItemTableRow =
  Database["public"]["Tables"]["memo_line_item_table"]["Row"];
export type MemoLineItemTableInsert =
  Database["public"]["Tables"]["memo_line_item_table"]["Insert"];
export type MemoLineItemTableUpdate =
  Database["public"]["Tables"]["memo_line_item_table"]["Update"];

export type MemoLineItemAttachmentTableRow =
  Database["public"]["Tables"]["memo_line_item_attachment_table"]["Row"];
export type MemoLineItemAttachmentTableInsert =
  Database["public"]["Tables"]["memo_line_item_attachment_table"]["Insert"];
export type MemoLineItemAttachmentTableUpdate =
  Database["public"]["Tables"]["memo_line_item_attachment_table"]["Update"];

export type MemoReadReceiptTableRow =
  Database["public"]["Tables"]["memo_read_receipt_table"]["Row"];
export type MemoReadReceiptTableInsert =
  Database["public"]["Tables"]["memo_read_receipt_table"]["Insert"];
export type MemoReadReceiptTableUpdate =
  Database["public"]["Tables"]["memo_read_receipt_table"]["Update"];

export type MemoAgreementTableRow =
  Database["public"]["Tables"]["memo_agreement_table"]["Row"];
export type MemoAgreementTableInsert =
  Database["public"]["Tables"]["memo_agreement_table"]["Insert"];
export type MemoAgreementTableUpdate =
  Database["public"]["Tables"]["memo_agreement_table"]["Update"];
export type OtherExpensesTypeTableRow =
  Database["public"]["Tables"]["other_expenses_type_table"]["Row"];
export type OtherExpensesTypeTableInsert =
  Database["public"]["Tables"]["other_expenses_type_table"]["Insert"];
export type OtherExpensesTypeTableUpdate =
  Database["public"]["Tables"]["other_expenses_type_table"]["Update"];

export type SignatureHistoryTableRow =
  Database["public"]["Tables"]["signature_history_table"]["Row"];
export type UserValidIDTableRow =
  Database["public"]["Tables"]["user_valid_id_table"]["Row"];
export type UserValidIDTableInsert =
  Database["public"]["Tables"]["user_valid_id_table"]["Insert"];
export type UserValidIDTableUpdate =
  Database["public"]["Tables"]["user_valid_id_table"]["Update"];

export type MemoFormatTableRow =
  Database["public"]["Tables"]["memo_format_section_table"]["Row"];
export type MemoFormatTableInsert =
  Database["public"]["Tables"]["memo_format_section_table"]["Insert"];
export type MemoFormatTableUpdate =
  Database["public"]["Tables"]["memo_format_section_table"]["Update"];

export type MemoFormatSubsectionTableRow =
  Database["public"]["Tables"]["memo_format_subsection_table"]["Row"];
export type MemoFormatSubsectionTableInsert =
  Database["public"]["Tables"]["memo_format_subsection_table"]["Insert"];
export type MemoFormatSubsectionTableUpdate =
  Database["public"]["Tables"]["memo_format_subsection_table"]["Update"];

export type MemoFormatAttachmentTableRow =
  Database["public"]["Tables"]["memo_format_attachment_table"]["Row"];
export type MemoFormatAttachmentTableInsert =
  Database["public"]["Tables"]["memo_format_attachment_table"]["Insert"];
export type MemoFormatAttachmentTableUpdate =
  Database["public"]["Tables"]["memo_format_attachment_table"]["Update"];

export type QueryTableRow = Database["public"]["Tables"]["query_table"]["Row"];

export type FormSLATableRow =
  Database["public"]["Tables"]["form_sla_table"]["Row"];
export type FormSLATableInsert =
  Database["public"]["Tables"]["form_sla_table"]["Insert"];
export type FormSLATableUpdate =
  Database["public"]["Tables"]["form_sla_table"]["Update"];

export type TicketCategoryTableRow =
  Database["public"]["Tables"]["ticket_category_table"]["Row"];
export type TicketCategoryTableInsert =
  Database["public"]["Tables"]["ticket_category_table"]["Insert"];
export type TicketCategoryTableUpdate =
  Database["public"]["Tables"]["ticket_category_table"]["Update"];

export type TicketSectionTableRow =
  Database["public"]["Tables"]["ticket_section_table"]["Row"];
export type TicketSectionTableInsert =
  Database["public"]["Tables"]["ticket_section_table"]["Insert"];
export type TicketSectionTableUpdate =
  Database["public"]["Tables"]["ticket_section_table"]["Update"];

export type TicketFieldTableRow =
  Database["public"]["Tables"]["ticket_field_table"]["Row"];
export type TicketFieldTableInsert =
  Database["public"]["Tables"]["ticket_field_table"]["Insert"];
export type TicketFieldTableUpdate =
  Database["public"]["Tables"]["ticket_field_table"]["Update"];

export type TicketOptionTableRow =
  Database["public"]["Tables"]["ticket_option_table"]["Row"];
export type TicketOptionTableInsert =
  Database["public"]["Tables"]["ticket_option_table"]["Insert"];
export type TicketOptionTableUpdate =
  Database["public"]["Tables"]["ticket_option_table"]["Update"];

export type TicketResponseTableRow =
  Database["public"]["Tables"]["ticket_response_table"]["Row"];
export type TicketResponseTableInsert =
  Database["public"]["Tables"]["ticket_response_table"]["Insert"];
export type TicketResponseTableUpdate =
  Database["public"]["Tables"]["ticket_response_table"]["Update"];

export type AddressTableRow =
  Database["public"]["Tables"]["address_table"]["Row"];
export type AddressTableInsert =
  Database["public"]["Tables"]["address_table"]["Insert"];
export type AddressTableUpdate =
  Database["public"]["Tables"]["address_table"]["Update"];

export type RequestViewTableRow =
  Database["public"]["Views"]["request_view"]["Row"];

export type JiraProjectTableRow =
  Database["public"]["Tables"]["jira_project_table"]["Row"];
export type JiraProjectTableInsert =
  Database["public"]["Tables"]["jira_project_table"]["Insert"];
export type JiraProjectTableUpdate =
  Database["public"]["Tables"]["jira_project_table"]["Update"];

export type JiraFormslyProjectTableRow =
  Database["public"]["Tables"]["jira_formsly_project_table"]["Row"];
export type JiraFormslyProjectTableInsert =
  Database["public"]["Tables"]["jira_formsly_project_table"]["Insert"];
export type JiraFormslyProjectTableUpdate =
  Database["public"]["Tables"]["jira_formsly_project_table"]["Update"];

export type JiraUserAccountTableRow =
  Database["public"]["Tables"]["jira_user_account_table"]["Row"];
export type JiraUserAccountTableInsert =
  Database["public"]["Tables"]["jira_user_account_table"]["Insert"];
export type JiraUserAccountTableUpdate =
  Database["public"]["Tables"]["jira_user_account_table"]["Update"];

export type JiraUserRoleTableRow =
  Database["public"]["Tables"]["jira_user_role_table"]["Row"];
export type JiraUserRoleTableInsert =
  Database["public"]["Tables"]["jira_user_role_table"]["Insert"];
export type JiraUserRoleTableUpdate =
  Database["public"]["Tables"]["jira_user_role_table"]["Update"];

export type JiraProjectUserTableRow =
  Database["public"]["Tables"]["jira_project_user_table"]["Row"];
export type JiraProjectUserTableInsert =
  Database["public"]["Tables"]["jira_project_user_table"]["Insert"];
export type JiraProjectUserTableUpdate =
  Database["public"]["Tables"]["jira_project_user_table"]["Update"];

export type JiraItemCategoryTableRow =
  Database["public"]["Tables"]["jira_item_category_table"]["Row"];
export type JiraItemCategoryTableInsert =
  Database["public"]["Tables"]["jira_item_category_table"]["Insert"];
export type JiraItemCategoryTableUpdate =
  Database["public"]["Tables"]["jira_item_category_table"]["Update"];

export type JiraItemCategoryUserTableRow =
  Database["public"]["Tables"]["jira_item_user_table"]["Row"];
export type JiraItemCategoryUserTableInsert =
  Database["public"]["Tables"]["jira_item_user_table"]["Insert"];
export type JiraItemCategoryUserTableUpdate =
  Database["public"]["Tables"]["jira_item_user_table"]["Update"];

export type ItemCategoryTableRow =
  Database["public"]["Tables"]["item_category_table"]["Row"];
export type ItemCategoryTableInsert =
  Database["public"]["Tables"]["item_category_table"]["Insert"];
export type ItemCategoryTableUpdate =
  Database["public"]["Tables"]["item_category_table"]["Update"];

// End: Database Table Types

// Start: Database Enums
export type AppType = "GENERAL" | "REQUEST" | "REVIEW";
export type MemberRoleType = "OWNER" | "APPROVER" | "MEMBER" | "ADMIN";
export type AttachmentBucketType =
  | "USER_AVATARS"
  | "USER_SIGNATURES"
  | "USER_VALID_IDS"
  | "TEAM_LOGOS"
  | "COMMENT_ATTACHMENTS"
  | "REQUEST_ATTACHMENTS"
  | "MEMO_ATTACHMENTS"
  | "TEAM_PROJECT_ATTACHMENTS"
  | "TICKET_ATTACHMENTS";
export type ReceiverStatusType = "PENDING" | "APPROVED" | "REJECTED";
export type FormStatusType = ReceiverStatusType | "CANCELED";
export type TicketStatusType =
  | "PENDING"
  | "UNDER REVIEW"
  | "INCORRECT"
  | "CLOSED";
export type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "SWITCH"
  | "DROPDOWN"
  | "MULTISELECT"
  | "FILE"
  | "DATE"
  | "TIME"
  | "LINK";
// | "SLIDER";
export type FieldTagType =
  | "POSITIVE_METRIC"
  | "NEGATIVE_METRIC"
  | "SUBMISSION_FORM_TITLE"
  | "SUBMISSION_FORM_DESCRIPTION"
  | "REVIEW_GENERAL_COMMENT"
  | "DUPLICATABLE_SECTION";
export type CommentType =
  | "ACTION_APPROVED"
  | "ACTION_REJECTED"
  | "REQUEST_CANCELED"
  // | "REQUEST_UNDO"
  | "REQUEST_COMMENT"
  // | "REQUEST_CREATED"
  | "REVIEW_CREATED"
  | "REVIEW_COMMENT"
  | "ACTION_REVERSED";
export type NotificationType =
  | "REQUEST"
  | "APPROVE"
  | "REJECT"
  | "INVITE"
  | "REVIEW"
  | "COMMENT"
  | "REVERSAL";
export type InvitationStatusType = "ACCEPTED" | "DECLINED" | "PENDING";
// End: Database Enums

// Start: Joined Types
export type RequestType = {
  request_id: string;
  request_date_created: string;
  request_status: FormStatusType;
  request_team_member: {
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_avatar: string | null;
    };
  };
  request_form: {
    form_id: string;
    form_name: string;
    form_description: string;
  };
  request_signer: {
    request_signer_id: string;
    request_signer_status: ReceiverStatusType;
    request_signer: {
      signer_is_primary_signer: boolean;
      signer_team_member: {
        team_member_user: {
          user_id: string;
          user_first_name: string;
          user_last_name: string;
          user_avatar: string | null;
        };
      };
    };
  }[];
};

export type UserWithSignatureType = UserTableRow & {
  user_employee_number: string;
} & {
  user_signature_attachment: AttachmentTableRow;
};

export type RequestWithResponseType = RequestTableRow & {
  request_formsly_id: string;
} & {
  request_form: {
    form_id: string;
    form_name: string;
    form_description: string;
    form_is_formsly_form: boolean;
    form_type?: string;
    form_sub_type?: string;
    form_section: (SectionTableRow & {
      section_field: (FieldTableRow & {
        field_section_duplicatable_id?: string;
        field_option: OptionTableRow[];
        field_response: RequestResponseTableRow[];
      } & {
        field_options?: OptionTableRow[] | null;
      })[];
    })[];
  };
} & {
  request_team_member: {
    team_member_team_id: string;
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_username: string;
      user_avatar: string;
      user_job_title: string;
    };
  };
} & {
  request_signer: (RequestSignerTableRow & {
    request_signer_id: string;
    request_signer_status: string;
    request_signer_signer: {
      signer_id: string;
      signer_is_primary_signer: boolean;
      signer_action: string;
      signer_order: number;
      signer_team_member: {
        team_member_id: string;
        team_member_user: {
          user_id: string;
          user_first_name: string;
          user_last_name: string;
          user_job_title: string | null;
          user_signature_attachment_id: string | null;
        };
      };
    };
  })[];
} & {
  request_comment: {
    comment_id: string;
    comment_date_created: string;
    comment_content: string;
    comment_is_edited: boolean;
    comment_last_updated: string;
    comment_type: CommentType;
    comment_team_member_id: string;
    comment_team_member: {
      team_member_user: {
        user_id: string;
        user_first_name: string;
        user_last_name: string;
        user_username: string;
        user_avatar: string;
      };
    };
    comment_attachment: CommentAttachmentWithPublicUrl;
  }[];
} & {
  request_project: {
    team_project_name: string;
    team_project_id: string;
  };
};

export type TeamMemberType = {
  team_member_id: string;
  team_member_role: MemberRoleType;
  team_member_date_created: string;
  team_member_user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_avatar: string;
    user_email: string;
    user_employee_number: string;
  };
};

export type FormWithOwnerType = FormTableRow & {
  form_team_member: TeamMemberTableRow & {
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_avatar: string;
    };
  };
};

export type TeamMemberWithUserType = {
  team_member_id: string;
  team_member_role: string;
  team_member_user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
  };
};

export type FormType = {
  form_id: string;
  form_name: string;
  form_description: string;
  form_date_created: string;
  form_is_hidden: boolean;
  form_is_formsly_form: boolean;
  form_is_for_every_member: boolean;
  form_type?: string;
  form_sub_type?: string;
  form_team_member: {
    team_member_id: string;
    team_member_user: {
      user_id: string;
      user_username: string;
      user_first_name: string;
      user_last_name: string;
      user_avatar: string;
    };
  };
  form_signer: {
    signer_id: string;
    signer_is_primary_signer: boolean;
    signer_action: string;
    signer_order: number;
    signer_team_member: {
      team_member_id: string;
      team_member_user: {
        user_id: string;
        user_first_name: string;
        user_last_name: string;
        user_avatar: string;
      };
    };
  }[];
  form_section: (SectionTableRow & {
    section_field: (FieldTableRow & {
      field_option: OptionTableRow[];
    })[];
  })[];
  form_team_group: {
    team_group: {
      team_group_id: string;
      team_group_is_disabled: boolean;
      team_group_name: string;
    };
  }[];
};

export type FormWithResponseType = {
  form_id: string;
  form_name: string;
  form_description: string;
  form_date_created: string;
  form_is_hidden: boolean;
  form_is_formsly_form: boolean;
  form_is_for_every_member: boolean;
  form_type?: string;
  form_sub_type?: string;
  form_team_member: {
    team_member_id: string;
    team_member_user: {
      user_id: string;
      user_username: string;
      user_first_name: string;
      user_last_name: string;
      user_avatar: string;
    };
  };
  form_signer: {
    signer_id: string;
    signer_is_primary_signer: boolean;
    signer_action: string;
    signer_order: number;
    signer_team_member: {
      team_member_id: string;
      team_member_user: {
        user_id: string;
        user_first_name: string;
        user_last_name: string;
        user_avatar: string;
      };
    };
  }[];
  form_section: (SectionTableRow & {
    section_field: (FieldTableRow & {
      field_section_duplicatable_id?: string;
    } & {
      field_option: OptionTableRow[];
      field_response?: unknown;
    })[];
  })[];
  form_team_group: {
    team_group: {
      team_group_id: string;
      team_group_is_disabled: boolean;
      team_group_name: string;
    };
  }[];
};

export type FormWithTeamMember = FormTableRow & {
  form_team_member: TeamMemberTableRow[];
};

export type ItemWithDescriptionType = ItemTableRow & {
  item_division_id_list: string[];
  item_level_three_description?: string;
} & {
  item_description: ItemDescriptionTableRow[];
};

export type ServiceWithScopeType = ServiceTableRow & {
  service_scope: ServiceScopeTableRow[];
};

export type ItemForm = {
  generalName: string;
  descriptions: {
    description: string;
    withUoM: boolean;
    descriptionId?: string;
    fieldId?: string;
    order?: number;
  }[];
  unit: string;
  isAvailable: boolean;
  glAccount: string;
  division: string[];
  divisionDescription: string;
  isPedItem: boolean;
  itemCategory: string;
};

export type ItemCategoryForm = {
  category: string;
  signer: string;
};

export type ServiceForm = {
  name: string;
  scope: { name: string; type: FieldType; isWithOther: boolean }[];
  isAvailable: boolean;
};
export type ServiceScopeChoiceForm = {
  name: string;
  isAvailable: boolean;
};

export type ServiceWithScopeAndChoice = ServiceTableRow & {
  service_scope: (ServiceScopeChoiceTableRow & {
    service_scope_choice: ServiceScopeChoiceTableRow[];
    service_field: FieldTableRow;
  })[];
};

export type ItemDescriptionFieldForm = {
  value: string;
  unitOfMeasurement: string;
  isAvailable: boolean;
};
export type SectionWithField = {
  fields: FieldWithChoices[];
} & SectionTableRow;

export type FieldWithChoices = {
  options: OptionTableRow[];
} & FieldTableRow;

export type ItemWithDescriptionAndField = ItemTableRow & {
  item_division_id_list: string[];
} & {
  item_description: (ItemDescriptionTableRow & {
    item_description_field: (ItemDescriptionFieldTableRow & {
      item_description_field_uom: {
        item_description_field_uom: string | null;
      }[];
    })[];
    item_field: FieldTableRow;
  })[];
  item_level_three_description?: string;
} & ItemCategoryType;

export type InvitationWithTeam = InvitationTableRow & {
  invitation_from_team_member: TeamMemberTableRow & {
    team_member_team: TeamTableRow;
  };
};

export type RequestByFormType = RequestTableRow & {
  request_form: {
    form_id: string;
    form_name: string;
    form_description: string;
    form_is_formsly_form: boolean;
    form_section: (SectionTableRow & {
      section_field: (FieldTableRow & {
        field_option: OptionTableRow[];
        field_response: (RequestResponseTableRow & {
          request_response_team_member_id?: string | null;
          request_response_request_status?: string;
        })[];
      })[];
    })[];
  };
} & {
  request_team_member: {
    team_member_id: string;
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_username: string;
      user_avatar: string;
    };
  };
};

export type RequestDashboardOverviewData = RequestTableRow & {
  request_form: {
    form_id: string;
    form_name: string;
    form_description: string;
    form_is_formsly_form: boolean;
  };
} & {
  request_team_member: {
    team_member_id: string;
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_username: string;
      user_avatar: string;
    };
  };
} & {
  request_signer: (RequestSignerTableRow & {
    request_signer_id: string;
    request_signer_status: string;
    request_signer_signer: {
      signer_id: string;
      signer_is_primary_signer: boolean;
      signer_action: string;
      signer_order: number;
      signer_team_member: {
        team_member_id: string;
        team_member_user: {
          user_first_name: string;
          user_last_name: string;
          user_avatar: string | null;
        };
      };
    };
  })[];
};

export type ConnectedFormsType = "Item" | "Invoice" | "Account Payable Voucher";

export type SearchKeywordResponseType = RequestResponseTableRow & {
  request_form: {
    request_id: string;
    request_form_id: string;
  };
} & { response_field: FieldTableRow };

export type FieldWithResponseType =
  RequestByFormType["request_form"]["form_section"][0]["section_field"];

export type ResponseDataType = {
  id: string;
  type: FieldType;
  label: string;
  optionList: string[];
  section_id?: string;
  responseList: {
    label: string;
    value: number;
    groupId?: string | null;
  }[];
};

export type LineChartDataType = {
  label: string;
  value: number;
};

export type PurchaseTrendChartDataType = {
  request_response_id: string;
  request_response: string;
  request_response_request_id: string;
  request_response_field_id: string;
  request_response_date_purchased?: string | undefined;
  request_response_team_member_id?: string | null;
  request_response_request_status?: string | null;
  request_response_item_general_name?: string;
};

export type RequestResponseDataType = {
  sectionLabel: string;
  responseData: FieldWithResponseType;
};
export type FormslyFormType = {
  Item: string[];
  Quotation: string[];
  "Receiving Inspecting Report": string[];
};

export type FormslyFormKeyType =
  | "Item"
  | "Quotation"
  | "Receiving Inspecting Report";

export type RequestSignerListType =
  RequestDashboardOverviewData["request_signer"][0]["request_signer_signer"] & {
    signerCount: {
      approved: number;
      rejected: number;
    };
  };
export type TeamGroupForFormType =
  | "Item"
  | "Quotation"
  | "Receiving Inspecting Report"
  | "Audit";

type SSOTRequestOwnerType = {
  user_first_name: string;
  user_last_name: string;
};

export type SSOTResponseType = {
  request_response: string;
  request_response_field_name: string;
  request_response_field_type: string;
  request_response_duplicatable_section_id: string;
};

export type SSOTType = {
  item_request_formsly_id: string;
  item_request_jira_id: string;
  item_request_otp_id: string;
  item_request_id: string;
  item_request_date_created: string;
  item_request_owner: SSOTRequestOwnerType;
  item_request_response: SSOTResponseType[];
  item_quotation_request: {
    quotation_request_id: string;
    quotation_request_formsly_id: string;
    quotation_request_date_created: string;
    quotation_request_owner: SSOTRequestOwnerType;
    quotation_request_response: SSOTResponseType[];
    quotation_rir_request: {
      rir_request_id: string;
      rir_request_formsly_id: string;
      rir_request_date_created: string;
      rir_request_owner: SSOTRequestOwnerType;
      rir_request_response: SSOTResponseType[];
    }[];
  }[];
  item_sourced_item_request: {
    sourced_item_request_id: string;
    sourced_item_request_formsly_id: string;
    sourced_item_request_date_created: string;
    sourced_item_request_owner: SSOTRequestOwnerType;
    sourced_item_request_response: SSOTResponseType[];
    sourced_item_ro_request: {
      ro_request_id: string;
      ro_request_formsly_id: string;
      ro_request_date_created: string;
      ro_request_owner: SSOTRequestOwnerType;
      ro_request_response: SSOTResponseType[];
      ro_transfer_receipt_request: {
        transfer_receipt_request_id: string;
        transfer_receipt_request_formsly_id: string;
        transfer_receipt_request_date_created: string;
        transfer_receipt_request_owner: SSOTRequestOwnerType;
        transfer_receipt_request_response: SSOTResponseType[];
      }[];
    }[];
  }[];
  item_cheque_reference_request: {
    cheque_reference_request_id: string;
    cheque_reference_request_formsly_id: string;
    cheque_reference_request_date_created: string;
    cheque_reference_request_response: SSOTResponseType[];
    cheque_reference_request_owner: SSOTRequestOwnerType;
  }[];
};

export type Section = SectionTableRow & {
  section_duplicatable_id?: string | null;
} & {
  section_field: (FieldTableRow & {
    field_option?: OptionTableRow[];
    field_response: RequestResponseTableRow[];
  })[];
};

// contains only 1 field_response per field
export type DuplicateSectionType = SectionTableRow & {
  section_duplicatable_id?: string | null;
} & {
  section_field: (FieldTableRow & {
    field_option?: OptionTableRow[];
    field_response: RequestResponseTableRow | null;
  })[];
};

export type CanvassType = Record<
  string,
  {
    quotationId: string;
    price: number;
    quantity: number;
  }[]
>;
export type CanvassLowestPriceType = Record<string, number>;
export type CanvassAdditionalDetailsType = {
  quotation_id: string;
  formsly_id: string;
  lead_time: number;
  payment_terms: string;
}[];

export type RequestProjectSignerStatusType = {
  signer_project_name: string;
  signer_status: ReceiverStatusType;
  signer_team_member_id: string;
}[];

export type RequestProjectSignerType = {
  request_signer_id: string;
  request_signer_status: string;
  request_signer_request_id: string;
  request_signer_signer_id: string;
  request_signer: {
    signer_id: string;
    signer_is_primary_signer: boolean;
    signer_action: string;
    signer_order: number;
    signer_is_disabled: boolean;
    signer_form_id: string;
    signer_team_member_id: string;
    signer_team_project_id: string;
    signer_team_project: { team_project_name: string };
  };
}[];

export type RequestListItemType = {
  request_id: string;
  request_formsly_id: string;
  request_date_created: string;
  request_status: string;
  request_jira_id?: string;
  request_jira_link?: string;
  request_otp_id?: string;
  request_form_id: string;
  request_team_member_id: string;
  request_signer: {
    request_signer_id: string;
    request_signer_status: string;
    request_signer: {
      signer_team_member_id: string;
      signer_is_primary_signer: boolean;
    };
  }[];
};

export type ConnectedRequestItemType = {
  request_id: string;
  request_formsly_id: string;
};

export type ConnectedRequestIdList = {
  [key: string]: ConnectedRequestItemType[];
};

export type ItemFieldsType = FieldTableRow & {
  field_option: OptionTableRow[];
} & { field_response: RequestResponseTableRow[] }[];

export type TeamMemberWithUserDetails = {
  team_member_id: string;
  team_member_user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_avatar: string | null;
    user_email: string;
  };
}[];

export type TeamMemberOnLoad = {
  member: TeamMemberTableRow & {
    team_member_user: UserTableRow & { user_employee_number: string };
  };
  userValidId: UserValidIDTableRow | undefined;
  groupList: {
    team_group_member_id: string;
    team_group: TeamGroupTableRow;
  }[];
  groupCount: number;
  projectList: {
    team_project_member_id: string;
    team_project: TeamProjectTableRow;
  }[];
  projectCount: number;
};

export type TeamOnLoad = {
  team: TeamTableRow;
  teamMembers: TeamMemberType[];
  teamGroups: TeamGroupTableRow[];
  teamProjects: TeamProjectTableRow[];
  teamGroupsCount: number;
  teamProjectsCount: number;
};

export type NotificationOnLoad = {
  notificationList: NotificationTableRow[];
  totalNotificationCount: number;
  tab: "all" | "unread";
};

export type SSOTOnLoad = {
  data: SSOTType[];
  projectNameList: string[];
  itemNameList: string[];
};

export type RequestListOnLoad = {
  requestList: RequestListItemType[];
  requestListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  formList: { label: string; value: string }[];
  isFormslyTeam: boolean;
};

export type CommentAttachmentWithPublicUrl = (AttachmentTableRow & {
  attachment_public_url: string;
})[];

export type RequestCommentType =
  RequestWithResponseType["request_comment"][0] & {
    comment_attachment: CommentAttachmentWithPublicUrl;
  };

export type RequestPageOnLoad = {
  request: RequestWithResponseType;
  connectedFormIdAndGroup: {
    formId: string;
    formIsForEveryone: boolean;
    formIsMember: boolean;
    formName: string;
  };
  connectedRequestIDList: ConnectedRequestIdList;
  connectedForm: {
    form_name: string;
    form_id: string;
    form_is_for_every_member: boolean;
    form_is_member: boolean;
  }[];
  canvassRequest?: string[];
  projectSignerStatus?: RequestProjectSignerStatusType;
};

export type CreateTicketPageOnLoad = {
  member: {
    team_member_id: string;
    team_member_role: MemberRoleType;
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_avatar: string | null;
      user_email: string;
    };
  };
  categoryList: TicketCategoryTableRow[];
};

export type TicketListType = ({
  ticket_requester: {
    team_member_id: string;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_avatar: string | null;
    user_email: string;
  };
  ticket_approver: {
    team_member_id: string;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_avatar: string | null;
    user_email: string;
  };
} & TicketTableRow & { ticket_category: string })[];

export type TicketType = {
  ticket_category: string;
  ticket_requester: CreateTicketPageOnLoad["member"];
  ticket_approver: CreateTicketPageOnLoad["member"] | null;
  ticket_comment: {
    ticket_comment_id: string;
    ticket_comment_content: string;
    ticket_comment_is_disabled: boolean;
    ticket_comment_is_edited: boolean;
    ticket_comment_type: string;
    ticket_comment_date_created: string;
    ticket_comment_last_updated: string | null;
    ticket_comment_ticket_id: string;
    ticket_comment_team_member_id: string;
    ticket_comment_team_member: {
      team_member_user: {
        user_id: string;
        user_first_name: string;
        user_last_name: string;
        user_username: string;
        user_avatar: string | null;
      };
    };
    ticket_comment_attachment: CommentAttachmentWithPublicUrl;
  }[];
} & TicketTableRow;

export type TicketPageOnLoad = {
  ticket: TicketType;
  user: CreateTicketPageOnLoad["member"];
  ticketForm: CreateTicketFormValues;
};

export type TicketCommentType =
  RequestWithResponseType["request_comment"][0] & {
    comment_attachment: CommentAttachmentWithPublicUrl;
  };

export type TicketListOnLoad = {
  ticketList: TicketListType[];
  ticketListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  ticketCategoryList: TicketCategoryTableRow[];
};

export type ApproverUnresolvedRequestCountType = {
  pendingRequestCount: number;
  approvedRequestCount: {
    total: number;
    withJiraId: number;
    withoutJiraId: number;
  };
};

export type EquipmentWithCategoryType = EquipmentTableRow & {
  equipment_category: string;
};

export type EquipmentForm = {
  name: string;
  category: string;
  isAvailable: boolean;
  shorthand: string;
};

export type EquipmentDescriptionType = EquipmentDescriptionTableRow & {
  equipment_description_brand: string;
  equipment_description_model: string;
};

export type EquipmentDescriptionForm = {
  propertyNumber: string;
  serialNumber: string;
  brand: string;
  model: string;
  isAvailable: boolean;
};

export type EquipmentPartType = EquipmentPartTableRow & {
  equipment_part_general_name: string;
  equipment_part_brand: string;
  equipment_part_model: string;
  equipment_part_unit_of_measurement: string;
  equipment_part_component_category: string;
};

export type EquipmentPartForm = {
  name: string;
  partNumber: string;
  brand: string;
  model: string;
  uom: string;
  category: string;
  isAvailable: boolean;
};

export type FormSegmentType = "Form Preview" | "Form Details" | "Form Lookup";

export type LookupForm = {
  value: string;
  isAvailable: boolean;
};

export type EquipmentLookupChoices =
  | "equipment_category"
  | "equipment_brand"
  | "equipment_model"
  | "equipment_unit_of_measurement"
  | "equipment_component_category";

export type LookupTable = {
  id: string;
  status: boolean;
  value: string;
};

export type EquipmentLookupTableUpdate =
  | EquipmentCategoryTableUpdate
  | EquipmentBrandTableUpdate
  | EquipmentModelTableUpdate
  | EquipmentUnitOfMeasurementTableUpdate
  | EquipmentComponentCategoryTableUpdate;

export type UserIssuedItem = {
  itemName: string;
  itemUom: string;
  itemQuantity: number;
  variation: {
    quantity: number;
    specification: {
      fieldName: string;
      response: string;
    }[];
  }[];
};

export type MemoSignerItem = {
  team_member_id: string;
  team_member_user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_job_title: string | null;
    user_avatar: string | null;
  };
  signer_signature_public_url: string;
};

export type MemoLineItem = {
  memo_line_item_content: string;
  memo_line_item_attachment?: File | Blob;
  memo_line_item_attachment_name?: string;
  memo_line_item_attachment_caption?: string;
};

export type MemoType = MemoTableRow & {
  memo_author_user: UserTableRow;
  memo_status: string;
  memo_date_updated: string;
} & {
  memo_signer_list: (MemoSignerTableRow & {
    memo_signer_team_member: {
      team_member_id: string;
      user: UserTableRow;
    };
    memo_signer_signature_public_url: string;
  })[];
} & {
  memo_line_item_list: (MemoLineItemTableRow & {
    memo_line_item_attachment?: MemoLineItemAttachmentTableRow;
  })[];
} & {
  memo_read_receipt_list: (MemoReadReceiptTableRow & {
    user_avatar: string;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_employee_number: string;
  })[];
} & {
  memo_agreement_list: (MemoAgreementTableRow & {
    user_avatar: string;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_employee_number: string;
  })[];
};

export type MemoListItemType = MemoTableRow & {
  memo_author_user: UserTableRow;
  memo_status: string;
  memo_date_updated: string;
} & { memo_signer_list: MemoType["memo_signer_list"] };

export type EditMemoType = MemoTableRow & {
  memo_author_user: UserTableRow;
  memo_status: string;
  memo_date_updated: string;
} & {
  memo_signer_list: (MemoSignerTableRow & {
    memo_signer_team_member?: {
      team_member_id: string;
      user: {
        user_first_name: string;
        user_last_name: string;
        user_avatar: string | null;
        user_job_title: string | null;
        user_id: string;
      };
    };
    memo_signer_signature_public_url: string;
  })[];
} & {
  memo_line_item_list: (MemoLineItemTableRow & {
    memo_line_item_attachment?: MemoLineItemAttachmentTableRow & {
      memo_line_item_attachment_file?: File;
    };
  })[];
} & {
  memo_read_receipt_list: (MemoReadReceiptTableRow & {
    user_avatar: string;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_employee_number: string;
  })[];
} & {
  memo_agreement_list: (MemoAgreementTableRow & {
    user_avatar: string;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_employee_number: string;
  })[];
};

export type ReferenceMemoType = MemoTableRow & {
  memo_author_user: UserTableRow;
} & {
  memo_signer_list: (MemoSignerTableRow & {
    memo_signer_team_member?: {
      team_member_id: string;
      user: {
        user_first_name: string;
        user_last_name: string;
        user_avatar: string | null;
        user_job_title: string | null;
        user_id: string;
      };
    };
    memo_signer_signature_public_url: string;
  })[];
} & {
  memo_line_item_list: (MemoLineItemTableRow & {
    memo_line_item_attachment?: MemoLineItemAttachmentTableRow & {
      memo_line_item_attachment_file?: File;
    };
  })[];
} & {
  memo_read_receipt_list: (MemoReadReceiptTableRow & {
    user_avatar: string;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_employee_number: string;
  })[];
} & {
  memo_agreement_list: (MemoAgreementTableRow & {
    user_avatar: string;
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_employee_number: string;
  })[];
};

export type OtherExpensesTypeWithCategoryType = OtherExpensesTypeTableRow & {
  other_expenses_category: string;
};

export type UserValidIdWithUser = Omit<
  UserValidIDTableRow,
  | "user_valid_id_user_id"
  | "user_valid_id_approver_user_id"
  | "user_valid_id_address_id"
> & {
  user_valid_id_user: UserTableRow;
  user_valid_id_approver_user: UserTableRow;
  user_valid_id_address: AddressTableRow;
};

export type TeamProjectWithAddressType = TeamProjectTableRow & {
  team_project_address: AddressTableRow;
};

export type OptionType = {
  label: string;
  value: string;
};

export type SignerRequestSLA = {
  request_id: string;
  request_date_created: string;
  formsly_id: string;
  request_signer_status_date_updated: string;
  time_difference: string;
  status: string;
};

export type SignerWithProfile = SignerTableRow & {
  signer_team_member: {
    team_member_user: UserTableRow;
  } & TeamMemberTableRow;
};

export type FormSLAWithForm = {
  form_table: FormTableRow;
} & FormSLATableRow;

export type TicketSection = TicketSectionTableRow & {
  field_section_duplicatable_id?: string;
  ticket_section_fields: (TicketFieldTableRow & {
    ticket_field_option: string[] | { label: string; value: string }[];
    ticket_field_response?: unknown;
    ticket_field_response_referrence?: unknown;
    ticket_field_response_id?: string;
    ticket_field_hidden?: boolean;
  })[];
};

export type CreateTicketFormValues = {
  ticket_sections: TicketSection[];
};

export type TeamMemberWithUser = TeamMemberTableRow & {
  team_member_user: UserTableRow;
};

export type IncidentReport = {
  interval: string;
  data: { date: string; report_count: number }[];
};

export type ItemDescriptionFieldWithUoM = {
  item_description_field_uom: { item_description_field_uom: string }[];
} & ItemDescriptionFieldTableRow;

export type RequestListItemSignerType = {
  request_signer_id: string;
  request_signer_status: string;
  request_signer: {
    signer_team_member_id: string;
    signer_is_primary_signer: boolean;
  };
  signer_team_member_user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
  };
};

export type ApproverDetailsType = {
  name: string;
  jobDescription: string | null;
  status: string;
  date: string | null;
  signature: string | null;
};

export type JiraFormslyProjectType = {
  team_project_id: string;
  team_project_name: string;
  assigned_jira_project: {
    jira_formsly_project_id: string;
    formsly_project_id: string;
    jira_project_id: string;
    jira_project: JiraProjectTableRow;
  } | null;
};

export type ProjectJiraUserAccountType = JiraProjectUserTableRow &
  JiraUserAccountTableRow &
  JiraUserRoleTableRow;

export type JiraItemUserTableData = {
  jira_item_user_id: string;
  jira_item_user_item_category_id: string;
  jira_item_user_account_id: {
    jira_user_account_jira_id: string;
    jira_user_account_display_name: string;
    jira_user_account_id: string;
  };
  jira_item_user_role_id: {
    jira_user_role_id: string;
    jira_user_role_label: string;
  };
};

export type JiraFormslyItemCategoryWithUserDataType =
  JiraItemCategoryTableRow & {
    assigned_jira_user: {
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
      jira_user_account_jira_id: string;
      jira_user_account_display_name: string;
      jira_user_account_id: string;
      jira_user_role_id: string;
      jira_user_role_label: string;
    } | null;
  };

export type JiraUserDataType = {
  jira_user_account_jira_id: string;
  jira_user_account_display_name: string;
  jira_user_role_label: string;
};

export type JiraProjectDataType = {
  team_project_id: string;
  team_project_name: string;
  jira_project_jira_id: string;
  jira_project_jira_label: string;
  jira_user_list: JiraUserDataType[];
};

export type JiraItemCategoryDataType = {
  jira_item_category_id: string;
  jira_item_category_jira_id: string;
  jira_item_category_jira_label: string;
  jira_item_category_formsly_label: string;
} & JiraUserDataType;

export type JiraTicketPayloadProps = {
  requestId: string;
  requestUrl: string;
  requestTypeId: string;
  jiraProjectSiteId: string;
  jiraItemCategoryId: string;
  warehouseCorporateLeadId: string;
  warehouseAreaLeadId: string;
  warehouseRepresentativeId: string;
  warehouseRequestParticipantIdList: string[];
  jiraItemCategoryLabel?: string;
};

export type JiraTicketData = {
  success: boolean;
  data: { jiraTicketKey: string; jiraTicketWebLink: string } | null;
};

export type ItemCategoryWithSigner = ItemCategoryTableRow & {
  item_category_signer: {
    signer_id: string;
    signer_team_member: {
      team_member_id: string;
      team_member_user: {
        user_id: string;
        user_first_name: string;
        user_last_name: string;
        user_avatar: string;
      };
    };
  };
};

export type ItemCategoryType = {
  item_category: {
    item_category_signer: {
      signer_id: string;
      signer_is_primary_signer: boolean;
      signer_action: string;
      signer_order: number;
      signer_team_member: {
        team_member_id: string;
        team_member_user: {
          user_id: string;
          user_first_name: string;
          user_last_name: string;
          user_avatar: string;
        };
      };
    };
  };
};

export type InitialFormType = FormTableRow & {
  form_team_member: {
    team_member_id: string;
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_avatar: string;
      user_username: string;
    };
  };
} & {
  form_team_group: {
    team_group: {
      team_group_id: string;
      team_group_name: string;
      team_group_is_disabled: boolean;
    };
  }[];
} & {
  form_signer: (SignerTableRow & {
    signer_team_member: {
      team_member_id: string;
      team_member_user: {
        user_id: string;
        user_first_name: string;
        user_last_name: string;
        user_avatar: string;
        user_username: string;
      };
    };
  })[];
};
