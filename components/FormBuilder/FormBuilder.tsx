import {
  AppType,
  CommentTableRow,
  SectionWithField,
  TeamWithTeamMemberType,
} from "@/utils/types";
import { Container as MantineContainer } from "@mantine/core";
import { ReactNode } from "react";
import ApproverButtons from "./ApproverButtons";
import CommentSection from "./CommentSection";
import Container from "./Container";
import DescriptionInput from "./DescriptionInput";
import Question from "./Field";
import FormNameInput from "./FormNameInput";
import GoBackLink from "./GoBackLink";
import RevieweeList from "./RevieweeList";
import Section from "./Section";
import SignerSection, { RequestSigner } from "./SignerSection";
import SubmitButton from "./SubmitButton";
import UserSignature from "./UserSignature";

type Props = {
  children: ReactNode;
};

export type FormBuilderData = {
  formId: string;
  form_name: string;
  form_description: string | null;
  formType: AppType;
  revieweeList: TeamWithTeamMemberType[] | null;
  sections: SectionWithField[];
  signers: RequestSigner[];
  is_signature_required: boolean;
  commentList: CommentTableRow[];
  created_at: string;
};

const FormBuilder = ({ children }: Props) => {
  return (
    <MantineContainer fluid>
      <MantineContainer maw={768} mt={32} p={0}>
        {children}
      </MantineContainer>
    </MantineContainer>
  );
};

export default FormBuilder;

FormBuilder.GoBackLink = GoBackLink;

FormBuilder.Section = Section;

FormBuilder.SubmitButton = SubmitButton;

FormBuilder.Container = Container;

FormBuilder.FormNameInput = FormNameInput;

FormBuilder.DescriptionInput = DescriptionInput;

FormBuilder.RevieweeList = RevieweeList;

FormBuilder.Question = Question;

FormBuilder.SignerSection = SignerSection;

FormBuilder.UserSignature = UserSignature;

FormBuilder.ApproverButtons = ApproverButtons;

FormBuilder.CommentSection = CommentSection;
