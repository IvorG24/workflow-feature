import { OnboardingTestFormValues } from "@/components/OnboardingTestPage/OnboardingTestPage";
import { Box, Text, Title } from "@mantine/core";
import { Step } from "react-joyride";
import { v4 as uuidv4 } from "uuid";
import { RequestWithResponseType } from "./types";

export const ONBOARD_NAME = {
  DASHBOARD: "Dashboard",
  CREATE_REQUISITION: "Create Requisition",
  REQUEST_LIST: "Request List",
  REQUISITION_REQUEST: "Requisition Request",
};

export const ONBOARDING_CREATE_REQUEST_STEP: Step[] = [
  {
    target: ".onboarding-create-request-form-details",
    content: (
      <Box>
        <Title order={4}>Request Details</Title>
        <Text align="center" mt="md" size="sm">
          This section provides essential details about the form you&apos;re
          working on. Find information such as the form name, description,
          requester, and date created.
        </Text>
      </Box>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: ".onboarding-create-request-main-section",
    content: (
      <Box>
        <Title order={4}>Main Form Section</Title>
        <Text align="center" mt="md" size="sm">
          This part helps you share key details. Just fill in the fields.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-create-request-item-section",
    content: (
      <Box>
        <Title order={4}>Item Details Section</Title>
        <Text align="center" mt="md" size="sm">
          This section is where you input your item details. Simply fill in the
          required fields.
        </Text>
        <Text align="center" size="sm" mt="md">
          Note that the grayed-out fields are automatically filled based on your
          selected item.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-create-request-duplicate-item",
    content: (
      <Box>
        <Title order={4}>Add Item</Title>
        <Text align="center" mt="md" size="sm">
          To add another item, click on the Item + button. There is no limit;
          you can add as many items as needed.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-create-request-remove-item",
    content: (
      <Box>
        <Title order={4}>Remove Item</Title>
        <Text align="center" mt="md" size="sm">
          To remove an item, click on the trash icon located at the top-right of
          the item section you wish to remove.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-create-request-signer-section",
    content: (
      <Box>
        <Title order={4}>Signers Section</Title>
        <Text align="center" mt="md" size="sm">
          This section displays the individuals responsible for approving or
          signing your request.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-create-request-submit-button",
    content: (
      <Box>
        <Title order={4}>Submit Button</Title>
        <Text align="center" mt="md" size="sm">
          After completing the form and reviewing the filled-out fields to
          ensure all details are correct, click on the Submit button.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
];

export const ONBOARDING_REQUEST_LIST_STEP: Step[] = [
  {
    target: ".onboarding-request-list-table",
    content: (
      <Box>
        <Title order={4}>Request List</Title>
        <Text align="center" mt="md" size="sm">
          This table displays a list of requests. Get familiar with the layout
          and discover the details you need at a glance on the Request List
          page.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
    disableBeacon: true,
  },
  {
    target: ".onboarding-request-list-row-rid",
    content: (
      <Box>
        <Title order={4}>Request ID</Title>
        <Text align="center" mt="md" size="sm">
          Find request, Jira, and OTP IDs effortlessly! In the first columns of
          the table, click the copy button on the right side of each ID to
          quickly copy it for your convenience.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-row-jira",
    content: (
      <Box>
        <Title order={4}>Jira ID</Title>
        <Text align="center" mt="md" size="sm">
          Find request, Jira, and OTP IDs effortlessly! In the first columns of
          the table, click the copy button on the right side of each ID to
          quickly copy it for your convenience.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-row-otp",
    content: (
      <Box>
        <Title order={4}>OTP ID</Title>
        <Text align="center" mt="md" size="sm">
          Find request, Jira, and OTP IDs effortlessly! In the first columns of
          the table, click the copy button on the right side of each ID to
          quickly copy it for your convenience.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-row-form",
    content: (
      <Box>
        <Title order={4}>Form name</Title>
        <Text align="center" mt="md" size="sm">
          Form name of the request.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-row-status",
    content: (
      <Box>
        <Title order={4}>Status</Title>
        <Text align="center" mt="md" size="sm">
          Stay informed with the status indicators. Requests are categorized as
          pending, approved, rejected, or cancelled.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-row-requester",
    content: (
      <Box>
        <Title order={4}>Requested By</Title>
        <Text align="center" mt="md" size="sm">
          The &apos;Requested By&apos; column provides information about the
          user who initiated the request
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-row-approver",
    content: (
      <Box>
        <Title order={4}>Approver</Title>
        <Text align="center" mt="md" size="sm">
          Effortlessly track the approver status with color-coded indicators on
          their profile icon. A blue border signals pending approval, green for
          approval, red for rejection, and gray for cancellation.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-row-date",
    content: (
      <Box>
        <Title order={4}>Date Created</Title>
        <Text align="center" mt="md" size="sm">
          Stay informed about the exact date each request was created.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-row-view",
    content: (
      <Box>
        <Title order={4}>View</Title>
        <Text align="center" mt="md" size="sm">
          View button to access full details of the request.
        </Text>
      </Box>
    ),
    placement: "top",
  },
  {
    target: ".onboarding-request-list-sort",
    content: (
      <Box>
        <Title order={4}>Sort</Title>
        <Text align="center" mt="md" size="sm">
          Sorting requests based on their creation date.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-filters-rid",
    content: (
      <Box>
        <Title order={4}>Request ID Filter</Title>
        <Text align="center" mt="md" size="sm">
          Refine your search with powerful filters! Utilize the search bar to
          filter requests by ID, form, status, requester, or approver.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-filters-form",
    content: (
      <Box>
        <Title order={4}>Form Filter</Title>
        <Text align="center" mt="md" size="sm">
          Refine your search with powerful filters! Utilize the search bar to
          filter requests by ID, form, status, requester, or approver.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-filters-status",
    content: (
      <Box>
        <Title order={4}>Status Filter</Title>
        <Text align="center" mt="md" size="sm">
          Refine your search with powerful filters! Utilize the search bar to
          filter requests by ID, form, status, requester, or approver.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-filters-requestor",
    content: (
      <Box>
        <Title order={4}>Requestor Filter</Title>
        <Text align="center" mt="md" size="sm">
          Refine your search with powerful filters! Utilize the search bar to
          filter requests by ID, form, status, requester, or approver.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-filters-approver",
    content: (
      <Box>
        <Title order={4}>Approver Filter</Title>
        <Text align="center" mt="md" size="sm">
          Refine your search with powerful filters! Utilize the search bar to
          filter requests by ID, form, status, requester, or approver.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-filters-approver-view",
    content: (
      <Box>
        <Title order={4}>Approver&apos;s View Filter </Title>
        <Text align="center" mt="md" size="sm">
          Optimize your workflow! Toggle the &apos;Approver&apos;s View&apos;
          checkbox to exclusively display requests where you are the approver.
          Note that when enabled, other filters will be ignored and disabled,
          ensuring you focus seamlessly on your approvals.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-pagination",
    content: (
      <Box>
        <Title order={4}>Pagination</Title>
        <Text align="center" mt="md" size="sm">
          Utilize pagination to explore multiple pages of the Request List.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-refresh",
    content: (
      <Box>
        <Title order={4}>Refresh</Title>
        <Text align="center" mt="md" size="sm">
          Use the &apos;Refresh&apos; button to instantly update the Request
          List and view the latest requests without navigating away from the
          page.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-request-list-ssot",
    content: (
      <Box>
        <Title order={4}>SSOT Spreadsheet View</Title>
        <Text align="center" mt="md" size="sm">
          Experience data in a spreadsheet-like format! Click on &apos;SSOT
          Spreadsheet View&apos; to seamlessly navigate through an organized and
          tabular display of approved requests for enhanced visibility and easy
          analysis.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
];

const createOptionArray = (
  fieldId: string,
  options: string[]
): OnboardingTestFormValues["sections"][0]["section_field"][0]["field_option"] => {
  return options.map((option, optionIdx) => ({
    option_id: uuidv4(),
    option_value: option,
    option_order: optionIdx + 1,
    option_field_id: fieldId,
  }));
};

export type OnboardAnswer = {
  fieldId: string;
  response: string | string[];
};

export const checkOnboardingAnswers = ({
  answers,
  responses,
}: {
  answers: OnboardAnswer[];
  responses: OnboardAnswer[];
}) => {
  return responses.map((response) => {
    const fieldAnswer = answers.find(
      (answer) => answer.fieldId === response.fieldId
    );
    if (!fieldAnswer) return;
    if (typeof response.response === "string") {
      return response.response === fieldAnswer.response;
    } else if (
      Array.isArray(response.response) &&
      Array.isArray(fieldAnswer.response)
    ) {
      return fieldAnswer.response.every((answer) =>
        response.response.includes(answer)
      );
    } else {
      // Input is of an unexpected type
      console.error("Unexpected response type:", typeof response.response);
    }
  });
};

export const ONBOARDING_FORM_CREATE_REQUISITION_ANSWER: OnboardAnswer[] = [
  {
    fieldId: "45592589-02ee-4c12-a784-2e729f90400b",
    response: "Request Details",
  },
  {
    fieldId: "9c7d86e2-500c-486a-b43c-213b9b6025e3",
    response: [
      "Base Unit of Measurement",
      "GL Account",
      "CSI Code",
      "Division Description",
      "Level 2 Major Group Description",
      "Level 2 Minor Group Description",
    ],
  },
  {
    fieldId: "8007b08f-3924-48c4-a6bc-726d5752c492",
    response: "Unlimited",
  },
  {
    fieldId: "7493e3c1-21a3-4cac-aeeb-e5bf460890a0",
    response: ["Requesting Project", "Date Needed", "Type", "Purpose"],
  },
  {
    fieldId: "47f045c3-b47e-41f3-ba6c-3cc3dc112b8c",
    response: "Preffered Supplier",
  },
];

export const ONBOARDING_REQUEST_LIST_ANSWER: OnboardAnswer[] = [
  {
    fieldId: "4b94767a-15f5-41b7-baa5-d4c2bc9128b8",
    response: ["Cancelled", "Pending", "Rejected", "Approved"],
  },
  {
    fieldId: "3091412c-2e88-42d5-9b6c-b809e0dac6d9",
    response: "Approver's View Checkbox",
  },
  {
    fieldId: "07137c98-6159-4210-a064-08d883254f24",
    response: "Date Created",
  },
  {
    fieldId: "99c37d93-c82a-4bdf-908b-be0185e781d0",
    response: ["Date Updated", "Form description"],
  },
];

export const ONBOARDING_FORM_CREATE_REQUISITION_QUESTION: OnboardingTestFormValues["sections"] =
  [
    {
      section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
      section_name: "Create requisition assessment",
      section_order: 1,
      section_is_duplicatable: false,
      section_form_id: "6c8ae461-c47b-420b-bb69-223885aec6a3",
      section_field: [
        {
          field_id: "45592589-02ee-4c12-a784-2e729f90400b",
          field_name: "In which section would you find the requester's name?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
          field_option: createOptionArray(
            "45592589-02ee-4c12-a784-2e729f90400b",
            [
              "User Information",
              "Form Details",
              "Request Details",
              "Main Section",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "9c7d86e2-500c-486a-b43c-213b9b6025e3",
          field_name:
            "Select all the fields that are automatically filled in the item section?",
          field_description: null,
          field_is_required: true,
          field_type: "MULTISELECT",
          field_order: 2,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
          field_option: createOptionArray(
            "9c7d86e2-500c-486a-b43c-213b9b6025e3",
            [
              "Purpose",
              "Requesting Project",
              "Request",
              "General Name",
              "Base Unit of Measurement",
              "Quantity",
              "GL Account",
              "CSI Code Description",
              "CSI Code",
              "Division Description",
              "Level 2 Major Group Description",
              "Level 2 Minor Group Description",
              "Preferred Supplier",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "8007b08f-3924-48c4-a6bc-726d5752c492",
          field_name: "How many items can be added when creating a request?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 3,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
          field_option: createOptionArray(
            "8007b08f-3924-48c4-a6bc-726d5752c492",
            ["One", "Three", "Unlimited", "Ten"]
          ),
          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "7493e3c1-21a3-4cac-aeeb-e5bf460890a0",
          field_name: "What fields are the fields found in the main section?",
          field_description: null,
          field_is_required: true,
          field_type: "MULTISELECT",
          field_order: 4,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
          field_option: createOptionArray(
            "7493e3c1-21a3-4cac-aeeb-e5bf460890a0",
            [
              "Date Needed",
              "Requesting Project",
              "Type",
              "Item",
              "Purpose",
              "Quantity",
            ]
          ),
          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "47f045c3-b47e-41f3-ba6c-3cc3dc112b8c",
          field_name:
            "Among the following fields, which one is the only optional field when creating a requisition?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 5,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
          field_option: createOptionArray(
            "47f045c3-b47e-41f3-ba6c-3cc3dc112b8c",
            [
              "Date Needed",
              "Requester Name",
              "Type",
              "Preffered Supplier",
              "Purpose",
              "Quantity",
            ]
          ),
          field_response: "",
          field_section_duplicatable_id: "",
        },
      ],
    },
  ];

export const ONBOARDING_REQUEST_LIST_QUESTION: OnboardingTestFormValues["sections"] =
  [
    {
      section_id: "dac07b42-314c-4527-914e-17340df97ff2",
      section_name: "Request list assessment",
      section_order: 1,
      section_is_duplicatable: false,
      section_form_id: "11aed59b-6f54-422a-a6cc-e21fe18fe1b9",
      section_field: [
        {
          field_id: "4b94767a-15f5-41b7-baa5-d4c2bc9128b8",
          field_name: "What are the possible status values for requests?",
          field_description: null,
          field_is_required: true,
          field_type: "MULTISELECT",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
          field_option: createOptionArray(
            "4b94767a-15f5-41b7-baa5-d4c2bc9128b8",
            [
              "Resolved",
              "Cancelled",
              "Closed",
              "Pending",
              "Rejected",
              "Approved",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "3091412c-2e88-42d5-9b6c-b809e0dac6d9",
          field_name:
            "Which filter allows you to view only the requests you are approving?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
          field_option: createOptionArray(
            "3091412c-2e88-42d5-9b6c-b809e0dac6d9",
            [
              "Status Filter",
              "Requestor Filter",
              "Approver's View Checkbox",
              "Date Created Filter",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "07137c98-6159-4210-a064-08d883254f24",
          field_name: "When sorting requests, what is it sorted by?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
          field_option: createOptionArray(
            "07137c98-6159-4210-a064-08d883254f24",
            ["Request ID", "Date Created", "Form Name", "Status"]
          ),
          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "99c37d93-c82a-4bdf-908b-be0185e781d0",
          field_name: "Which columns are not included in the Request table?",
          field_description: null,
          field_is_required: true,
          field_type: "MULTISELECT",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "bd63eb8a-99b3-47e2-ab09-51c480bb1e6d",
          field_option: createOptionArray(
            "99c37d93-c82a-4bdf-908b-be0185e781d0",
            [
              "Request ID",
              "Jira ID",
              "Date Updated",
              "Approver",
              "OTP ID",
              "Form description",
            ]
          ),
          field_response: "",
          field_section_duplicatable_id: "",
        },
      ],
    },
  ];

export const ONBOARDING_DASHBOARD_STEP: Step[] = [
  {
    target: ".onboarding-dashboard-total-request",
    content: (
      <Box>
        <Title order={4}>Total Requests</Title>
        <Text align="center" mt="md" size="sm">
          Get a quick glance at request status percentages. The &apos;Total
          Requests&apos; section not only shows the count but also the
          percentage breakdown for each status – pending, approved, and
          rejected.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
    disableBeacon: true,
  },
  {
    target: ".onboarding-dashboard-top-requestor",
    content: (
      <Box>
        <Title order={4}>Top Requestor</Title>
        <Text align="center" mt="md" size="sm">
          Discover top requestors with the &apos;Top Requestor&apos; section.
          Easily identify the top requestor and hover over their bar to view a
          breakdown of their total pending, approved, and rejected requests.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-dashboard-top-signer",
    content: (
      <Box>
        <Title order={4}>Top Signer</Title>
        <Text align="center" mt="md" size="sm">
          Spotlight on top signers! The &apos;Top Signer&apos; section
          highlights the top contributor in signing requests. Identify the
          leading signer and gain insights into their total pending, approved,
          and rejected requests by hovering over their bar.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-dashboard-monthly-statistics",
    content: (
      <Box>
        <Title order={4}>Monthly Statistics</Title>
        <Text align="center" mt="md" size="sm">
          Track monthly activity effortlessly! The &apos;Monthly
          Statistics&apos; feature provides the number of requests for each
          month, and you can hover over each month to see the detailed breakdown
          of the status counts—keeping you informed on the overall performance
          month by month.
        </Text>
      </Box>
    ),
    placement: "top",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-dashboard-filter-form",
    content: (
      <Box>
        <Title order={4}>Form Filter</Title>
        <Text align="center" mt="md" size="sm">
          Select a form, and instantly see requests associated with that form,
          streamlining your focus and making your dashboard experience more
          personalized.
        </Text>
      </Box>
    ),
    placement: "bottom",
    spotlightClicks: true,
  },
  {
    target: ".onboarding-dashboard-filter-date-created",
    content: (
      <Box>
        <Title order={4}>Date Created Filter</Title>
        <Text align="center" mt="md" size="sm">
          Choose from preset options like &apos;Last 7 days,&apos; &apos;Last 14
          days,&apos; &apos;Last 30 days,&apos; and &apos;Last 90 days.&apos;
          For a custom range, pick your own start and end dates. Easily filter
          requests based on your preferred time frame, making tracking and
          analysis a breeze.
        </Text>
      </Box>
    ),
    placement: "bottom",
    spotlightClicks: true,
  },
];

export const REQUISITION_REQUEST_SAMPLE: RequestWithResponseType = {
  request_id: "40a7c790-6b30-45f1-a29a-a398c4a5514d",
  request_formsly_id: "PM1-1",
  request_date_created: "2023-12-05T03:00:35.924Z",
  request_status_date_updated: "2023-12-05T03:00:35.924Z",
  request_status: "PENDING",
  request_is_disabled: false,
  request_team_member_id: "40b70103-b8c8-4d05-b0fe-11b1dab89882",
  request_form_id: "d13b3b0f-14df-4277-b6c1-7c80f7e7a829",
  request_project_id: "4b3a151a-a077-486c-9dfb-e996c2c9184c",
  request_jira_id: "SCSM-1234",
  request_jira_link: `${process.env.NEXT_PUBLIC_SITE_URL}/team-requests/requests/40a7c790-6b30-45f1-a29a-a398c4a5514d/onboarding?requestFormName=Requisition`,
  request_otp_id: null,
  request_comment: [
    {
      comment_id: "4599306c-6d4f-4117-bf25-de0468ef84fa",
      comment_date_created: "2023-12-05T03:19:56.580Z",
      comment_content:
        "I've attached the necessary documents for reference. Let me know if anything else is needed.",
      comment_is_edited: false,
      comment_type: "REQUEST_COMMENT",
      comment_team_member_id: "40b70103-b8c8-4d05-b0fe-11b1dab89882",
      comment_last_updated: "2023-12-05T03:19:56.580Z",
      comment_attachment: [],
      comment_team_member: {
        team_member_user: {
          user_id: "bbfdaee2-2183-44cc-98a9-71421054a750",
          user_first_name: "John",
          user_last_name: "Doe",
          user_username: "johndoe",
          user_avatar: "",
        },
      },
    },
    {
      comment_id: "72682aed-9ed8-4bb4-b1b8-560617980747",
      comment_date_created: "2023-12-05T03:18:22.871Z",
      comment_content:
        "I need this request to be processed by end of day Monday. Urgent task. Thanks!",
      comment_is_edited: false,
      comment_last_updated: "2023-12-05T03:19:56.580Z",
      comment_attachment: [],
      comment_type: "REQUEST_COMMENT",
      comment_team_member_id: "40b70103-b8c8-4d05-b0fe-11b1dab89882",
      comment_team_member: {
        team_member_user: {
          user_id: "bbfdaee2-2183-44cc-98a9-71421054a750",
          user_first_name: "Jane",
          user_last_name: "Doe",
          user_username: "janedoe",
          user_avatar: "",
        },
      },
    },
  ],
  request_form: {
    form_id: "d13b3b0f-14df-4277-b6c1-7c80f7e7a829",
    form_name: "Requisition",
    form_description: "formsly premade Requisition form",
    form_is_formsly_form: true,
    form_section: [
      {
        section_id: "ee34bb67-fffa-4690-aaf2-7ae371b21e88",
        section_name: "Main",
        section_order: 1,
        section_is_duplicatable: false,
        section_form_id: "d13b3b0f-14df-4277-b6c1-7c80f7e7a829",
        section_field: [
          {
            field_id: "51b6da24-3e28-49c4-9e19-5988b9ad3909",
            field_name: "Requesting Project",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 1,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "ee34bb67-fffa-4690-aaf2-7ae371b21e88",
            field_response: [
              {
                request_response_id: "d3e398ce-0f61-4bef-8621-81e0632cbd10",
                request_response: '"PHILIP MORRIS"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "51b6da24-3e28-49c4-9e19-5988b9ad3909",
              },
            ],
            field_option: [],
          },
          {
            field_id: "6882287e-57c7-42ae-a672-b0d6c8979b01",
            field_name: "Type",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 2,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "ee34bb67-fffa-4690-aaf2-7ae371b21e88",
            field_response: [
              {
                request_response_id: "6de369ce-20ec-49bd-9db7-cded1ba568c8",
                request_response: '"Cash Purchase - Advance Payment"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "6882287e-57c7-42ae-a672-b0d6c8979b01",
              },
            ],
            field_option: [
              {
                option_id: "f97eb24f-53b2-452b-966e-9a2f1dfd812d",
                option_value: "Cash Purchase - Advance Payment",
                option_order: 1,
                option_field_id: "6882287e-57c7-42ae-a672-b0d6c8979b01",
              },
              {
                option_id: "6ce7fa3a-9e85-4ab1-9f3b-de931071fa26",
                option_value: "Cash Purchase - Local Purchase",
                option_order: 2,
                option_field_id: "6882287e-57c7-42ae-a672-b0d6c8979b01",
              },
              {
                option_id: "a73672df-03ea-4bc8-b904-366044819188",
                option_value: "Order to Purchase",
                option_order: 3,
                option_field_id: "6882287e-57c7-42ae-a672-b0d6c8979b01",
              },
              {
                option_id: "6703be59-09bb-4ffa-b2f9-aee10ebae64d",
                option_value: "Rental",
                option_order: 4,
                option_field_id: "6882287e-57c7-42ae-a672-b0d6c8979b01",
              },
            ],
          },
          {
            field_id: "46dc154d-1c35-4a3c-9809-698b56d17faa",
            field_name: "Date Needed",
            field_description: null,
            field_is_required: true,
            field_type: "DATE",
            field_order: 3,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "ee34bb67-fffa-4690-aaf2-7ae371b21e88",
            field_response: [
              {
                request_response_id: "0d2c3668-be0f-40fb-b5b8-73e70ed22f83",
                request_response: '"2023-12-30T16:00:00.000Z"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "46dc154d-1c35-4a3c-9809-698b56d17faa",
              },
            ],
            field_option: [],
          },
          {
            field_id: "c08820a5-592a-4bf9-9528-97b7ee7be94b",
            field_name: "Purpose",
            field_description: null,
            field_is_required: true,
            field_type: "TEXT",
            field_order: 4,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "ee34bb67-fffa-4690-aaf2-7ae371b21e88",
            field_response: [
              {
                request_response_id: "a2618e1b-3d50-44de-bfdd-03439140e1f3",
                request_response: '"For construction"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "c08820a5-592a-4bf9-9528-97b7ee7be94b",
              },
            ],
            field_option: [],
          },
        ],
      },
      {
        section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
        section_name: "Item",
        section_order: 2,
        section_is_duplicatable: true,
        section_form_id: "d13b3b0f-14df-4277-b6c1-7c80f7e7a829",
        section_field: [
          {
            field_id: "b2c899e8-4ac7-4019-819e-d6ebcae71f41",
            field_name: "General Name",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 5,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "36e6590a-53f8-4477-9627-f92959174d59",
                request_response: '"CEMENT"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "b2c899e8-4ac7-4019-819e-d6ebcae71f41",
              },
              {
                request_response_id: "308116d8-affd-4484-a0a0-b9bd7acfead7",
                request_response: '"AGGREGATES"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "b2c899e8-4ac7-4019-819e-d6ebcae71f41",
              },
            ],
            field_option: [],
          },
          {
            field_id: "c3efa89d-8297-4920-8c3e-d9dee61fdf13",
            field_name: "Base Unit of Measurement",
            field_description: null,
            field_is_required: true,
            field_type: "TEXT",
            field_order: 6,
            field_is_positive_metric: true,
            field_is_read_only: true,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "7e9206b0-9e83-473e-950a-d8231feec88e",
                request_response: '"Kilogram"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "c3efa89d-8297-4920-8c3e-d9dee61fdf13",
              },
              {
                request_response_id: "ab7c8b90-b7af-4b7c-8293-4ffedf3c7922",
                request_response: '"Cubic Meter"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "c3efa89d-8297-4920-8c3e-d9dee61fdf13",
              },
            ],
            field_option: [],
          },
          {
            field_id: "d78145e8-ba83-4fa8-907f-db66fd3cae0d",
            field_name: "Quantity",
            field_description: null,
            field_is_required: true,
            field_type: "NUMBER",
            field_order: 7,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "ce33fbbe-c598-43c1-983e-afe157af7f44",
                request_response: "20",
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "d78145e8-ba83-4fa8-907f-db66fd3cae0d",
              },
              {
                request_response_id: "3d23abfc-eae5-400b-88d6-97ff8a37a7a6",
                request_response: "10",
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "d78145e8-ba83-4fa8-907f-db66fd3cae0d",
              },
            ],
            field_option: [],
          },
          {
            field_id: "440d9a37-656a-4237-be3b-c434f512eaa9",
            field_name: "GL Account",
            field_description: null,
            field_is_required: true,
            field_type: "TEXT",
            field_order: 8,
            field_is_positive_metric: true,
            field_is_read_only: true,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "1fb7e666-a974-435e-ad3b-8e18b19f2c64",
                request_response: '"Construction Materials"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "440d9a37-656a-4237-be3b-c434f512eaa9",
              },
              {
                request_response_id: "09f1ef73-e9cb-46ed-b1b0-8695992cf23f",
                request_response: '"Construction Materials"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "440d9a37-656a-4237-be3b-c434f512eaa9",
              },
            ],
            field_option: [],
          },
          {
            field_id: "a6266f0b-1339-4c50-910e-9bae73031df0",
            field_name: "CSI Code Description",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 9,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "b0b4cf26-7efc-4ba6-832c-54043cc96bca",
                request_response: '"Concrete"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "a6266f0b-1339-4c50-910e-9bae73031df0",
              },
              {
                request_response_id: "3fddfe66-8429-4f2a-8ba2-737bcd60109a",
                request_response: '"Furnishings"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "a6266f0b-1339-4c50-910e-9bae73031df0",
              },
            ],
            field_option: [],
          },
          {
            field_id: "0c9831e7-dc18-4aaf-87f7-2e7bcbc53eae",
            field_name: "CSI Code",
            field_description: null,
            field_is_required: true,
            field_type: "TEXT",
            field_order: 10,
            field_is_positive_metric: true,
            field_is_read_only: true,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "db0e36f5-b714-4382-a740-96c1ab76797b",
                request_response: '"03 00 00"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "0c9831e7-dc18-4aaf-87f7-2e7bcbc53eae",
              },
              {
                request_response_id: "d52782e8-ff38-4413-9ef9-25374f59ee0b",
                request_response: '"12 00 00"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "0c9831e7-dc18-4aaf-87f7-2e7bcbc53eae",
              },
            ],
            field_option: [],
          },
          {
            field_id: "64bb5899-bad4-4fe4-bc08-60dce9923f57",
            field_name: "Division Description",
            field_description: null,
            field_is_required: true,
            field_type: "TEXT",
            field_order: 11,
            field_is_positive_metric: true,
            field_is_read_only: true,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "9c5e0174-4082-47f6-b684-f89c045dfc2b",
                request_response: '"Concrete"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "64bb5899-bad4-4fe4-bc08-60dce9923f57",
              },
              {
                request_response_id: "4a8dff94-7d05-4a62-be88-4d0ab0f220cb",
                request_response: '"Furnishings"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "64bb5899-bad4-4fe4-bc08-60dce9923f57",
              },
            ],
            field_option: [],
          },
          {
            field_id: "8fdb158b-bed5-4eac-a6dc-bc69275f1ac7",
            field_name: "Level 2 Major Group Description",
            field_description: null,
            field_is_required: true,
            field_type: "TEXT",
            field_order: 12,
            field_is_positive_metric: true,
            field_is_read_only: true,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "36704955-2627-4fdc-b0df-20f858786704",
                request_response: '"Concrete"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "8fdb158b-bed5-4eac-a6dc-bc69275f1ac7",
              },
              {
                request_response_id: "bcab1a9f-ecff-4391-9b8c-2bc05cd31f93",
                request_response: '"Furnishings"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "8fdb158b-bed5-4eac-a6dc-bc69275f1ac7",
              },
            ],
            field_option: [],
          },
          {
            field_id: "b69182a9-dc96-472b-aa31-b1f2f92ec78b",
            field_name: "Level 2 Minor Group Description",
            field_description: null,
            field_is_required: true,
            field_type: "TEXT",
            field_order: 13,
            field_is_positive_metric: true,
            field_is_read_only: true,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "d1bcfd87-f317-4e1b-92dd-4426c7d091ff",
                request_response: '"Miscellaneous Cast-in-Place Concrete"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "b69182a9-dc96-472b-aa31-b1f2f92ec78b",
              },
              {
                request_response_id: "21df2507-5fc3-4429-a0cc-9ec4a8c58d64",
                request_response: '"None"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "b69182a9-dc96-472b-aa31-b1f2f92ec78b",
              },
            ],
            field_option: [],
          },
          {
            field_id: "159c86c3-dda6-4c8a-919f-50e1674659bd",
            field_name: "Preferred Supplier",
            field_description: null,
            field_is_required: false,
            field_type: "DROPDOWN",
            field_order: 14,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "01bc1db1-3f4f-4eb0-ba7e-2685f9073b1f",
                request_response:
                  '"CEMENT MANUFACTURERS ASSOCIATION OF THE PHILS. INC"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "159c86c3-dda6-4c8a-919f-50e1674659bd",
              },
            ],
            field_option: [],
          },
          {
            field_id: "0f16209f-493c-4933-990f-e82f01a6c283",
            field_name: "GRADE",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 15,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "6e4a5ae7-e9c5-4883-931d-fdfdb46e9d01",
                request_response: '"#1"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "0f16209f-493c-4933-990f-e82f01a6c283",
              },
            ],
            field_option: [],
          },
          {
            field_id: "41d4fd21-2661-4966-b0c9-e66a3b6826ea",
            field_name: "SIZE IN DIAMETER",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 15,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "f0d909e3-9b33-4120-b03d-9d17dde95a77",
                request_response: '"400 Millimetre"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "41d4fd21-2661-4966-b0c9-e66a3b6826ea",
              },
            ],
            field_option: [],
          },
          {
            field_id: "7b4607e6-7670-41b9-aa05-a43d7f97d6b6",
            field_name: "CLASSIFICATION",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 15,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "50c1184c-6357-4a39-be2c-053567dca9e1",
                request_response: '"Gravel"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "7b4607e6-7670-41b9-aa05-a43d7f97d6b6",
              },
            ],
            field_option: [],
          },
          {
            field_id: "abd00c83-d18a-487c-8ff7-c6233f2090f3",
            field_name: "TYPE",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 15,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "7fe0077a-a7a8-454f-b7d6-e18f0e025af9",
                request_response: '"TYPE II"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "abd00c83-d18a-487c-8ff7-c6233f2090f3",
              },
            ],
            field_option: [],
          },
          {
            field_id: "d19ff081-682d-4031-aea7-b8961cf218ee",
            field_name: "TYPE",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 15,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "ffee9bcb-3ee4-47ab-ab1f-461ea0b9b512",
                request_response: '"Clear Rock"',
                request_response_duplicatable_section_id:
                  "0f32acb0-e6e2-43f0-a6fe-47d4307a02b6",
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "d19ff081-682d-4031-aea7-b8961cf218ee",
              },
            ],
            field_option: [],
          },
          {
            field_id: "ee78f1c7-1ed7-44e2-8124-ff3efcd0a737",
            field_name: "BRAND",
            field_description: null,
            field_is_required: true,
            field_type: "DROPDOWN",
            field_order: 15,
            field_is_positive_metric: true,
            field_is_read_only: false,
            field_section_id: "0672ef7d-849d-4bc7-81b1-7a5eefcc1451",
            field_response: [
              {
                request_response_id: "5600156d-594f-45fc-a4b8-c43dab3c6e13",
                request_response: '"HOLCIM"',
                request_response_duplicatable_section_id: null,
                request_response_request_id:
                  "4decb859-9744-4132-8ccb-f841a2fbd5f3",
                request_response_field_id:
                  "ee78f1c7-1ed7-44e2-8124-ff3efcd0a737",
              },
            ],
            field_option: [],
          },
        ],
      },
    ],
  },
  request_team_member: {
    team_member_team_id: "a5a28977-6956-45c1-a624-b9e90911502e",
    team_member_user: {
      user_id: "bbfdaee2-2183-44cc-98a9-71421054a750",
      user_first_name: "John",
      user_last_name: "Doe",
      user_username: "johndoe",
      user_avatar: "",
      user_job_title: "",
    },
  },
  request_signer: [
    {
      request_signer_id: "4f7662bd-122b-4527-9da8-9770d2b06905",
      request_signer_status: "PENDING",
      request_signer_status_date_updated: null,
      request_signer_request_id: "",
      request_signer_signer_id: "",
      request_signer_signer: {
        signer_id: "37067546-44b2-4bfa-a952-b0332e98298c",
        signer_is_primary_signer: true,
        signer_action: "Approved",
        signer_order: 1,
        signer_team_member: {
          team_member_id: "d9c6c738-8a60-43de-965f-f1f666da1639",
          team_member_user: {
            user_id: "f158102c-2ca5-4020-8d5b-c114501b18c1",
            user_first_name: "Jane",
            user_last_name: "Doe",
            user_job_title: "Sales Management",
            user_signature_attachment_id: null,
          },
        },
      },
    },
  ],
  request_project: {
    team_project_name: "PHILIP MORRIS",
  },
};

export const ONBOARDING_REQUISITION_REQUEST_STEP: Step[] = [
  {
    target: ".onboarding-requisition-request-request",
    content: (
      <Box>
        <Title order={4}>Request Details</Title>
        <Text align="center" mt="md" size="sm">
          Provides a quick overview of essential information, including form
          name, requestor, date created, status, request ID, requesting project,
          and Jira ID.
        </Text>
      </Box>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: ".onboarding-requisition-request-pdf",
    content: (
      <Box>
        <Title order={4}>Export to PDF</Title>
        <Text align="center" mt="md" size="sm">
          Click this button to generate a PDF version of the request for easy
          sharing and documentation.
        </Text>
      </Box>
    ),
    placement: "bottom",
  },
  {
    target: ".onboarding-requisition-request-main",
    content: (
      <Box>
        <Title order={4}>Main Section</Title>
        <Text align="center" mt="md" size="sm">
          The &apos;Main Section&apos; displays the request details filled out
          during request creation.
        </Text>
      </Box>
    ),
    placement: "top",
  },
  {
    target: ".onboarding-requisition-request-item",
    content: (
      <Box>
        <Title order={4}>Items Sections</Title>
        <Text align="center" mt="md" size="sm">
          This section displays the specific items requested by the user.
        </Text>
      </Box>
    ),
    placement: "top",
  },

  {
    target: ".onboarding-requisition-request-summary",
    content: (
      <Box>
        <Title order={4}>Summary</Title>
        <Text align="center" mt="md" size="sm">
          Access a tabulated summary of the requested items in the
          &apos;Summary&apos; section.
        </Text>
      </Box>
    ),
    placement: "top",
  },
  {
    target: ".onboarding-requisition-request-action",
    content: (
      <Box>
        <Title order={4}>Request Action</Title>

        <Text align="center" mt="md" size="sm">
          Utilize the &apos;Reference This Request&apos; button to create a new
          request effortlessly by referencing the current one. Edit your
          request, if pending, with the &apos;Edit Request&apos; button. Cancel
          a request anytime with the &apos;Cancel Request&apos; button.
        </Text>
        <Text align="center" mt="md" size="sm">
          Edit your request, if pending, with the &apos;Edit Request&apos;
          button.
        </Text>
        <Text align="center" mt="md" size="sm">
          Cancel a request anytime with the &apos;Cancel Request&apos; button.
        </Text>
      </Box>
    ),
    placement: "top",
  },
  {
    target: ".onboarding-requisition-request-signer",
    content: (
      <Box>
        <Title order={4}>Signers</Title>
        <Text align="center" mt="md" size="sm">
          Easily view the status of each signer for effective tracking and
          management of the request approval process.
        </Text>
      </Box>
    ),
    placement: "top",
  },
  {
    target: ".onboarding-requisition-request-comment",
    content: (
      <Box>
        <Title order={4}>Comments</Title>
        <Text align="center" mt="md" size="sm">
          Use the &apos;Comments&apos; section to add comments, share insights,
          and attach files for enhanced collaboration and communication.
        </Text>
      </Box>
    ),
    placement: "top",
  },
];

export const ONBOARDING_DASHBOARD_QUESTION: OnboardingTestFormValues["sections"] =
  [
    {
      section_id: "e7a77cf8-4831-4049-93d5-4d4264b5d53b",
      section_name: "Dashboard assessment",
      section_order: 1,
      section_is_duplicatable: false,
      section_form_id: "9df4b071-48ec-4b05-9553-4db3c814d4ae",
      section_field: [
        {
          field_id: "7f6448ec-3488-4382-b0cb-e6a83c32dfb1",
          field_name:
            "What information does the 'Total Requests' section provide?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "e7a77cf8-4831-4049-93d5-4d4264b5d53b",
          field_option: createOptionArray(
            "7f6448ec-3488-4382-b0cb-e6a83c32dfb1",
            [
              "Request ID breakdown",
              "Status percentages breakdown",
              "Monthly activity overview",
              "Top requestors breakdown",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "07b9b6e6-5a68-4c0e-a661-09cee967370d",
          field_name:
            "How do you identify the breakdown of request status in the 'Top Requestor' section?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 2,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "e7a77cf8-4831-4049-93d5-4d4264b5d53b",
          field_option: createOptionArray(
            "07b9b6e6-5a68-4c0e-a661-09cee967370d",
            [
              "Hover over their bar",
              "Click on their name",
              "Use the 'Form Filter'",
              "Check the 'Date Created Filter'",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "8b80e4f0-4c7e-47f3-80fe-c8ff52187738",
          field_name:
            "Which section allows you to view the top contributor in signing requests?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 3,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "e7a77cf8-4831-4049-93d5-4d4264b5d53b",
          field_option: createOptionArray(
            "8b80e4f0-4c7e-47f3-80fe-c8ff52187738",
            [
              "Total Requests",
              "Top Requestor",
              "Monthly Statistics",
              "Top Signer",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "ed34e7d9-d6ac-47cd-aa14-7403ea4d47db",
          field_name: "What does the 'Monthly Statistics' feature provide?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 4,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "e7a77cf8-4831-4049-93d5-4d4264b5d53b",
          field_option: createOptionArray(
            "ed34e7d9-d6ac-47cd-aa14-7403ea4d47db",
            [
              "Status percentages",
              "Number of requests for each month",
              "Breakdown of top signers",
              "Top requestor details",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "f0a90d87-c478-4fd3-bcc6-ec7b4a68d8c9",
          field_name:
            "How can you personalize your dashboard experience by focusing on specific forms?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 5,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "e7a77cf8-4831-4049-93d5-4d4264b5d53b",
          field_option: createOptionArray(
            "f0a90d87-c478-4fd3-bcc6-ec7b4a68d8c9",
            [
              "Use the 'Form Filter'",
              "Check 'Top Requestor' details",
              "Utilize the 'Date Created Filter'",
              "Refer to 'Monthly Statistics'",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "2c8ccaf1-26b6-43b7-9c24-16b4216adde8",
          field_name:
            "Which filter allows you to choose a custom time frame for request filtering?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 6,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "e7a77cf8-4831-4049-93d5-4d4264b5d53b",
          field_option: createOptionArray(
            "2c8ccaf1-26b6-43b7-9c24-16b4216adde8",
            [
              "Top Signer",
              "Form Filter",
              "Date Created Filter",
              "Total Requests",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "c516b61f-bbb8-4f3e-8710-b0d17f42f247",
          field_name:
            "What does the 'Date Created Filter' offer in terms of preset options?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 7,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "e7a77cf8-4831-4049-93d5-4d4264b5d53b",
          field_option: createOptionArray(
            "c516b61f-bbb8-4f3e-8710-b0d17f42f247",
            [
              "Last 3 days, 10 days, 20 days, 60 days",
              "Last 7 days, 14 days, 30 days, 90 days",
              "Last week, last month, last quarter, last year",
              "Past week, past month, past 3 months, past 6 months",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
      ],
    },
  ];

export const ONBOARDING_DASHBOARD_ANSWER: OnboardAnswer[] = [
  {
    fieldId: "7f6448ec-3488-4382-b0cb-e6a83c32dfb1",
    response: "Status percentages breakdown",
  },
  {
    fieldId: "07b9b6e6-5a68-4c0e-a661-09cee967370d",
    response: "Hover over their bar",
  },
  {
    fieldId: "8b80e4f0-4c7e-47f3-80fe-c8ff52187738",
    response: "Top Signer",
  },
  {
    fieldId: "ed34e7d9-d6ac-47cd-aa14-7403ea4d47db",
    response: "Number of requests for each month",
  },
  {
    fieldId: "f0a90d87-c478-4fd3-bcc6-ec7b4a68d8c9",
    response: "Use the 'Form Filter'",
  },
  {
    fieldId: "2c8ccaf1-26b6-43b7-9c24-16b4216adde8",
    response: "Date Created Filter",
  },
  {
    fieldId: "c516b61f-bbb8-4f3e-8710-b0d17f42f247",
    response: "Last 7 days, 14 days, 30 days, 90 days",
  },
];

export const ONBOARDING_REQUISITION_REQUEST_QUESTION: OnboardingTestFormValues["sections"] =
  [
    {
      section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
      section_name: "Requisition request assessment",
      section_order: 1,
      section_is_duplicatable: false,
      section_form_id: "9df4b071-48ec-4b05-9553-4db3c814d4ae",
      section_field: [
        {
          field_id: "4096314c-e4ef-43dd-96c1-4e6470e42120",
          field_name:
            "Which section provides a quick overview of essential information, including form name, requestor, date created, status, request ID, requesting project, and Jira ID?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "4096314c-e4ef-43dd-96c1-4e6470e42120",
            [
              "Request Action",
              "Main Section",
              "Request Details",
              "Items Section",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "3a8268f5-0a72-41dc-a12c-ecb3796bb2b5",
          field_name: "What does the 'Export to PDF' feature allow you to do",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "3a8268f5-0a72-41dc-a12c-ecb3796bb2b5",
            [
              "Edit a request",
              "Generate a PDF version for sharing and documentation",
              "Cancel a request",
              "Add comments",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "1efe0e30-22de-4e3b-b7a6-c8bb31bd8e61",
          field_name: "Which section displays the Date Needed",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "1efe0e30-22de-4e3b-b7a6-c8bb31bd8e61",
            ["Request Details", "Summary", "Main Section", "Signers"]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "a1fb2040-3c98-42c6-bf67-0890ccce2ff5",
          field_name: "What does the 'Items Section' display?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "a1fb2040-3c98-42c6-bf67-0890ccce2ff5",
            [
              "Tabulated summary of requested items",
              "Request details",
              "Specific items requested",
              "Status of each signer",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "d2cfa168-d6c9-47fb-ae38-7b410a066008",
          field_name:
            "Where can you access a tabulated summary of the requested items?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "d2cfa168-d6c9-47fb-ae38-7b410a066008",
            ["Request Action", "Items Section", "Summary", "Main Section"]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "d7333d99-caa3-4295-b120-46008877b9d3",
          field_name:
            "What actions can you perform in the 'Request Action' section?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "d7333d99-caa3-4295-b120-46008877b9d3",
            [
              "Cancel a request",
              "Reference an existing request",
              "Edit a request",
              "All of the above",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "3b33eafa-e4c5-4e32-adee-c91683abeb5d",
          field_name:
            "Where can you view the status of each signer for effective tracking?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "3b33eafa-e4c5-4e32-adee-c91683abeb5d",
            ["Signers", "Items Section", "Request Details", "Main Section"]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "4887e0d9-2c01-4360-b160-0336c352b5e0",
          field_name:
            "What can you do in the 'Comments' section to enhance collaboration?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "4887e0d9-2c01-4360-b160-0336c352b5e0",
            [
              "Edit or delete comments",
              "Attach files",
              "View attachments",
              "All of the above",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "b604cdc8-4c7e-4448-be90-78d4fd927e4b",
          field_name:
            "How can you manage your comments in the 'Comments' section?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "b604cdc8-4c7e-4448-be90-78d4fd927e4b",
            [
              "Edit or delete comments",
              "Download attached files",
              "View all attachments",
              "Cancel a request",
            ]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
        {
          field_id: "66dff7fe-4fcf-4961-a173-936b8d378dfb",
          field_name:
            "Which section allows you to add comments, share insights, and attach files for comprehensive communication?",
          field_description: null,
          field_is_required: true,
          field_type: "DROPDOWN",
          field_order: 1,
          field_is_positive_metric: true,
          field_is_read_only: false,
          field_section_id: "7de1c8c2-1489-4fe7-a61f-6ef8743528a4",
          field_option: createOptionArray(
            "66dff7fe-4fcf-4961-a173-936b8d378dfb",
            ["Items Section", "Signers", "Request Action", "Comments"]
          ),

          field_response: "",
          field_section_duplicatable_id: "",
        },
      ],
    },
  ];

export const ONBOARDING_REQUISITION_REQUEST_ANSWER: OnboardAnswer[] = [
  {
    fieldId: "4096314c-e4ef-43dd-96c1-4e6470e42120",
    response: "Request Details",
  },
  {
    fieldId: "3a8268f5-0a72-41dc-a12c-ecb3796bb2b5",
    response: "Generate a PDF version for sharing and documentation",
  },
  {
    fieldId: "1efe0e30-22de-4e3b-b7a6-c8bb31bd8e61",
    response: "Main Section",
  },
  {
    fieldId: "a1fb2040-3c98-42c6-bf67-0890ccce2ff5",
    response: "Specific items requested",
  },
  {
    fieldId: "d2cfa168-d6c9-47fb-ae38-7b410a066008",
    response: "Summary",
  },
  {
    fieldId: "d7333d99-caa3-4295-b120-46008877b9d3",
    response: "All of the above",
  },
  {
    fieldId: "3b33eafa-e4c5-4e32-adee-c91683abeb5d",

    response: "Signers",
  },
  {
    fieldId: "4887e0d9-2c01-4360-b160-0336c352b5e0",
    response: "All of the above",
  },
  {
    fieldId: "b604cdc8-4c7e-4448-be90-78d4fd927e4b",
    response: "Edit or delete comments",
  },
  {
    fieldId: "66dff7fe-4fcf-4961-a173-936b8d378dfb",
    response: "Comments",
  },
];
