import { Box, Container, Paper } from "@mantine/core";
import RequsitionSearch from "../ItemSearch";
import ItemTab from "../ItemTab/ItemTab";
import RequestResponseSection from "./ResponseSection/RequestResponseSection";
import SearchKeywordResponse from "./SearchKeywordResponse";

type ResponseTabProps = {
  selectedForm: string | null;
  selectedFormName: string | null;
  isRequsitionForm: boolean;
  activeTeamId: string;
};

const ResponseTab = ({
  selectedForm,
  // selectedFormName,
  isRequsitionForm,
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

  // const fieldResponseData = isRequsitionForm
  //   ? generateFormslyResponseData(sectionList, `${selectedFormName}`)
  //   : getRequestFormData(sectionList);

  return (
    <Container p={0} pos="relative">
      {/* <LoadingOverlay visible={isLoading} overlayBlur={2} /> */}

      <Paper p="md" pos="relative">
        {isRequsitionForm ? (
          <RequsitionSearch />
        ) : (
          <SearchKeywordResponse selectedForm={selectedForm} />
        )}
      </Paper>

      <Box>
        {isRequsitionForm ? (
          <Box mt="md">
            <ItemTab fieldResponseData={[]} />
          </Box>
        ) : (
          <RequestResponseSection requestResponse={[]} />
        )}
      </Box>

      {/* {fieldResponseData && fieldResponseData.length > 0 ? (
        <Box>
          {isRequsitionForm ? (
            <Box mt="md">
              <ItemTab fieldResponseData={fieldResponseData} />
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
