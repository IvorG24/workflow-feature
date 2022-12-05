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
import { useRouter } from "next/router";
import { useState } from "react";
import { AddCircle, Search } from "../Icon";
import styles from "./FormsPage.module.scss";
import FormsTable from "./FormsTable";

export type Form = {
  id: string;
  title: string;
  status: string;
  updated_at: string;
};

const forms: Form[] = [
  {
    id: "4438",
    title: "Request Form",
    status: "Active",
    updated_at: "January 5, 2022",
  },
  {
    id: "4439",
    title: "Peer Review Form",
    status: "Active",
    updated_at: "February 5, 2022",
  },
  {
    id: "4440",
    title: "Request Form",
    status: "Inactive",
    updated_at: "March 5, 2022",
  },
  {
    id: "4441",
    title: "Peer Review Form",
    status: "Active",
    updated_at: "April 5, 2022",
  },
];

const FormList = () => {
  const [activePage, setPage] = useState(1);
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const { tid } = router.query;

  // todo: fetch forms backend
  // todo: add actual filtering

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
          onClick={() => router.push(`/t/${tid}/forms/create?step=1`)}
        >
          Create a Form
        </Button>
      </Group>

      <FormsTable forms={forms} colorScheme={colorScheme} />
      <Flex justify="flex-end" mt="xl">
        <Pagination page={activePage} onChange={setPage} total={20} />
      </Flex>
    </Container>
  );
};

export default FormList;
