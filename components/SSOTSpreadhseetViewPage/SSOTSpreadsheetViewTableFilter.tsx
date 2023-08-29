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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ShowColumnList } from "./SSOTSpreadhseetViewPage";

type Props = {
  requisitionTableColumnList: string[];
  quotationTableColumnList: string[];
  rirTableColumnList: string[];
  sourcedItemTableColumnList: string[];
  releaseOrderTableColumnList: string[];
  transferReceiptTableColumnList: string[];
  itemDescriptionTableColumnList: string[];
  showRequisitionTable: boolean;
  setShowRequisitionTable: Dispatch<SetStateAction<boolean>>;
  showQuotationTable: boolean;
  setShowQuotationTable: Dispatch<SetStateAction<boolean>>;
  showSourcedItemTable: boolean;
  setShowSourcedItemTable: Dispatch<SetStateAction<boolean>>;
  showRIRTable: boolean;
  setShowRIRTable: Dispatch<SetStateAction<boolean>>;
  showReleaseOrderTable: boolean;
  setShowReleaseOrderTable: Dispatch<SetStateAction<boolean>>;
  showTransferReceiptTable: boolean;
  setShowTransferReceiptTable: Dispatch<SetStateAction<boolean>>;
  showItemDescriptionTable: boolean;
  setShowItemDescriptionTable: Dispatch<SetStateAction<boolean>>;
  showRequisitionColumnList: ShowColumnList;
  setShowRequisitionColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showQuotationColumnList: ShowColumnList;
  setShowQuotationColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showSourcedItemColumnList: ShowColumnList;
  setShowSourcedItemColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showRIRColumnList: ShowColumnList;
  setShowRIRColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showReleaseOrderColumnList: ShowColumnList;
  setShowReleaseOrderColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showTransferReceiptColumnList: ShowColumnList;
  setShowTransferReceiptColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showItemDescriptionColumnList: ShowColumnList;
  setShowItemDescriptionColumnList: Dispatch<SetStateAction<ShowColumnList>>;
};

