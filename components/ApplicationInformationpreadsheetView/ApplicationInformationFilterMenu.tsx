import { Button, Drawer, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons-react";

const ApplicationInformationFilterMenu = () => {
  const [isFilterMenuOpen, { open: openFilterMenu, close: closeFilterMenu }] =
    useDisclosure(false);

  return (
    <>
      <Button leftIcon={<IconFilter size={16} />} onClick={openFilterMenu}>
        Filter
      </Button>
      <Drawer
        opened={isFilterMenuOpen}
        onClose={closeFilterMenu}
        position="right"
        title="Spreadsheet Filter Menu"
      >
        <Stack p="sm">
          <Button type="submit">Apply Filter</Button>
        </Stack>
      </Drawer>
    </>
  );
};

export default ApplicationInformationFilterMenu;
