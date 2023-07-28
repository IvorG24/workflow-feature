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
export type ItemDescriptionableInsert =
  Database["public"]["Tables"]["item_description_table"]["Insert"];
export type ItemDescriptionTableUpdate =
  Database["public"]["Tables"]["item_description_table"]["Update"];

export type ItemDescriptionFieldTableRow =
  Database["public"]["Tables"]["item_description_field_table"]["Row"];
export type ItemDescriptionFieldTableInsert =
  Database["public"]["Tables"]["item_description_field_table"]["Insert"];
export type ItemDescriptionFieldTableUpdate =
  Database["public"]["Tables"]["item_description_field_table"]["Update"];

export type SupplierTableRow =
  Database["public"]["Tables"]["supplier_table"]["Row"];
export type SupplierTableInsert =
  Database["public"]["Tables"]["supplier_table"]["Insert"];
export type SupplierTableUpdate =
  Database["public"]["Tables"]["supplier_table"]["Update"];

// End: Database Table Types

// Start: Database Enums
export type AppType = "GENERAL" | "REQUEST" | "REVIEW";
export type MemberRoleType = "OWNER" | "ADMIN" | "MEMBER";
export type AttachmentBucketType =
  | "USER_AVATARS"
  | "USER_SIGNATURES"
  | "TEAM_LOGOS"
  | "COMMENT_ATTACHMENTS"
  | "REQUEST_ATTACHMENTS";
export type ReceiverStatusType = "PENDING" | "APPROVED" | "REJECTED" | "PAUSED";
export type FormStatusType = ReceiverStatusType | "CANCELED";
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
  | "REVIEW_COMMENT";
export type NotificationType =
  | "REQUEST"
  | "APPROVE"
  | "REJECT"
  | "INVITE"
  | "REVIEW"
  | "COMMENT";
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
  user_signature_attachment: AttachmentTableRow;
};

export type RequestWithResponseType = RequestTableRow & {
  request_form: {
    form_id: string;
    form_name: string;
    form_description: string;
    form_is_formsly_form: boolean;
    form_section: (SectionTableRow & {
      section_field: (FieldTableRow & {
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
  }[];
};

export type TeamMemberType = {
  team_member_id: string;
  team_member_role: MemberRoleType;
  team_member_group_list: string[];
  team_member_project_list: string[];
  team_member_user: {
    user_id: string;
    user_first_name: string;
    user_last_name: string;
    user_avatar: string;
    user_email: string;
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
  form_group: string[];
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
};

export type FormWithResponseType = {
  form_id: string;
  form_name: string;
  form_description: string;
  form_date_created: string;
  form_is_hidden: boolean;
  form_is_formsly_form: boolean;
  form_is_for_every_member: boolean;
  form_group: string[];
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
};

export type FormWithTeamMember = FormTableRow & {
  form_team_member: TeamMemberTableRow[];
};

export type ItemWithDescriptionType = ItemTableRow & {
  item_description: ItemDescriptionTableRow[];
};

export type ItemForm = {
  generalName: string;
  descriptions: { description: string }[];
  unit: string;
  isAvailable: boolean;
  purpose: string;
  costCode: string;
  glAccount: string;
};

export type ItemDescriptionFieldForm = {
  value: string;
  isAvailable: boolean;
};
export type SectionWithField = {
  fields: FieldWithChoices[];
} & SectionTableRow;

export type FieldWithChoices = {
  options: OptionTableRow[];
} & FieldTableRow;

export type ItemWithDescriptionAndField = ItemTableRow & {
  item_description: (ItemDescriptionTableRow & {
    item_description_field: ItemDescriptionFieldTableRow[];
    item_field: FieldTableRow;
  })[];
};

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

export type ConnectedFormsType =
  | "Order to Purchase"
  | "Invoice"
  | "Account Payable Voucher";

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
  "Order to Purchase": string[];
  Quotation: string[];
  "Receiving Inspecting Report (Purchased)": string[];
};

export type FormslyFormKeyType =
  | "Order to Purchase"
  | "Quotation"
  | "Receiving Inspecting Report (Purchased)";

export type RequestSignerListType =
  RequestDashboardOverviewData["request_signer"][0]["request_signer_signer"] & {
    signerCount: {
      approved: number;
      rejected: number;
    };
  };
export type TeamGroupForFormType =
  | "Order to Purchase"
  | "Quotation"
  | "Receiving Inspecting Report (Purchased)"
  | "Cheque Reference"
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
  otp_request_id: string;
  otp_request_date_created: string;
  otp_request_owner: SSOTRequestOwnerType;
  otp_request_response: SSOTResponseType[];
  otp_quotation_request: {
    quotation_request_id: string;
    quotation_request_date_created: string;
    quotation_request_owner: SSOTRequestOwnerType;
    quotation_request_response: SSOTResponseType[];
    quotation_rir_request: {
      rir_request_id: string;
      rir_request_date_created: string;
      rir_request_owner: SSOTRequestOwnerType;
      rir_request_response: SSOTResponseType[];
    }[];
  }[];
  otp_cheque_reference_request: {
    cheque_reference_request_id: string;
    cheque_reference_request_date_created: string;
    cheque_reference_request_response: SSOTResponseType[];
    cheque_reference_request_owner: SSOTRequestOwnerType;
  }[];
  otp_rir_request: {
    rir_request_id: string;
    rir_request_date_created: string;
    rir_request_owner: SSOTRequestOwnerType;
    rir_request_response: SSOTResponseType[];
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

export type RequestListItemType = {
  request_id: string;
  request_date_created: string;
  request_status: string;
  request_team_member: {
    team_member_team_id: string;
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
    request_signer_status: string;
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
