import useFetchRequestListByForm from "@/hooks/useFetchRequestListByForm";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  generateFormslyResponseData,
  getRequestFormData,
} from "@/utils/arrayFunctions/dashboard";
import { Alert, Box, Container, LoadingOverlay, Paper } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconAlertCircle } from "@tabler/icons-react";
import RequisitionTab from "../RequisitionTab/RequisitionTab";
import RequestResponseSection from "./ResponseSection/RequestResponseSection";
import SearchKeywordResponse from "./SearchKeywordResponse";

type ResponseTabProps = {
  selectedForm: string | null;
  selectedFormName: string | null;
  isOTPForm: boolean;
};

const ResponseTab = ({
  selectedForm,
  selectedFormName,
  isOTPForm,
}: ResponseTabProps) => {
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();

  // // swr fetching
  const { requestList, isLoading } = useFetchRequestListByForm({
    teamId: activeTeam.team_id,
    formId: selectedForm,
    supabaseClient,
  });

  const approvedRequestList =
    selectedFormName !== "Receiving Inspecting Report"
      ? requestList.filter((request) => request.request_status === "APPROVED")
      : requestList;

  const sectionList = approvedRequestList.flatMap(
    (request) => request.request_form.form_section
  );

  const fieldResponseData = isOTPForm
    ? generateFormslyResponseData(sectionList, `${selectedFormName}`)
    : getRequestFormData(sectionList);

  return (
    <Container p={0} pos="relative">
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      {/* <Paper p="md" pos="relative">
        {isOTPForm ? // <OTPSearch />
        null : (
          <SearchKeywordResponse selectedForm={selectedForm} />
        )}
      </Paper> */}

      {!isOTPForm && (
        <Paper p="md" pos="relative">
          {" "}
          <SearchKeywordResponse selectedForm={selectedForm} />{" "}
        </Paper>
      )}

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
