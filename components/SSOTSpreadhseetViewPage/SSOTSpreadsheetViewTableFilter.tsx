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
  withdrawalSlipTableColumnList: string[];
  rirTableColumnList: string[];
  sourcedItemTableColumnList: string[];
  releaseOrderTableColumnList: string[];
  chequeReferenceTableColumnList: string[];
  showRequisitionTable: boolean;
  setShowRequisitionTable: Dispatch<SetStateAction<boolean>>;
  showQuotationTable: boolean;
  setShowQuotationTable: Dispatch<SetStateAction<boolean>>;
  showSourcedItemTable: boolean;
  setShowSourcedItemTable: Dispatch<SetStateAction<boolean>>;
  showWithdrawalSlipTable: boolean;
  setShowWithdrawalSlipTable: Dispatch<SetStateAction<boolean>>;
  showRIRTable: boolean;
  setShowRIRTable: Dispatch<SetStateAction<boolean>>;
  showReleaseOrderTable: boolean;
  setShowReleaseOrderTable: Dispatch<SetStateAction<boolean>>;
  showChequeReferenceTable: boolean;
  setShowChequeReferenceTable: Dispatch<SetStateAction<boolean>>;
  showRequisitionColumnList: ShowColumnList;
  setShowRequisitionColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showQuotationColumnList: ShowColumnList;
  setShowQuotationColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showSourcedItemColumnList: ShowColumnList;
  setShowSourcedItemColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showWithdrawalSlipColumnList: ShowColumnList;
  setShowWithdrawalSlipColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showRIRColumnList: ShowColumnList;
  setShowRIRColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showReleaseOrderColumnList: ShowColumnList;
  setShowReleaseOrderColumnList: Dispatch<SetStateAction<ShowColumnList>>;
  showChequeReferenceColumnList: ShowColumnList;
  setShowChequeReferenceColumnList: Dispatch<SetStateAction<ShowColumnList>>;
};

const SSOTSpreadsheetViewTableFilter = (props: Props) => {
  const {
    requisitionTableColumnList,
    quotationTableColumnList,
    withdrawalSlipTableColumnList,
    rirTableColumnList,
    sourcedItemTableColumnList,
    releaseOrderTableColumnList,
    chequeReferenceTableColumnList,
    showRequisitionTable,
    setShowRequisitionTable,
    showRequisitionColumnList,
    setShowRequisitionColumnList,
    showQuotationTable,
    setShowQuotationTable,
    showWithdrawalSlipTable,
    setShowWithdrawalSlipTable,
    showSourcedItemTable,
    setShowSourcedItemTable,
    showQuotationColumnList,
    setShowQuotationColumnList,
    showWithdrawalSlipColumnList,
    setShowWithdrawalSlipColumnList,
    showRIRTable,
    setShowRIRTable,
    showReleaseOrderTable,
    setShowReleaseOrderTable,
    showChequeReferenceTable,
    setShowChequeReferenceTable,
    showRIRColumnList,
    setShowRIRColumnList,
    showSourcedItemColumnList,
    setShowSourcedItemColumnList,
    showReleaseOrderColumnList,
    setShowReleaseOrderColumnList,
    showChequeReferenceColumnList,
    setShowChequeReferenceColumnList,
  } = props;
  const switchInputProps = { color: "green" };
  const [showFilterColumnModal, setShowFilterColumnModal] = useState(false);
  const [accordionValue, setAccordionValue] = useState("requisition-table");
  const defaultFilterSettings = {
    showRequisitionTable,
    showQuotationTable,
    showWithdrawalSlipTable,
    showRIRTable,
    showSourcedItemTable,
    showReleaseOrderTable,
    showChequeReferenceTable,
    showRequisitionColumnList,
    showQuotationColumnList,
    showWithdrawalSlipColumnList,
    showRIRColumnList,
    showSourcedItemColumnList,
    showReleaseOrderColumnList,
    showChequeReferenceColumnList,
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
      showWithdrawalSlipTable,
      showRIRTable,
      showSourcedItemTable,
      showReleaseOrderTable,
      showChequeReferenceTable,
      showRequisitionColumnList,
      showQuotationColumnList,
      showWithdrawalSlipColumnList,
      showRIRColumnList,
      showSourcedItemColumnList,
      showReleaseOrderColumnList,
      showChequeReferenceColumnList,
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
      showWithdrawalSlipTable,
      showRIRTable,
      showSourcedItemTable,
      showReleaseOrderTable,
      showChequeReferenceTable,
      showRequisitionColumnList,
      showQuotationColumnList,
      showWithdrawalSlipColumnList,
      showRIRColumnList,
      showSourcedItemColumnList,
      showReleaseOrderColumnList,
      showChequeReferenceColumnList,
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
    setShowWithdrawalSlipTable(showWithdrawalSlipTable);
    setShowSourcedItemTable(showSourcedItemTable);
    setShowRIRTable(showRIRTable);
    setShowReleaseOrderTable(showReleaseOrderTable);
    setShowChequeReferenceTable(showChequeReferenceTable);
    setShowRequisitionColumnList(showRequisitionColumnList);
    setShowQuotationColumnList(showQuotationColumnList);
    setShowWithdrawalSlipColumnList(showWithdrawalSlipColumnList);
    setShowRIRColumnList(showRIRColumnList);
    setShowSourcedItemColumnList(showSourcedItemColumnList);
    setShowReleaseOrderColumnList(showReleaseOrderColumnList);
    setShowChequeReferenceColumnList(showChequeReferenceColumnList);
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
            <Accordion.Item value="withdrawal-slip-table">
              <Accordion.Control>Withdrawal Slip Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>Withdrawal Slip Table</Text>
                    <Switch
                      checked={showWithdrawalSlipTable}
                      onChange={(e) =>
                        setShowWithdrawalSlipTable(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {withdrawalSlipTableColumnList.map((column, index) => {
                      const propName = column
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <Group key={index} position="apart">
                          <Text>{column}</Text>
                          <Switch
                            checked={showWithdrawalSlipColumnList[propName]}
                            onChange={(e) =>
                              setShowWithdrawalSlipColumnList((prev) => ({
                                ...prev,
                                [propName]: e.currentTarget.checked,
                              }))
                            }
                            onLabel={<IconEye size="1rem" stroke={2.5} />}
                            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                            disabled={!showWithdrawalSlipTable}
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
            <Accordion.Item value="cheque-reference-table">
              <Accordion.Control>Cheque Reference Table</Accordion.Control>
              <Accordion.Panel>
                <Box w="100%" p="sm">
                  <Group mb="sm" position="apart">
                    <Text weight={600}>Cheque Reference Table</Text>
                    <Switch
                      checked={showChequeReferenceTable}
                      onChange={(e) =>
                        setShowChequeReferenceTable(e.currentTarget.checked)
                      }
                      onLabel={<IconEye size="1rem" stroke={2.5} />}
                      offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                  <Flex gap="sm" direction="column">
                    {chequeReferenceTableColumnList.map((column, index) => {
                      const propName = column
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <Group key={index} position="apart">
                          <Flex maw={150} wrap="wrap">
                            <Text>{column}</Text>
                          </Flex>
                          <Switch
                            checked={showChequeReferenceColumnList[propName]}
                            onChange={(e) =>
                              setShowChequeReferenceColumnList((prev) => ({
                                ...prev,
                                [propName]: e.currentTarget.checked,
                              }))
                            }
                            onLabel={<IconEye size="1rem" stroke={2.5} />}
                            offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                            disabled={!showChequeReferenceTable}
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
