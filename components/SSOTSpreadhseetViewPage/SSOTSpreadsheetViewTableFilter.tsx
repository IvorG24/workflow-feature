import { Box, Button, Flex, Group, Modal, Switch, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ShowColumnList } from "./SSOTSpreadhseetViewPage";

type Props = {
  requisitionTableColumnList: string[];
  quotationTableColumnList: string[];
  rirTableColumnList: string[];
  releaseOrderTableColumnList: string[];
  chequeReferenceTableColumnList: string[];
  showRequisitionTable: boolean;
  setShowRequisitionTable: Dispatch<SetStateAction<boolean>>;
  showQuotationTable: boolean;
  setShowQuotationTable: Dispatch<SetStateAction<boolean>>;
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
    rirTableColumnList,
    releaseOrderTableColumnList,
    chequeReferenceTableColumnList,
    showRequisitionTable,
    setShowRequisitionTable,
    showRequisitionColumnList,
    setShowRequisitionColumnList,
    showQuotationTable,
    setShowQuotationTable,
    showQuotationColumnList,
    setShowQuotationColumnList,
    showRIRTable,
    setShowRIRTable,
    showReleaseOrderTable,
    setShowReleaseOrderTable,
    showChequeReferenceTable,
    setShowChequeReferenceTable,
    showRIRColumnList,
    setShowRIRColumnList,
    showReleaseOrderColumnList,
    setShowReleaseOrderColumnList,
    showChequeReferenceColumnList,
    setShowChequeReferenceColumnList,
  } = props;
  const switchInputProps = { color: "green" };
  const [showFilterColumnModal, setShowFilterColumnModal] = useState(false);
  const [localFilterSettings, setLocalFilterSettings] = useLocalStorage({
    key: "ssot-table-filter",
    defaultValue: {
      showRequisitionTable,
      showQuotationTable,
      showRIRTable,
      showChequeReferenceTable,
      showReleaseOrderTable,
      showRequisitionColumnList,
      showQuotationColumnList,
      showRIRColumnList,
      showReleaseOrderColumnList,
      showChequeReferenceColumnList,
    },
  });

  const handleSaveFilterSettingsToLocalStorage = () => {
    setLocalFilterSettings({
      showRequisitionTable,
      showQuotationTable,
      showRIRTable,
      showChequeReferenceTable,
      showReleaseOrderTable,
      showRequisitionColumnList,
      showQuotationColumnList,
      showRIRColumnList,
      showReleaseOrderColumnList,
      showChequeReferenceColumnList,
    });
    setShowFilterColumnModal(false);
    return;
  };

  useEffect(() => {
    const {
      showRequisitionTable,
      showQuotationTable,
      showRIRTable,
      showChequeReferenceTable,
      showReleaseOrderTable,
      showRequisitionColumnList,
      showQuotationColumnList,
      showRIRColumnList,
      showReleaseOrderColumnList,
      showChequeReferenceColumnList,
    } = localFilterSettings;

    setShowRequisitionTable(showRequisitionTable);
    setShowQuotationTable(showQuotationTable);
    setShowRIRTable(showRIRTable);
    setShowReleaseOrderTable(showReleaseOrderTable);
    setShowChequeReferenceTable(showChequeReferenceTable);
    setShowRequisitionColumnList(showRequisitionColumnList);
    setShowQuotationColumnList(showQuotationColumnList);
    setShowRIRColumnList(showRIRColumnList);
    setShowReleaseOrderColumnList(showReleaseOrderColumnList);
    setShowChequeReferenceColumnList(showChequeReferenceColumnList);
  }, [localFilterSettings]);

  return (
    <>
      <Modal
        opened={showFilterColumnModal}
        onClose={() => handleSaveFilterSettingsToLocalStorage()}
        title={<Text weight={600}>Show/Hide Tables and Columns</Text>}
        size="auto"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap="md"
          align="flex-start"
          wrap="wrap"
        >
          <Box p="sm">
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
                const propName = column.toLowerCase().replace(/\s+/g, "_");
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
          <Box p="sm">
            <Group mb="sm" position="apart">
              <Text weight={600}>Quotation Table</Text>
              <Switch
                checked={showQuotationTable}
                onChange={(e) => setShowQuotationTable(e.currentTarget.checked)}
                onLabel={<IconEye size="1rem" stroke={2.5} />}
                offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                {...switchInputProps}
                styles={{ track: { cursor: "pointer" } }}
              />
            </Group>
            <Flex gap="sm" direction="column">
              {quotationTableColumnList.map((column, index) => {
                const propName = column.toLowerCase().replace(/\s+/g, "_");
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
          <Box p="sm">
            <Group mb="sm" position="apart">
              <Flex maw={200} wrap="wrap">
                <Text weight={600}>Receiving Inspecting Report Table</Text>
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
                const propName = column.toLowerCase().replace(/\s+/g, "_");
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
          <Box p="sm">
            <Group mb="sm" position="apart">
              <Text weight={600}>Release Order Table</Text>
              <Switch
                checked={showReleaseOrderTable}
                onChange={(e) =>
                  setShowReleaseOrderTable(e.currentTarget.checked)
                }
                onLabel={<IconEye size="1rem" stroke={2.5} />}
                offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                {...switchInputProps}
                styles={{ track: { cursor: "pointer" } }}
              />
            </Group>
            <Flex gap="sm" direction="column">
              {releaseOrderTableColumnList.map((column, index) => {
                const propName = column.toLowerCase().replace(/\s+/g, "_");
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
                      disabled={!showReleaseOrderTable}
                      {...switchInputProps}
                      styles={{ track: { cursor: "pointer" } }}
                    />
                  </Group>
                );
              })}
            </Flex>
          </Box>
          <Box p="sm">
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
                const propName = column.toLowerCase().replace(/\s+/g, "_");
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
        </Flex>
      </Modal>

      <Group position="center">
        <Button onClick={() => setShowFilterColumnModal(true)}>
          Show/Hide Tables and Columns
        </Button>
      </Group>
    </>
  );
};

export default SSOTSpreadsheetViewTableFilter;
