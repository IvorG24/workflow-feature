import { getResponseDataByKeyword } from "@/backend/api/get";
import { searchResponseReducer } from "@/utils/arrayFunctions/dashboard";
import {
  RequestResponseDataType,
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
  Stack,
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
import ResponseSection from "./ResponseSection/ResponseSection";
import ResponseTable from "./ResponseTable";

type ResponseDataProps = {
  selectedForm: string | null;
  fieldResponseData: RequestResponseDataType[];
};

type FormValues = {
  search: string;
};

const ResponseTab = ({
  selectedForm,
  fieldResponseData,
}: ResponseDataProps) => {
  const supabaseClient = useSupabaseClient();
  const [isFetchingData, setIsFetchingData] = useState(false);

  const [searchKeywordResponse, setSearchKeywordResponse] = useState<
    ResponseDataType[] | null
  >(null);

  const { handleSubmit, register } = useForm<FormValues>();

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

      {fieldResponseData && fieldResponseData.length > 0 && (
        <Stack>
          {fieldResponseData.map((response, idx) => (
            <ResponseSection
              key={response.sectionLabel + idx}
              responseSection={response}
            />
          ))}
        </Stack>
      )}

      {!fieldResponseData && !searchKeywordResponse && (
        <Title mt="xl" order={3} align="center">
          No data available.
        </Title>
      )}
    </Container>
  );
};

export default ResponseTab;
