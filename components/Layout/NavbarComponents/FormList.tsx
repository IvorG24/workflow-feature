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
import { useState } from "react";

const mockForms = [
  {
    id: "097ea589-b9b4-4076-95ff-2445fd829a33",
    name: "ultrices posuere cubilia curae form",
  },
  {
    id: "bb9d4eb7-3a95-4ebe-ba1d-6078964b8f50",
    name: "enim sit form",
  },
  {
    id: "9afa508e-5522-46e6-959b-8dd73e24ec22",
    name: "velit donec form",
  },
  {
    id: "820ecf58-7043-4801-b1e8-164255cab87f",
    name: "quisque form",
  },
  {
    id: "481ed4c1-a41d-42a1-af79-6566cd602e9a",
    name: "platea dictumst aliquam augue form",
  },
  {
    id: "7543f42e-6b17-4c0f-88e4-28ac1fe6e471",
    name: "nunc proin at form",
  },
  {
    id: "e283e7a3-5ba2-46b9-8840-61a16e92e65a",
    name: "nonummy maecenas form",
  },
  {
    id: "f51db83d-f17f-4f76-b27d-455ae8fc9c99",
    name: "eu nibh quisque form",
  },
  {
    id: "ec764030-1f20-4493-9943-c2aabaddd9d3",
    name: "nulla quisque arcu form",
  },
  {
    id: "2ed9e92a-0483-4a27-926e-5f743a30b88a",
    name: "pede justo lacinia eget form",
  },
  {
    id: "c2330ede-eb22-404b-b1a3-07a28dcf0ec2",
    name: "ac leo form",
  },
  {
    id: "e22972e5-2466-44b8-abeb-73b6f82ce4b3",
    name: "justo nec form",
  },
  {
    id: "c42b0050-9dda-46ba-832e-2b012a7819f0",
    name: "est quam form",
  },
  {
    id: "b2675afc-7c07-46d1-8c3a-281d5874610b",
    name: "at vulputate vitae form",
  },
  {
    id: "4c312b5d-11fc-4ab1-82a5-78c4ac34bb58",
    name: "cubilia curae mauris viverra form",
  },
  {
    id: "b9d12ae8-9736-4d3b-b27e-bf6440d021d6",
    name: "convallis morbi form",
  },
  {
    id: "e3d05f05-6ad0-471d-a38e-2fc5f4afcaf4",
    name: "purus aliquet at feugiat form",
  },
  {
    id: "e775843b-78d7-4cc4-9628-200fdbbfc429",
    name: "quis form",
  },
  {
    id: "c6952566-3d24-4d1a-a8ca-885c8addd75b",
    name: "amet diam form",
  },
  {
    id: "69eb3b56-9fa2-4aea-bb00-31cf005e45fe",
    name: "blandit nam nulla form",
  },
];

const FormList = () => {
  const [formList, setFormList] = useState(mockForms);

  const handleSearchForm = (value: string) => {
    if (!value) {
      return setFormList(mockForms);
    }
    const filteredFormList = mockForms.filter((form) =>
      form.name.toLowerCase().includes(value.toLowerCase())
    );
    setFormList(filteredFormList);
  };

  return (
    <Box h="fit-content">
      <Group mb="sm" position="apart">
        <Text mb={4} size="xs" weight={400}>
          Forms {`(${mockForms.length})`}
        </Text>
        <Button variant="light" size="xs">
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
        data={formList?.map((form) => form.name) as string[]}
      />
      <ScrollArea h={{ base: 400, sm: 500 }}>
        <Stack mt="sm" spacing={0}>
          {formList.map((form) => (
            <NavLink
              key={form.id}
              label={form.name}
              rightSection={<IconPlus size={14} />}
            />
          ))}
        </Stack>
      </ScrollArea>
    </Box>
  );
};

export default FormList;
