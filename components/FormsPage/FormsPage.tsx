import { FetchTeamRequestFormList } from "@/utils/queries";
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
import { ceil } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import { AddCircle, Search } from "../Icon";
import styles from "./FormsPage.module.scss";
import FormsTable from "./FormsTable";

type Props = {
  teamRequestFormList: FetchTeamRequestFormList;
};

const FORMS_PER_PAGE = 8;

const FormList = ({ teamRequestFormList }: Props) => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(1);
  const { colorScheme } = useMantineColorScheme();

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
          onClick={async () =>
            await router.push(`/t/${router.query.tid}/forms/build`)
          }
        >
          Create a Form
        </Button>
      </Group>

      <FormsTable
        formList={teamRequestFormList.teamRequestFormList}
        colorScheme={colorScheme}
      />
      <Flex justify="flex-end" mt="xl">
        <Pagination
          page={activePage}
          onChange={setActivePage}
          total={ceil((teamRequestFormList.count as number) / FORMS_PER_PAGE)}
        />
      </Flex>
    </Container>
  );
};

export default FormList;
