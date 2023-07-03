import { getResponseDataByKeyword } from "@/backend/api/get";
import {
  generateFormslyResponseData,
  getRequestFormData,
  searchResponseReducer,
} from "@/utils/arrayFunctions/dashboard";
import {
  RequestByFormType,
  ResponseDataType,
  SearchKeywordResponseType,
} from "@/utils/types";
import {
  Alert,
  Box,
  Button,
  Container,
  Flex,
  Group,
  LoadingOverlay,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconAlertCircle,
  IconMessageSearch,
  IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import RequisitionTab from "../RequisitionTab/RequisitionTab";
import RequestResponseSection from "./ResponseSection/RequestResponseSection";
import SearchResponseTable from "./ResponseSection/SearchResponseTable";

type ResponseDataProps = {
  selectedForm: string | null;
  isOTPForm: boolean;
  requestList: RequestByFormType[];
};

type FormValues = {
  search: string;
};

const ResponseTab = ({
  selectedForm,
  isOTPForm,
  requestList,
}: ResponseDataProps) => {
  const supabaseClient = useSupabaseClient();
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [searchKeywordResponse, setSearchKeywordResponse] = useState<
    ResponseDataType[] | null
  >(null);

  const { handleSubmit, register } = useForm<FormValues>();

  const approvedRequestList = requestList.filter(
    (request) => request.request_status === "APPROVED"
  );

  const sectionList = approvedRequestList.flatMap(
    (request) => request.request_form.form_section
  );

  const fieldResponseData = isOTPForm
    ? generateFormslyResponseData(sectionList)
    : getRequestFormData(sectionList);

  const handleSearchByKeyword = async (data: FormValues) => {
    try {
      setIsFetchingData(true);
      if (!data.search) {
        setSearchKeywordResponse(null);
        return;
      }

      const searchData = await getResponseDataByKeyword(supabaseClient, {
        formId: selectedForm as string,
        keyword: data.search,
      });
      const reducedSearchData = searchResponseReducer(
        searchData as SearchKeywordResponseType[]
      );
      setSearchKeywordResponse(reducedSearchData);
    } catch (error) {
      notifications.show({
        title: "Can't fetch data at the moment.",
        message: "Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  return (
    <Container p={0} fluid>
      <Paper p="md" pos="relative">
        <LoadingOverlay visible={isFetchingData} overlayBlur={2} />
        <form onSubmit={handleSubmit(handleSearchByKeyword)}>
          <Group spacing={8}>
            <TextInput
              w="100%"
              maw={300}
              placeholder="Search response data by keyword"
              icon={<IconSearch size="16px" />}
              {...register("search")}
            />
            <Button type="submit">Search</Button>
          </Group>
        </form>
        {searchKeywordResponse ? (
          <Paper my="md" p="md" w={{ base: "100%" }}>
            <Group>
              <IconMessageSearch />
              <Title order={3}>Keyword Search Data</Title>
            </Group>

            {searchKeywordResponse.length > 0 ? (
              <Flex wrap="wrap" gap="md" justify="center">
                {searchKeywordResponse.map((response, idx) => (
                  <SearchResponseTable
                    key={response.label + idx}
                    response={response}
                  />
                ))}
              </Flex>
            ) : (
              <Text>No matching results found.</Text>
            )}
          </Paper>
        ) : (
          <Alert mt="md" icon={<IconAlertCircle size="1rem" />} color="blue">
            Type in a keyword and search.
          </Alert>
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
