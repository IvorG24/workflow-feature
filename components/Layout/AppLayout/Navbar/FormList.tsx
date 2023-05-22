import { useStore } from "@/utils/store";
import { FormTableRow } from "@/utils/types";
import {
  Autocomplete,
  Box,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { capitalize, lowerCase } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const FormList = () => {
  const store = useStore();
  const forms = store.formList;
  const router = useRouter();

  const [formList, setFormList] = useState<FormTableRow[]>([]);

  useEffect(() => {
    setFormList(store.formList);
  }, [store.formList]);

  const handleSearchForm = (value: string) => {
    if (!value) {
      return setFormList(forms);
    }
    const filteredFormList = forms.filter((form) =>
      form.form_name.toLowerCase().includes(value.toLowerCase())
    );
    setFormList(filteredFormList);
  };

  return (
    <Box h="fit-content">
      <Group mb="sm" position="apart">
        <Text mb={4} size="xs" weight={400}>
          {capitalize(store.activeApp)} Forms {`(${forms.length})`}
        </Text>
        <Button
          variant="light"
          size="xs"
          onClick={() =>
            router.push(`/team-${lowerCase(store.activeApp)}s/forms/build`)
          }
        >
          Build Form
        </Button>
      </Group>
      <Autocomplete
        placeholder="Search forms"
        size="xs"
        icon={<IconSearch size={12} stroke={1.5} />}
        rightSectionWidth={70}
        styles={{ rightSection: { pointerEvents: "none" } }}
        onChange={handleSearchForm}
        data={formList?.map((form) => form.form_name) as string[]}
      />
      <ScrollArea h={{ base: 400, sm: 500 }} mt="xs" scrollbarSize={5}>
        <Stack mt="sm" spacing={0}>
          {formList.map((form) => (
            <NavLink
              key={form.form_id}
              label={form.form_name}
              rightSection={<IconPlus size={14} />}
              onClick={() =>
                router.push(
                  `/team-${lowerCase(store.activeApp)}s/forms/${
                    form.form_id
                  }/create`
                )
              }
            />
          ))}
        </Stack>
      </ScrollArea>
    </Box>
  );
};

export default FormList;
