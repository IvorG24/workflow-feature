import {
  ActionIcon,
  Button,
  Checkbox,
  Container,
  Flex,
  Pagination,
  Select,
  Table,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useState } from "react";
import { AddCircle, Search } from "../Icon";
import styles from "./FormsPage.module.scss";
import FormsRow from "./FormsRow";

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

  return (
    <Container p={0}>
      <Title order={3} my="md">
        Forms
      </Title>
      <Flex wrap="wrap" gap="xs" my="lg" justify="space-between">
        <form>
          <Flex wrap="wrap" gap="xs" justify="stretch">
            <TextInput
              className={styles.input}
              placeholder="Search"
              rightSection={
                <ActionIcon>
                  <Search />
                </ActionIcon>
              }
            />
            <Select
              className={styles.input}
              placeholder="Status"
              data={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
            <DatePicker placeholder="Date" className={styles.input} />
          </Flex>
        </form>
        <Button rightIcon={<AddCircle />} variant="subtle">
          Create a Form
        </Button>
      </Flex>

      <Table mt="sm">
        <thead
          className={
            colorScheme === "dark" ? styles.darkColor : styles.lightColor
          }
        >
          <tr>
            <th>
              <Checkbox size="xs" label={<Text>Id</Text>} />
            </th>
            <th>Title</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <FormsRow key={form.id} form={form} />
          ))}
        </tbody>
      </Table>
      <Flex justify="flex-end" mt="lg">
        <Pagination page={activePage} onChange={setPage} total={20} />
      </Flex>
    </Container>
  );
};

export default FormList;
