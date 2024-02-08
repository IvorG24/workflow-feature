"use client";

import { Button, Menu } from "@mantine/core";
import { IconList, IconTable } from "@tabler/icons-react";

type Props = {
  isFormslyForm: boolean;
  formName: string;
  requestId: string;
};

const ExportToPdfMenu = ({ isFormslyForm, formName, requestId }: Props) => {
  return (
    <Menu width={200} shadow="md">
      <Menu.Target>
        <Button variant="light">Export to PDF</Button>
      </Menu.Target>

      <Menu.Dropdown>
        {!isFormslyForm && (
          <Menu.Item
            icon={<IconList size={16} />}
            onClick={() => {
              window.open(
                `${process.env.NEXT_PUBLIC_SITE_URL}/export-to-pdf/${requestId}?type=table-view`,
                "_blank"
              );
            }}
          >
            List View
          </Menu.Item>
        )}

        {isFormslyForm &&
          ["Item", "Services", "Other Expenses"].includes(formName) && (
            <Menu.Item
              icon={<IconTable size={16} />}
              onClick={() => {
                window.open(
                  `${process.env.NEXT_PUBLIC_SITE_URL}/export-to-pdf/${requestId}?type=table-view`,
                  "_blank"
                );
              }}
            >
              Table View
            </Menu.Item>
          )}
      </Menu.Dropdown>
    </Menu>
  );
};

export default ExportToPdfMenu;
