import {
  generateFormslyResponseData,
  getRequestFormData,
} from "@/utils/arrayFunctions/dashboard";
import { RequestByFormType } from "@/utils/types";
import { Alert, Box, Container, Paper } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import OTPSearch from "../OTPSearch";
import RequisitionTab from "../RequisitionTab/RequisitionTab";
import RequestResponseSection from "./ResponseSection/RequestResponseSection";
import SearchKeywordResponse from "./SearchKeywordResponse";

type ResponseTabProps = {
  selectedForm: string | null;
  selectedFormName: string | null;
  isOTPForm: boolean;
  requestList: RequestByFormType[];
};

const ResponseTab = ({
  selectedForm,
  selectedFormName,
  isOTPForm,
  requestList,
}: ResponseTabProps) => {
  const approvedRequestList = requestList.filter(
    (request) => request.request_status === "APPROVED"
  );

  const sectionList = approvedRequestList.flatMap(
    (request) => request.request_form.form_section
  );

  const fieldResponseData = isOTPForm
    ? generateFormslyResponseData(sectionList, `${selectedFormName}`)
    : getRequestFormData(sectionList);

  return (
    <Container p={0}>
      <Paper p="md" pos="relative">
        {isOTPForm ? (
          <OTPSearch />
        ) : (
          <SearchKeywordResponse selectedForm={selectedForm} />
        )}
      </Paper>
      {fieldResponseData && fieldResponseData.length > 0 ? (
        <Box>
          {isOTPForm ? (
            <Box mt="md">
              <RequisitionTab fieldResponseData={fieldResponseData} />
            </Box>
          ) : (
            <RequestResponseSection requestResponse={fieldResponseData} />
          )}
        </Box>
      ) : (
        <Box>
          {!selectedForm ? (
            <Alert icon={<IconAlertCircle size="1rem" />} color="orange">
              Please select a form to generate data.
            </Alert>
          ) : (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="orange"
              mt="md"
            >
              No data available.
            </Alert>
          )}
        </Box>
      )}
    </Container>
  );
};

export default ResponseTab;
