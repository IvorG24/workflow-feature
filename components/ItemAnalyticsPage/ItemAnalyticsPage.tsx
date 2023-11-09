import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_ITEM_ANALYTICS_ROWS } from "@/utils/constant";
import { Database } from "@/utils/database";
import {
  Alert,
  Box,
  Button,
  Container,
  Flex,
  LoadingOverlay,
  Pagination,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconAlertCircle } from "@tabler/icons-react";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ItemRow from "./ItemRow";

export type ResultType = {
  request_id: string;
  request_formsly_id: string;
  item_description: {
    field_name: string;
    request_response: string;
  }[];
  csi_code_description: string;
  quantity: string;
  unit_of_measurement: string;
  request_status: string;
};

type Props = {
  itemList: { item_general_name: string }[];
};

const ItemAnalyticsPage = ({ itemList }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();

  const [resultList, setResultList] = useState<ResultType[] | undefined>(
    undefined
  );
  const [resultCount, setResultCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentItem, setCurrentItem] = useState("");
  const [page, setPage] = useState(1);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<{ item: string }>();

  const onSubmit = async ({ item }: { item: string }) => {
    try {
      setIsAnalyzing(true);
      setPage(1);
      const { data, error } = await supabaseClient
        .rpc("analyze_item", {
          input_data: {
            itemName: item,
            teamId: activeTeam.team_id,
            page: 1,
            limit: DEFAULT_ITEM_ANALYTICS_ROWS,
          },
        })
        .select("*");
      if (error) throw error;
      const formattedData = data as unknown as {
        data: ResultType[];
        count: number;
      };

      setCurrentItem(item);
      setResultList(formattedData.data);
      setResultCount(formattedData.count ?? 0);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setPage(page);
    try {
      setIsAnalyzing(true);
      const { data, error } = await supabaseClient
        .rpc("analyze_item", {
          input_data: {
            itemName: currentItem,
            teamId: activeTeam.team_id,
            page: page,
            limit: DEFAULT_ITEM_ANALYTICS_ROWS,
          },
        })
        .select("*");
      if (error) throw error;
      const formattedData = data as unknown as {
        data: ResultType[];
        count: number;
      };
      setResultList(formattedData.data);
      setResultCount(formattedData.count ?? 0);
    } catch (e) {
      console.log("ERROR", e);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Container p={0}>
      <Title color="dimmed" order={2}>
        Item Analytics
      </Title>
      <Paper p="xl" shadow="xs" mt="xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <Controller
              control={control}
              name={"item"}
              rules={{
                required: "Select an item first",
              }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data={itemList.map((item) => {
                    return {
                      label: item.item_general_name,
                      value: item.item_general_name,
                    };
                  })}
                  placeholder="Select Item"
                  label="Item"
                  clearable
                  searchable
                  onChange={onChange}
                  value={value}
                  error={errors.item?.message}
                />
              )}
            />
            <Button
              type="submit"
              sx={{ alignSelf: "flex-end" }}
              loading={isAnalyzing}
              disabled={!activeTeam.team_id}
            >
              Analyze
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper p="xl" shadow="xs" mt="xl" pos="relative">
        <LoadingOverlay visible={isAnalyzing} overlayBlur={2} />
        <Title color="dimmed" order={3} mb="xs">
          {currentItem}
        </Title>
        {resultList && resultList.length !== 0 && (
          <Box sx={{ overflow: "hidden" }}>
            <ScrollArea scrollbarSize={10} offsetScrollbars type="auto">
              <Table
                withBorder
                withColumnBorders
                striped
                highlightOnHover
                sx={(theme) => ({
                  "& th": {
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.blue[9]
                        : theme.colors.blue[2],
                  },
                  overflowX: "scroll",
                })}
              >
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Item Description</th>
                    <th>CSI Code Description</th>
                    <th>Quantity</th>
                    <th>Unit of Measurement</th>
                    <th>Request Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resultList.map((result, index) => {
                    return <ItemRow key={index} result={result} />;
                  })}
                </tbody>
              </Table>
            </ScrollArea>
            <Flex justify="flex-end">
              <Pagination
                value={page}
                onChange={(value) => handlePageChange(value)}
                total={Math.ceil(resultCount / DEFAULT_ITEM_ANALYTICS_ROWS)}
                mt="xl"
              />
            </Flex>
          </Box>
        )}
        {resultList && resultList.length === 0 && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="orange">
            No data found.
          </Alert>
        )}
        {!resultList && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="blue">
            Item is required.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default ItemAnalyticsPage;
