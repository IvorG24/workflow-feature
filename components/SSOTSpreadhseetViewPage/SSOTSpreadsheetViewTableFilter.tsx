import { Box, Button, Flex, Group, Modal, Switch, Text } from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import { ShowColumnList } from "./SSOTSpreadsheetViewPage";

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
  const [showFilterColumnModal, setShowFilterColumnModal] = useState(false);

  return (
    <>
      <Modal
        opened={showFilterColumnModal}
        onClose={() => setShowFilterColumnModal(false)}
        title="Show/Hide Table and Columns"
        size="auto"
      >
        <Flex gap="md" align="flex-start" wrap="wrap">
          <Box p="sm">
            <Group mb="sm" position="apart">
              <Text>Requisition Table</Text>
              <Switch
                checked={showRequisitionTable}
                onChange={(e) =>
                  setShowRequisitionTable(e.currentTarget.checked)
                }
                onLabel={<IconEye size="1rem" stroke={2.5} />}
                offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
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
              />
            </Group>
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
                  />
                </Group>
              );
            })}
          </Box>
          <Box p="sm">
            <Group mb="sm" position="apart">
              <Text weight={600}>Receiving Inspecting Report Table</Text>
              <Switch
                checked={showRIRTable}
                onChange={(e) => setShowRIRTable(e.currentTarget.checked)}
                onLabel={<IconEye size="1rem" stroke={2.5} />}
                offLabel={<IconEyeOff size="1rem" stroke={2.5} />}
                disabled={!showQuotationTable}
              />
            </Group>
            <Flex pl="md" gap="sm" direction="column">
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
              />
            </Group>
            <Flex pl="md" gap="sm" direction="column">
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
              />
            </Group>
            <Flex pl="md" gap="sm" direction="column">
              {chequeReferenceTableColumnList.map((column, index) => {
                const propName = column.toLowerCase().replace(/\s+/g, "_");
                return (
                  <Group key={index} position="apart">
                    <Text>{column}</Text>
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
