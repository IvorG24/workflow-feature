import { BasicNodeType } from "@/utils/types";
import { ActionIcon, Box, Drawer, Text } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";

import { useState } from "react";
import NodeSignerSection from "./NodeSignerSection";

type Props = {
  selectedNode: BasicNodeType;
};

const NodeAdvanceSettings = ({ selectedNode }: Props) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <ActionIcon
        variant="light"
        color="gray"
        onClick={() => setIsDrawerOpen(true)}
      >
        <IconSettings size={16} />
      </ActionIcon>
      <Drawer
        title={
          <Text weight={600} fz={16}>
            Advance Settings
          </Text>
        }
        opened={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
        position="right"
        overlayProps={{ opacity: 0 }}
        withCloseButton={false}
        sx={{ marginTop: "50" }}
      >
        <Box>
          <NodeSignerSection selectedNode={selectedNode} />
        </Box>
      </Drawer>
    </>
  );
};

export default NodeAdvanceSettings;
