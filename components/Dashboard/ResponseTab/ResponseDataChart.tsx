import {
  getRequestListByForm,
  getResponseDataByKeyword,
} from "@/backend/api/get";
import {
  responseFieldReducer,
  searchResponseReducer,
} from "@/utils/arrayFunctions";
import {
  FieldWithResponseType,
  ResponseDataType,
  SearchKeywordResponseType,
} from "@/utils/types";
import {
  Alert,
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
  IconBrandSupabase,
  IconMessageSearch,
  IconSearch,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ResponseTable from "./ResponseTable";

type ResponseDataProps = {
  selectedForm: string | null;
};

type FormValues = {
  search: string;
};

const filteredTypes = ["TEXT", "TEXTAREA", "LINK", "FILE"];

const ResponseDataChart = ({ selectedForm }: ResponseDataProps) => {
  const supabaseClient = useSupabaseClient();
  const prevSelectedFormProp = useRef(selectedForm);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [responseData, setResponseData] = useState<ResponseDataType | null>(
    null
  );
  const [searchKeywordResponse, setSearchKeywordResponse] =
    useState<ResponseDataType | null>(null);

  const { handleSubmit, register, reset } = useForm<FormValues>();

  const handleSearchByKeyword = async (data: FormValues) => {
    try {
      setIsFetchingData(true);
      if (!data.search) return;
      if (selectedForm === null) {
        return notifications.show({
          title: "Please select a form",
          message: "Choose a form from the form filter.",
          color: "orange",
        });
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

  const handleFetchResponseData = async () => {
    try {
      setIsFetchingData(true);
      if (!selectedForm) return;
      const requestList = await getRequestListByForm(supabaseClient, {
        formId: selectedForm,
      });
      const sectionList = requestList.flatMap(
        (request) => request.request_form.form_section
      );
      const fieldWithResponse: FieldWithResponseType = [];
      sectionList.forEach((section) =>
        section.section_field.forEach((field) => fieldWithResponse.push(field))
      );
      const reducedFieldWithResponse = responseFieldReducer(fieldWithResponse);
      const nonDynamicResponseList = reducedFieldWithResponse.filter(
        (field: ResponseDataType[0]) => !filteredTypes.includes(field.type)
      );
      setResponseData(nonDynamicResponseList);
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

  useEffect(() => {
    if (prevSelectedFormProp.current !== selectedForm) {
      //re-fetch data
      handleFetchResponseData();
      reset();
    } else if (!selectedForm) {
      setResponseData(null);
    }
  }, [selectedForm]);

  return (
    <Container mt="sm" p={0} fluid>
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

      <LoadingOverlay visible={isFetchingData} overlayBlur={2} />
      {!selectedForm && (
        <Alert mt="sm" color="yellow" icon={<IconAlertCircle size="1rem" />}>
          Please select a form to generate data.
        </Alert>
      )}

      {searchKeywordResponse && (
        <Paper
          mt="sm"
          p="md"
          w={{ base: "100%", sm: "fit-content" }}
          withBorder
        >
          <Group>
            <IconMessageSearch />
            <Title order={3}>Keyword Search Data</Title>
          </Group>

          <Flex wrap="wrap" gap="md">
            {searchKeywordResponse.map((response, idx) => (
              <ResponseTable key={response.label + idx} response={response} />
            ))}
          </Flex>
          {searchKeywordResponse.length <= 0 && (
            <Text mt="xl">No matching results found.</Text>
          )}
        </Paper>
      )}

      {responseData && responseData.length > 0 ? (
        <Paper
          mt="sm"
          p="md"
          w={{ base: "100%", sm: "fit-content" }}
          withBorder
        >
          <Group>
            <IconBrandSupabase />
            <Title order={3}>Field Response Data</Title>
          </Group>
          <Flex w="100%" wrap="wrap" gap="md">
            {responseData.map((response, idx) => (
              <ResponseTable key={response.label + idx} response={response} />
            ))}
          </Flex>
        </Paper>
      ) : (
        <Title mt="xl" order={3} align="center">
          No data available.
        </Title>
      )}
    </Container>
  );
};

export default ResponseDataChart;
