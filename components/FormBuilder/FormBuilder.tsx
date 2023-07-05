import { AppType, SectionWithField, TeamMemberType } from "@/utils/types";
import { Container as MantineContainer } from "@mantine/core";
import { ReactNode } from "react";
import Container from "./Container";
import DescriptionInput from "./DescriptionInput";
import Question from "./Field";
import FormNameInput from "./FormNameInput";
import GoBackLink from "./GoBackLink";
import GroupSection from "./GroupSection";
import RevieweeList from "./RevieweeList";
import Section from "./Section";
import SignerButtons from "./SignerButtons";
import SignerSection, { RequestSigner } from "./SignerSection";
import SubmitButton from "./SubmitButton";
import UserSignature from "./UserSignature";

type Props = {
  children: ReactNode;
};

export type FormBuilderData = {
  formId: string;
  formName: string;
  formDescription: string;
  formType: AppType;
  revieweeList: TeamMemberType[] | null;
  sections: SectionWithField[];
  signers: RequestSigner[];
  isSignatureRequired: boolean;
  isForEveryone: boolean;
  groupList: string[];
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

FormBuilder.SignerButtons = SignerButtons;

FormBuilder.GroupSection = GroupSection;
