import type { Database, FormRow } from "@/utils/types";
import {
  ActionIcon,
  Button,
  Container,
  Flex,
  Group,
  Pagination,
  Select,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ceil } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AddCircle, Search } from "../Icon";
import styles from "./FormsPage.module.scss";
import FormsTable from "./FormsTable";

const FORMS_PER_PAGE = 8;

const FormList = () => {
  const supabase = useSupabaseClient<Database>();

  const [activePage, setActivePage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const [formList, setFormList] = useState<FormRow[]>([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const { data, error, count } = await supabase
          .from("form_table")
          .select("*")
          .eq("team_id", router.query.tid);
        if (error) throw error;
        setFormList(data);
        setPageCount(Number(count));
      } catch {
        showNotification({
          title: "Error!",
          message: "Failed to fetch Form List",
          color: "red",
        });
      }
    };

    fetchForms();
  }, [supabase, router.query.tid]);

  return (
    <Container p="md" fluid>
      <Title order={1} my="md">
        Forms
      </Title>
      <Group spacing="xs" my="lg" align="top">
        <Group spacing="xs" className={styles.filter}>
          {/* search bar */}
          <TextInput
            className={styles.searchInput}
            placeholder="Search"
            rightSection={
              <ActionIcon>
                <Search />
              </ActionIcon>
            }
          />

          {/* status dropdown */}
          <Select
            className={styles.statusDropdown}
            placeholder="Status"
            data={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />

          {/* date picker */}
          <Select
            className={styles.dateDropdown}
            placeholder="Date"
            data={[
              { value: "7", label: "7 days ago" },
              { value: "30", label: "30 days ago" },
              { value: "90", label: "90 days ago" },
            ]}
          />
        </Group>

        <Button
          rightIcon={<AddCircle />}
          variant="subtle"
          // todo: temporary create form
          onClick={() => router.push(`/t/${router.query.tid}/forms/build`)}
        >
          Create a Form
        </Button>
      </Group>

      <FormsTable forms={formList} colorScheme={colorScheme} />
      <Flex justify="flex-end" mt="xl">
        <Pagination
          page={activePage}
          onChange={setActivePage}
          total={ceil(pageCount / FORMS_PER_PAGE)}
        />
      </Flex>
    </Container>
  );
};

export default FormList;
