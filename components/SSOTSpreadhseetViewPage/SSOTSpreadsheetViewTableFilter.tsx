import { SSOTTableData } from "@/hooks/useSSOTTableFilter";
import { startCase } from "@/utils/string";
import {
  Accordion,
  Box,
  Button,
  Drawer,
  Flex,
  Group,
  Switch,
  Text,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconColumns3, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type Props = {
  tables: {
    [key: string]: SSOTTableData;
  };
};

function convertToTitleCase(input: string): string {
  return input
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function convertToHyphenCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

const SSOTSpreadsheetViewTableFilter = (props: Props) => {
  const switchInputProps = { color: "green" };
  const [showFilterColumnModal, setShowFilterColumnModal] = useState(false);
  const [accordionValue, setAccordionValue] = useState("item-table");
  const defaultFilterSettings = props.tables;
  const [
    localFilterSettings,
    setLocalFilterSettings,
    resetLocalFilterSettings,
  ] = useLocalStorage({
    key: "ssot-table-filter",
    defaultValue: defaultFilterSettings,
  });

  const handleSaveFilterSettingsToLocalStorage = () => {
    setLocalFilterSettings(props.tables);
    setShowFilterColumnModal(false);
    return;
  };

  const checkIfDefaultAndLocalHasSameProps = (
    defaultSettings: typeof defaultFilterSettings,
    localSettings: typeof localFilterSettings
  ) => {
    const keys1 = Object.keys(defaultSettings);
    const keys2 = Object.keys(localSettings);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false;
      }
    }

    return true;
  };

  const renderTableFilter = (tables: Props["tables"]) => {
    return (
      <Accordion
        w="100%"
        value={accordionValue}
        onChange={(value: string) => setAccordionValue(value)}
      >
        {Object.entries(tables).map(([tableName, tableData]) => {
          const parentTableName = tableName.replace(/ItemTable$/, "Table");
          const parentTable = tables[parentTableName];
          const isTableDisabled =
            tableName.includes("Item") && parentTable
              ? !parentTable.show
              : false;

          return (
            <Accordion.Item
              key={tableName}
              value={convertToHyphenCase(tableName)}
            >
              <Accordion.Control>{startCase(tableName)}</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>{startCase(tableName)}</Text>
                    <Switch
                      checked={tableData.show}
                      onChange={(e) =>
                        tableData.setShow(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      disabled={isTableDisabled}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {renderColumnListFilter(
                      tableData,
                      parentTable ? !parentTable.show : false || !tableData.show
                    )}
                  </Flex>
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    );
  };

  const renderColumnListFilter = (
    tableData: SSOTTableData,
    isSwitchDisabled?: boolean
  ) => {
    const columns = tableData.columnList;
    return Object.keys(columns).map((columnKey, index) => {
      const propName = columnKey.toLowerCase().replace(/\s+/g, "_");
      return (
        <Group key={index} position="apart">
          <Text>{convertToTitleCase(columnKey)}</Text>
          <Switch
            checked={tableData.columnList[propName]}
            onChange={(e) =>
              tableData.setColumnList((prev) => ({
                ...prev,
                [propName]: e.currentTarget.checked,
              }))
            }
            onLabel={<IconEye size="1rem" stroke={2.5} />}
            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
            disabled={isSwitchDisabled ? isSwitchDisabled : false}
            {...switchInputProps}
            styles={{ track: { cursor: "pointer" } }}
          />
        </Group>
      );
    });
  };

  useEffect(() => {
    const localSettings = localFilterSettings;
    if (
      !checkIfDefaultAndLocalHasSameProps(defaultFilterSettings, localSettings)
    ) {
      resetLocalFilterSettings();
      return;
    }

    Object.entries(localSettings).forEach(([tableName, tableData]) => {
      props.tables[tableName].setShow(tableData.show);
      props.tables[tableName].setColumnList(tableData.columnList);
    });
  }, [localFilterSettings]);

  return (
    <Box>
      <Drawer
        opened={showFilterColumnModal}
        onClose={() => handleSaveFilterSettingsToLocalStorage()}
        title={<Text weight={600}>Show/Hide Tables and Columns</Text>}
        position="right"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap="md"
          align="flex-start"
          wrap="wrap"
          w="100%"
        >
          {renderTableFilter(props.tables)}
          {/* <Accordion
            w="100%"
            value={accordionValue}
            onChange={(value: string) => setAccordionValue(value)}
          >
            <Accordion.Item value="item-table">
              <Accordion.Control>Item Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>Item Table</Text>
                    <Switch
                      checked={itemTable.show}
                      onChange={(e) =>
                        itemTable.setShow(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {renderColumnListFilter(
                      itemTable,
                      !itemTable.show
                    )}
                  </Flex>
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="item-item-table">
              <Accordion.Control>Item Item Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>Item Description Table</Text>
                    <Switch
                      checked={itemItemTable.show}
                      onChange={(e) =>
                        itemItemTable.setShow(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      disabled={!itemTable.show}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {renderTableFilter(
                      itemItemTable,
                      !itemTable.show || !itemItemTable.show
                    )}
                  </Flex>
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="quotation-table">
              <Accordion.Control>Quotation Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>Quotation Table</Text>
                    <Switch
                      checked={showQuotationTable}
                      onChange={(e) =>
                        setShowQuotationTable(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {quotationTableColumnList.map((column, index) => {
                      const propName = column
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <Group key={index} position="apart">
                          <Text>{column}</Text>
                          <Switch
                            checked={showQuotationColumnList[propName]}
                            onChange={(e) =>
                              setShowQuotationColumnList((prev) => ({
                                ...prev,
                                [propName]: e.currentTarget.checked,
                              }))
                            }
                            onLabel={<IconEye size="1rem" stroke={2.5} />}
                            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                            disabled={!showQuotationTable}
                            {...switchInputProps}
                            styles={{ track: { cursor: "pointer" } }}
                          />
                        </Group>
                      );
                    })}
                  </Flex>
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="rir-table">
              <Accordion.Control>Receiving Inspecting Report</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Flex maw={200} wrap="wrap">
                      <Text weight={600}>
                        Receiving Inspecting Report Table
                      </Text>
                    </Flex>
                    <Switch
                      checked={showRIRTable}
                      onChange={(e) => setShowRIRTable(e.currentTarget.checked)}
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      disabled={!showQuotationTable}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {rirTableColumnList.map((column, index) => {
                      const propName = column
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <Group key={index} position="apart">
                          <Text>{column}</Text>
                          <Switch
                            checked={showRIRColumnList[propName]}
                            onChange={(e) =>
                              setShowRIRColumnList((prev) => ({
                                ...prev,
                                [propName]: e.currentTarget.checked,
                              }))
                            }
                            onLabel={<IconEye size="1rem" stroke={2.5} />}
                            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                            disabled={!showRIRTable || !showQuotationTable}
                            {...switchInputProps}
                            styles={{ track: { cursor: "pointer" } }}
                          />
                        </Group>
                      );
                    })}
                  </Flex>
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="sourced-item-table">
              <Accordion.Control>Sourced Item Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Flex maw={200} wrap="wrap">
                      <Text weight={600}>Sourced Item Table</Text>
                    </Flex>
                    <Switch
                      checked={showSourcedItemTable}
                      onChange={(e) =>
                        setShowSourcedItemTable(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {sourcedItemTableColumnList.map((column, index) => {
                      const propName = column
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <Group key={index} position="apart">
                          <Text>{column}</Text>
                          <Switch
                            checked={showSourcedItemColumnList[propName]}
                            onChange={(e) =>
                              setShowSourcedItemColumnList((prev) => ({
                                ...prev,
                                [propName]: e.currentTarget.checked,
                              }))
                            }
                            onLabel={<IconEye size="1rem" stroke={2.5} />}
                            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                            disabled={!showSourcedItemTable}
                            {...switchInputProps}
                            styles={{ track: { cursor: "pointer" } }}
                          />
                        </Group>
                      );
                    })}
                  </Flex>
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="ro-table">
              <Accordion.Control>Release Order Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>Release Order Table</Text>
                    <Switch
                      checked={showReleaseOrderTable}
                      onChange={(e) =>
                        setShowReleaseOrderTable(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      disabled={!showSourcedItemTable}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {releaseOrderTableColumnList.map((column, index) => {
                      const propName = column
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <Group key={index} position="apart">
                          <Text>{column}</Text>
                          <Switch
                            checked={showReleaseOrderColumnList[propName]}
                            onChange={(e) =>
                              setShowReleaseOrderColumnList((prev) => ({
                                ...prev,
                                [propName]: e.currentTarget.checked,
                              }))
                            }
                            onLabel={<IconEye size="1rem" stroke={2.5} />}
                            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                            disabled={
                              !showSourcedItemTable || !showReleaseOrderTable
                            }
                            {...switchInputProps}
                            styles={{ track: { cursor: "pointer" } }}
                          />
                        </Group>
                      );
                    })}
                  </Flex>
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="transfer-receipt-table">
              <Accordion.Control>Transfer Receipt Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>Transfer Receipt Table</Text>
                    <Switch
                      checked={showTransferReceiptTable}
                      onChange={(e) =>
                        setShowTransferReceiptTable(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      disabled={!showReleaseOrderTable}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {transferReceiptTableColumnList.map((column, index) => {
                      const propName = column
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <Group key={index} position="apart">
                          <Text>{column}</Text>
                          <Switch
                            checked={showTransferReceiptColumnList[propName]}
                            onChange={(e) =>
                              setShowTransferReceiptColumnList((prev) => ({
                                ...prev,
                                [propName]: e.currentTarget.checked,
                              }))
                            }
                            onLabel={<IconEye size="1rem" stroke={2.5} />}
                            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                            disabled={
                              !showReleaseOrderTable ||
                              !showTransferReceiptTable
                            }
                            {...switchInputProps}
                            styles={{ track: { cursor: "pointer" } }}
                          />
                        </Group>
                      );
                    })}
                  </Flex>
                </Box>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion> */}
        </Flex>
      </Drawer>

      <Group position="center">
        <Button
          variant="outline"
          onClick={() => setShowFilterColumnModal(true)}
          leftIcon={<IconColumns3 size={14} />}
        >
          Toggle Tables & Columns
        </Button>
      </Group>
    </Box>
  );
};

export default SSOTSpreadsheetViewTableFilter;