const SSOTSpreadsheetViewTableFilter = (props: Props) => {
  const {
    requisitionTableColumnList,
    quotationTableColumnList,
    rirTableColumnList,
    sourcedItemTableColumnList,
    releaseOrderTableColumnList,
    transferReceiptTableColumnList,
    itemDescriptionTableColumnList,
    showRequisitionTable,
    setShowRequisitionTable,
    showRequisitionColumnList,
    setShowRequisitionColumnList,
    showQuotationTable,
    setShowQuotationTable,
    showSourcedItemTable,
    setShowSourcedItemTable,
    showQuotationColumnList,
    setShowQuotationColumnList,
    showRIRTable,
    setShowRIRTable,
    showReleaseOrderTable,
    setShowReleaseOrderTable,
    showTransferReceiptTable,
    setShowTransferReceiptTable,
    showRIRColumnList,
    setShowRIRColumnList,
    showSourcedItemColumnList,
    setShowSourcedItemColumnList,
    showReleaseOrderColumnList,
    setShowReleaseOrderColumnList,
    showTransferReceiptColumnList,
    setShowTransferReceiptColumnList,
    showItemDescriptionTable,
    setShowItemDescriptionTable,
    showItemDescriptionColumnList,
    setShowItemDescriptionColumnList,
  } = props;
  const switchInputProps = { color: "green" };
  const [showFilterColumnModal, setShowFilterColumnModal] = useState(false);
  const [accordionValue, setAccordionValue] = useState("requisition-table");
  const defaultFilterSettings = {
    showRequisitionTable,
    showQuotationTable,
    showRIRTable,
    showSourcedItemTable,
    showReleaseOrderTable,
    showTransferReceiptTable,
    showItemDescriptionTable,
    showRequisitionColumnList,
    showQuotationColumnList,
    showRIRColumnList,
    showSourcedItemColumnList,
    showReleaseOrderColumnList,
    showTransferReceiptColumnList,
    showItemDescriptionColumnList,
  };
  const [
    localFilterSettings,
    setLocalFilterSettings,
    resetLocalFilterSettings,
  ] = useLocalStorage({
    key: "ssot-table-filter",
    defaultValue: defaultFilterSettings,
  });

  const handleSaveFilterSettingsToLocalStorage = () => {
    setLocalFilterSettings({
      showRequisitionTable,
      showQuotationTable,
      showRIRTable,
      showSourcedItemTable,
      showReleaseOrderTable,
      showTransferReceiptTable,
      showItemDescriptionTable,
      showRequisitionColumnList,
      showQuotationColumnList,
      showRIRColumnList,
      showSourcedItemColumnList,
      showReleaseOrderColumnList,
      showTransferReceiptColumnList,
      showItemDescriptionColumnList,
    });
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

  useEffect(() => {
    const {
      showRequisitionTable,
      showQuotationTable,
      showRIRTable,
      showSourcedItemTable,
      showReleaseOrderTable,
      showTransferReceiptTable,
      showItemDescriptionTable,
      showRequisitionColumnList,
      showQuotationColumnList,
      showRIRColumnList,
      showSourcedItemColumnList,
      showReleaseOrderColumnList,
      showTransferReceiptColumnList,
      showItemDescriptionColumnList,
    } = localFilterSettings;
    if (
      !checkIfDefaultAndLocalHasSameProps(
        defaultFilterSettings,
        localFilterSettings
      )
    ) {
      resetLocalFilterSettings();
      return;
    }

    setShowRequisitionTable(showRequisitionTable);
    setShowQuotationTable(showQuotationTable);
    setShowSourcedItemTable(showSourcedItemTable);
    setShowRIRTable(showRIRTable);
    setShowReleaseOrderTable(showReleaseOrderTable);
    setShowTransferReceiptTable(showTransferReceiptTable);
    setShowItemDescriptionTable(showItemDescriptionTable);
    setShowRequisitionColumnList(showRequisitionColumnList);
    setShowQuotationColumnList(showQuotationColumnList);
    setShowRIRColumnList(showRIRColumnList);
    setShowSourcedItemColumnList(showSourcedItemColumnList);
    setShowReleaseOrderColumnList(showReleaseOrderColumnList);
    setShowTransferReceiptColumnList(showTransferReceiptColumnList);
    setShowItemDescriptionColumnList(showItemDescriptionColumnList);
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
          <Accordion
            w="100%"
            value={accordionValue}
            onChange={(value: string) => setAccordionValue(value)}
          >
            <Accordion.Item value="requisition-table">
              <Accordion.Control>Requisition Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>Requisition Table</Text>
                    <Switch
                      checked={showRequisitionTable}
                      onChange={(e) =>
                        setShowRequisitionTable(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {requisitionTableColumnList.map((column, index) => {
                      const propName = column
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <Group key={index} position="apart">
                          <Text>{column}</Text>
                          <Switch
                            checked={showRequisitionColumnList[propName]}
                            onChange={(e) =>
                              setShowRequisitionColumnList((prev) => ({
                                ...prev,
                                [propName]: e.currentTarget.checked,
                              }))
                            }
                            onLabel={<IconEye size="1rem" stroke={2.5} />}
                            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                            disabled={!showRequisitionTable}
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
            <Accordion.Item value="item-description-table">
              <Accordion.Control>Item Description Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>Item Description Table</Text>
                    <Switch
                      checked={showItemDescriptionTable}
                      onChange={(e) =>
                        setShowItemDescriptionTable(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      disabled={!showTransferReceiptTable}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {itemDescriptionTableColumnList.map((column, index) => {
                      const propName = column
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <Group key={index} position="apart">
                          <Text>{column}</Text>
                          <Switch
                            checked={showItemDescriptionColumnList[propName]}
                            onChange={(e) =>
                              setShowItemDescriptionColumnList((prev) => ({
                                ...prev,
                                [propName]: e.currentTarget.checked,
                              }))
                            }
                            onLabel={<IconEye size="1rem" stroke={2.5} />}
                            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                            disabled={
                              !showItemDescriptionTable ||
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
          </Accordion>
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
