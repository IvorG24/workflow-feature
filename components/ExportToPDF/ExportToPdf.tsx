"use client";

import { safeParse } from "@/utils/functions";
import { startCase } from "@/utils/string";
import { DuplicateSectionType, RequestWithResponseType } from "@/utils/types";
import { Button, Menu } from "@mantine/core";
import { Font, usePDF } from "@react-pdf/renderer/lib/react-pdf.browser.cjs";
import { IconList, IconTable } from "@tabler/icons-react";
import moment from "moment";
import { ApproverDetailsType } from "../RequisitionRequestPage/RequisitionRequestPage";
import OtherExpensesPdfDocumentTableVersion from "./OtherExpensesPdfDocumentTableVersion";
import PdfDocument from "./PdfDocument";
import RequisitionPdfDocumentTableVersion from "./RequisitionPdfDocumentTableVersion";
import ServicesPdfDocumentTableVersion from "./ServicesPdfDocumentTableVersion";

type Props = {
  request: RequestWithResponseType;
  sectionWithDuplicateList: DuplicateSectionType[];
  approverDetails: ApproverDetailsType[];
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

const getReadableDate = (date: string) =>
  moment(new Date(date)).format("YYYY-MM-DD");

const ExportToPdf = ({
  request,
  sectionWithDuplicateList,
  approverDetails,
}: Props) => {
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
    ...(request.request_form.form_type && request.request_form.form_sub_type
      ? [
          {
            label: "Type:",
            value: request.request_form.form_type,
          },
          {
            label: "Sub Type:",
            value: request.request_form.form_sub_type,
          },
        ]
      : []),
  ];

  const requestorDetails = [
    {
      label: "Requested by:",
      value: `${requestor.user_first_name} ${requestor.user_last_name}`,
      additional: requestor.user_job_title,
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

    const fields = section.section_field.map((field) => {
      let response = "";
      if (field.field_response?.request_response) {
        response = safeParse(field.field_response?.request_response);
      }
      const responseValue =
        field.field_type !== "DATE" ? response : getReadableDate(response);

      return {
        label: field.field_name,
        value: `${responseValue}`,
      };
    });

    const newSection = { title, fields: fields.filter((f) => f !== undefined) };

    return newSection;
  });

  const requestorFullName =
    `${requestor.user_first_name}-${requestor.user_last_name}`.replaceAll(
      ".",
      ""
    );

  const pdfFileName = `${moment(request.request_date_created).format(
    "YYYY-MM-DD"
  )}-${request.request_form.form_name
    .split(" ")
    .join("-")}-${requestorFullName}`;

  const getDocument = () => {
    switch (request.request_form.form_name) {
      case "Requisition":
        return (
          <RequisitionPdfDocumentTableVersion
            requestDetails={requestDetails}
            requestorDetails={requestorDetails}
            requestIDs={requestIDs}
            requestItems={requestItems}
            approverDetails={approverDetails}
          />
        );
      case "Services":
        return (
          <ServicesPdfDocumentTableVersion
            requestDetails={requestDetails}
            requestorDetails={requestorDetails}
            requestIDs={requestIDs}
            requestItems={requestItems}
            approverDetails={approverDetails}
          />
        );
      case "Other Expenses":
        return (
          <OtherExpensesPdfDocumentTableVersion
            requestDetails={requestDetails}
            requestorDetails={requestorDetails}
            requestIDs={requestIDs}
            requestItems={requestItems}
            approverDetails={approverDetails}
          />
        );
    }
  };

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
    document: getDocument(),
  });

  return (
    <>
      {!instance.loading && approverDetails.length !== 0 ? (
        <Menu width={200} shadow="md">
          <Menu.Target>
            <Button
              variant="light"
              className="onboarding-requisition-request-pdf"
            >
              Export to PDF
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {!request.request_form.form_is_formsly_form && (
              <Menu.Item
                component="a"
                href={instance.url ? instance.url : "#"}
                download={`${pdfFileName}-list-view`}
                icon={<IconList size={16} />}
              >
                List View
              </Menu.Item>
            )}

            {request.request_form.form_is_formsly_form &&
              ["Requisition", "Services", "Other Expenses"].includes(
                request.request_form.form_name
              ) && (
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
