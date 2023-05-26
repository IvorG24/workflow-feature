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
export type ReceiverStatusType = "PENDING" | "APPROVED" | "REJECTED";
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
  | "SLIDER";
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
// End: Database Enums

// Start: Joined Types
export type RequestType = {
  request_id: string;
  request_date_created: string;
  request_status: FormStatusType;
  request_team_member: {
    team_member_user: {
      user_first_name: string;
      user_last_name: string;
      user_avatar: string | null;
    };
  };
  request_form: {
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
    formId: string;
    form_name: string;
    form_description: string;
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
    comment_team_member: {
      team_member_id: string;
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

export type TeamWithTeamMemberType = {
  team_id: string;
  team_name: string;
  team_is_request_signature_required: boolean;
  team_logo: string;
  team_user_id: string;
  team_member: {
    team_member_id: string;
    team_member_role: MemberRoleType;
    team_member_user: {
      user_id: string;
      user_first_name: string;
      user_last_name: string;
      user_email: string;
      user_job_title: string;
      user_phone_number: string;
      user_avatar: string;
    };
  }[];
};

export type FormWithOwnerType = FormTableRow & {
  form_team_member: TeamMemberTableRow;
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
  form_name: string;
  form_description: string;
  form_date_created: string;
  form_is_hidden: boolean;
  form_team_member: {
    team_member_id: string;
    team_member_user: {
      user_first_name: string;
      user_last_name: string;
      user_avatar: string;
    };
  };
  form_signer: {
    signer_id: string;
    signer_is_primary_signer: boolean;
    signer_action: string;
    signer_order: boolean;
    signer_team_member: {
      team_member_id: string;
      team_member_user: {
        user_first_name: string;
        user_last_name: string;
        user_avatar: string;
      };
    };
  }[];
  form_section: (SectionTableRow & {
    section_field: (FieldTableRow & { field_option: OptionTableRow[] })[];
  })[];
};
