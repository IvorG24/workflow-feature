import { getResponseDataByKeyword } from "@/backend/api/get";
import { searchResponseReducer } from "@/utils/arrayFunctions/dashboard";
import {
  RequestResponseDataType,
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
  IconBolt,
  IconMessageSearch,
  IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormslyFormResponseSection from "./ResponseSection/FormslyFormResponseSection";
import RequestResponseSection from "./ResponseSection/RequestResponseSection";
import SearchResponseTable from "./ResponseSection/SearchResponseTable";

type ResponseDataProps = {
  selectedForm: string | null;
  fieldResponseData: RequestResponseDataType[] | null;
  isOTPForm: boolean;
};

type FormValues = {
  search: string;
};

const ResponseTab = ({
  selectedForm,
  fieldResponseData,
  isOTPForm,
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
      {fieldResponseData && fieldResponseData.length > 0 ? (
        <Box>
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
                  <SearchResponseTable
                    key={response.label + idx}
                    response={response}
                  />
                ))}
              </Flex>
              {searchKeywordResponse.length <= 0 && (
                <Text mt="xl">No matching results found.</Text>
              )}
            </Paper>
          )}
          {isOTPForm ? (
            <Paper mt="xl" p="xl">
              <Group spacing="xs">
                <IconBolt />
                <Title order={3}>Field Response Data</Title>
              </Group>
              {fieldResponseData.map((response, idx) => (
                <FormslyFormResponseSection
                  key={response.sectionLabel + idx}
                  responseSection={response}
                />
              ))}
            </Paper>
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
            <Text>No data available.</Text>
          )}
        </Box>
      )}
    </Container>
  );
};

export default ResponseTab;
