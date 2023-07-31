"use client";

import { DuplicateSectionType, RequestWithResponseType } from "@/utils/types";
import { Button } from "@mantine/core";
import { Font, usePDF } from "@react-pdf/renderer/lib/react-pdf.browser.cjs";
import { lowerCase, startCase } from "lodash";
import moment from "moment";
import PdfDocument from "./PdfDocument";

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
      value: `${startCase(lowerCase(request.request_status))}`,
    },
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
        requestItems={requestItems}
      />
    ),
  });

  return (
    <>
      {!instance.loading ? (
        <Button
          variant="light"
          component="a"
          href={instance.url ? instance.url : "#"}
          download={pdfFileName}
          sx={{ flex: 1 }}
        >
          Export to PDF
        </Button>
      ) : null}
    </>
  );
};

export default ExportToPdf;
