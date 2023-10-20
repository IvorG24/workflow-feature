"use client";

import { startCase } from "@/utils/string";
import { DuplicateSectionType, RequestWithResponseType } from "@/utils/types";
import { Button, Menu } from "@mantine/core";
import { Font, usePDF } from "@react-pdf/renderer/lib/react-pdf.browser.cjs";
import { IconList, IconTable } from "@tabler/icons-react";
import moment from "moment";
import PdfDocument from "./PdfDocument";
import PdfDocumentTableVersion from "./PdfDocumentTableVersion";

type Props = {
  request: RequestWithResponseType;
  sectionWithDuplicateList: DuplicateSectionType[];
};

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
  ],
});

const getReadableDate = (date: string) => {
  const readableDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return readableDate;
};

const ExportToPdf = ({ request, sectionWithDuplicateList }: Props) => {
  const requestor = request.request_team_member.team_member_user;
  const requestDateCreated = getReadableDate(request.request_date_created);

  const requestDetails = [
    {
      label: "Request ID:",
      value: request.request_id,
    },
    {
      label: "Form Name:",
      value: request.request_form.form_name,
    },
    {
      label: "Form Description:",
      value: request.request_form.form_description,
    },
  ];

  const requestorDetails = [
    {
      label: "Requested by:",
      value: `${requestor.user_first_name} ${requestor.user_last_name}`,
    },
    {
      label: "Date requested:",
      value: requestDateCreated,
    },
    {
      label: "Request status:",
      value: `${startCase(request.request_status.toLowerCase())}`,
    },
  ];

  const approverDetails = request.request_signer.map((signer) => {
    const fullName = `${signer.request_signer_signer.signer_team_member.team_member_user.user_first_name} ${signer.request_signer_signer.signer_team_member.team_member_user.user_last_name}`;

    return {
      name: fullName,
      status: signer.request_signer_status,
      date: signer.request_signer_status_date_updated,
    };
  });

  const requestIDs = [
    ...(request.request_formsly_id
      ? [
          {
            label: "Formsly ID:",
            value: `${request.request_formsly_id}`,
          },
        ]
      : []),
    ...(request.request_jira_id
      ? [
          {
            label: "Jira ID:",
            value: `${request.request_jira_id}`,
          },
        ]
      : []),
    ...(request.request_otp_id
      ? [
          {
            label: "OTP ID:",
            value: `${request.request_otp_id}`,
          },
        ]
      : []),
  ];

  const requestItems = sectionWithDuplicateList.map((section) => {
    const title = section.section_name;
    const fieldWithResponse = section.section_field.filter(
      (field) => field.field_response !== null
    );
    const fields = fieldWithResponse.map((field) => {
      const parseResponse = JSON.parse(
        `${field.field_response?.request_response}`
      );
      const responseValue =
        field.field_type !== "DATE"
          ? parseResponse
          : getReadableDate(parseResponse);

      return {
        label: field.field_name,
        value: `${responseValue}`,
      };
    });

    const newSection = { title, fields: fields.filter((f) => f !== undefined) };

    return newSection;
  });

  const pdfFileName = `${moment(request.request_date_created).format(
    "YYYY-MM-DD"
  )}-${request.request_form.form_name.split(" ").join("-")}-${
    requestor.user_first_name
  }-${requestor.user_last_name}`;

  const [instance] = usePDF({
    document: (
      <PdfDocument
        requestDetails={requestDetails}
        requestorDetails={requestorDetails}
        requestIDs={requestIDs}
        requestItems={requestItems}
        approverDetails={approverDetails}
      />
    ),
  });

  const [instanceTable] = usePDF({
    document: (
      <PdfDocumentTableVersion
        requestDetails={requestDetails}
        requestorDetails={requestorDetails}
        requestIDs={requestIDs}
        requestItems={requestItems}
        approverDetails={approverDetails}
      />
    ),
  });

  return (
    <>
      {!instance.loading ? (
        <Menu width={200} shadow="md">
          <Menu.Target>
            <Button variant="light">Export to PDF</Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              component="a"
              href={instance.url ? instance.url : "#"}
              download={`${pdfFileName}-list-view`}
              icon={<IconList size={16} />}
            >
              List View
            </Menu.Item>
            {request.request_form.form_is_formsly_form &&
              request.request_form.form_name === "Requisition" && (
                <Menu.Item
                  component="a"
                  href={instanceTable.url ? instanceTable.url : "#"}
                  download={`${pdfFileName}-table-view`}
                  icon={<IconTable size={16} />}
                >
                  Table View
                </Menu.Item>
              )}
          </Menu.Dropdown>
        </Menu>
      ) : null}
    </>
  );
};

export default ExportToPdf;
