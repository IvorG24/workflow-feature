import { getQueryData } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { jsonToCsv } from "@/utils/string";
import { QueryTableRow } from "@/utils/types";
import {
  Alert,
  Box,
  Button,
  Code,
  Container,
  CopyButton,
  Flex,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Select,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  IconAlertCircle,
  IconCopy,
  IconDownload,
  IconSearch,
  IconSquareCheck,
} from "@tabler/icons-react";
import { useState } from "react";

type Props = {
  queryList: QueryTableRow[];
};

const CommonQueriesPage = ({ queryList }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [dataCount, setDataCount] = useState(0);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [queryLabel, setQueryLabel] = useState("");

  const handleQuerySubmit = async () => {
    if (!selectedQuery) {
      notifications.show({
        message: "Please select a query then try again.",
        color: "orange",
      });
      return;
    }

    try {
      setIsFetchingData(true);
      const data = await getQueryData(supabaseClient, {
        queryId: selectedQuery,
      });
      setData(data);

      const parsedData: [] = JSON.parse(data);
      setDataCount(parsedData.length);

      const label = queryList.find(
        (query) => query.query_id === selectedQuery
      )?.query_name;
      if (label) setQueryLabel(label);

      notifications.show({
        message: "Data fetched.",
        color: "green",
      });
    } catch (error) {
      console.error(error);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleDownloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <LoadingOverlay visible={isFetchingData} overlayBlur={2} />

      <Title order={2}>Common Queries</Title>

      <Select
        width="100%"
        data={queryList.map((query) => ({
          label: query.query_name,
          value: query.query_id,
        }))}
        value={selectedQuery}
        onChange={setSelectedQuery}
        rightSection={
          <Button
            w={40}
            px="xs"
            onClick={handleQuerySubmit}
            sx={{ borderRadius: "0 4px 4px 0" }}
          >
            <IconSearch />
          </Button>
        }
        clearable
        searchable
        mt="md"
      />

      <Paper shadow="md" p="md" mt="md">
        {data !== null ? (
          <Box>
            <Flex justify="space-between">
              <Flex direction="column">
                <Text>{queryLabel}</Text>
                <Text size="xs" color="dimmed">
                  Rows: {dataCount}
                </Text>
              </Flex>
              {dataCount > 0 && (
                <Flex gap="md">
                  <CopyButton value={jsonToCsv(data)}>
                    {({ copied, copy }) =>
                      copied ? (
                        <Button
                          variant="light"
                          color="green"
                          p={8}
                          onClick={copy}
                          leftIcon={<IconSquareCheck size={18} />}
                        >
                          Copied
                        </Button>
                      ) : (
                        <Button
                          variant="light"
                          p={8}
                          onClick={copy}
                          leftIcon={<IconCopy size={18} />}
                        >
                          Copy
                        </Button>
                      )
                    }
                  </CopyButton>

                  <Button
                    variant="light"
                    p={8}
                    onClick={() =>
                      handleDownloadCSV(
                        jsonToCsv(data),
                        `${queryLabel}-${new Date().toISOString()}.csv`
                      )
                    }
                    leftIcon={<IconDownload size={18} />}
                  >
                    Download CSV
                  </Button>
                </Flex>
              )}
            </Flex>

            {dataCount > 0 ? (
              <ScrollArea w={"100%"} h={"100%"}>
                <Code mt="md" block>
                  {jsonToCsv(data)}
                </Code>
              </ScrollArea>
            ) : (
              <Alert icon={<IconAlertCircle size="1rem" />} mt="xl">
                No results found for your search query.
              </Alert>
            )}
          </Box>
        ) : (
          <Alert icon={<IconAlertCircle size="1rem" />}>
            Please select a query
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default CommonQueriesPage;
