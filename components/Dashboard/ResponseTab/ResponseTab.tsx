import { Container, Paper } from "@mantine/core";
import SearchKeywordResponse from "./SearchKeywordResponse";

type ResponseTabProps = {
  selectedForm: string | null;
  selectedFormName: string | null;
  isOTPForm: boolean;
  activeTeamId: string;
};

const ResponseTab = ({
  selectedForm,
  // selectedFormName,
  isOTPForm,
}: // activeTeamId,
ResponseTabProps) => {
  // const supabaseClient = useSupabaseClient();

  // // swr fetching
  // const { requestList, isLoading } = useFetchRequestListByForm({
  //   teamId: activeTeamId,
  //   formId: selectedForm,
  //   supabaseClient,
  // });

  // const approvedRequestList =
  //   selectedFormName !== "Receiving Inspecting Report"
  //     ? requestList.filter((request) => request.request_status === "APPROVED")
  //     : requestList;

  // const sectionList = approvedRequestList.flatMap(
  //   (request) => request.request_form.form_section
  // );

  // const fieldResponseData = isOTPForm
  //   ? generateFormslyResponseData(sectionList, `${selectedFormName}`)
  //   : getRequestFormData(sectionList);

  return (
    <Container p={0} pos="relative">
      {/* <LoadingOverlay visible={isLoading} overlayBlur={2} /> */}

      <Paper p="md" pos="relative">
        {isOTPForm ? null : (
          <SearchKeywordResponse selectedForm={selectedForm} />
        )}
      </Paper>

      {/* {fieldResponseData && fieldResponseData.length > 0 ? (
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
      )} */}
    </Container>
  );
};

export default ResponseTab;
