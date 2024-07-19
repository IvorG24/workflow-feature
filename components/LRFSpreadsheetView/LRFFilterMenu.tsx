import { OptionType } from "@/utils/types";
import { Button, Drawer, MultiSelect } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons-react";

type Props = {
  projectFilter: string[];
  projectListOptions: OptionType[];
  handleFilterData: (value: string[]) => void;
};

const LRFFilterMenu = ({
  projectFilter,
  projectListOptions,
  handleFilterData,
}: Props) => {
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
        <MultiSelect
          placeholder="Filter by Project"
          data={projectListOptions}
          value={projectFilter}
          onChange={handleFilterData}
          clearable
        />
      </Drawer>
    </>
  );
};

export default LRFFilterMenu;
