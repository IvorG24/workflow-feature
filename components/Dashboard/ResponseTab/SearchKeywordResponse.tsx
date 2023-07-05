import { getResponseDataByKeyword } from "@/backend/api/get";
import { searchResponseReducer } from "@/utils/arrayFunctions/dashboard";
import { ResponseDataType, SearchKeywordResponseType } from "@/utils/types";
import {
  Alert,
  Box,
  Button,
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
import SearchResponseTable from "./ResponseSection/SearchResponseTable";

type Props = {
  selectedForm: string | null;
};

type FormValues = {
  search: string;
};

const SearchKeywordResponse = ({ selectedForm }: Props) => {
  const supabaseClient = useSupabaseClient();
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [searchKeywordResponse, setSearchKeywordResponse] = useState<
    ResponseDataType[] | null
  >(null);

  const { handleSubmit, register } = useForm<FormValues>();

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
    <Box>
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
    </Box>
  );
};

export default SearchKeywordResponse;
