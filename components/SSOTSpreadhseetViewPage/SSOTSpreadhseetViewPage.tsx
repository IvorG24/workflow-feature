import { useSSOTTableFilter } from "@/hooks/useSSOTTableFilter";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  DEFAULT_NUMBER_SSOT_ROWS,
  REQUISITION_FIELDS_ORDER,
} from "@/utils/constant";
import { Database } from "@/utils/database";
import { addCommaToNumber, regExp } from "@/utils/string";
import { SSOTResponseType, SSOTType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Loader,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { useElementSize, useViewportSize } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconFile } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import SSOTSpreadsheetViewFilter from "./SSOTSpreadsheetViewFilter";
import SSOTSpreadsheetViewTableFilter from "./SSOTSpreadsheetViewTableFilter";

// TODO: Refactor
const useStyles = createStyles((theme) => ({
  cell: {
    verticalAlign: "top",
  },
  date: {
    width: 120,
    minWidth: 120,
    maxWidth: 120,
  },
  processor: {
    width: 180,
    minWidth: 180,
    maxWidth: 180,
  },
  short: {
    width: 80,
    minWidth: 80,
    maxWidth: 80,
  },
  normal: {
    width: 100,
    minWidth: 100,
    maxWidth: 100,
  },
  long: {
    width: 200,
    minWidth: 200,
    maxWidth: 200,
  },
  description: {
    width: 300,
    minWidth: 300,
    maxWidth: 300,
  },
  requisitionTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.red[6]
          : theme.colors.red[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.red[9]
          : theme.colors.red[0],
    },
  },
  quotationTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.grape[6]
          : theme.colors.grape[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.grape[9]
          : theme.colors.grape[0],
    },
  },
  sourcedItemTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.orange[6]
          : theme.colors.orange[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.orange[9]
          : theme.colors.orange[0],
    },
  },
  rirTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.cyan[6]
          : theme.colors.cyan[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.cyan[9]
          : theme.colors.cyan[0],
    },
  },
  roTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[6]
          : theme.colors.blue[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[9]
          : theme.colors.blue[0],
    },
  },
  chequeReferenceTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.green[6]
          : theme.colors.green[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.green[9]
          : theme.colors.green[0],
    },
  },
  transferReceiptTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.lime[6]
          : theme.colors.lime[3],
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.lime[9]
          : theme.colors.lime[0],
    },
  },
}));

export type SSOTFilterFormValues = {
  search: string;
  requestingProjectList: string[];
  itemNameList: string[];
  supplierList: string[];
};

type Props = {
  data: SSOTType[];
  requestingProjectList: string[];
  itemNameList: string[];
};

export type ShowColumnList = { [key: string]: boolean };

const requisitionTableColumnList = [
  "Requisition ID",
  "Date Created",
  "Operations/Engineering",
  "Requesting Project",
  "Type",
  "Date Needed",
  "Purpose",
];

const requisitionItemTableColumnList = [
  "General Name",
  "Quantity",
  "Base Unit of Measurement",
  "Item Description",
  "GL Account",
  "CSI Code",
];

const quotationTableColumnList = [
  "Quotation ID",
  "Date Created",
  "Purchaser",
  "Supplier",
  "Supplier Quotation",
  "Request Send Method",
  "Proof of Sending",
  "Payment Terms",
  "Lead Time",
  "Required Down Payment",
];

const quotationItemTableColumnList = [
  "Item Description",
  "Price Per Unit",
  "Quantity",
  "Base Unit of Measurement",
];

const sourcedItemTableColumnList = [
  "Sourced Item ID",
  "Date Created",
  "Lead Inventory Controller",
];

const sourcedItemItemTableColumnList = [
  "Item Description",
  "Quantity",
  "Base Unit of Measurement",
  "Source Project",
];

const rirTableColumnList = [
  "RIR ID",
  "Date Created",
  "Site Warehouse",
  "DR",
  "SI",
  "QCIR",
];

const rirItemTableColumnList = [
  "Item Description",
  "Quantity",
  "Base Unit of Measurement",
  "Receiving Status",
];

const releaseOrderTableColumnList = [
  "RO ID",
  "Date Created",
  "Warehouse Corporate Support Lead",
];

const releaseOrderItemTableColumnList = [
  "Item Description",
  "Quantity",
  "Base Unit of Measurement",
  "Receiving Status",
  "Source Project",
];

const transferReceiptTableColumnList = [
  "Transfer Receipt ID",
  "Date Created",
  "Site Warehouse",
  "Transfer Shipment",
  "Transfer Receipt",
];

const transferReceiptItemTableColumnList = [
  "Item Description",
  "Quantity",
  "Base Unit of Measurement",
  "Receiving Status",
  "Source Project",
];

const SSOTSpreadsheetView = ({
  data,
  requestingProjectList,
  itemNameList,
}: Props) => {
  const { classes } = useStyles();
  const { height } = useViewportSize();
  const { ref: topElementRef, height: topElementHeight } = useElementSize();
  const supabaseClient = createPagesBrowserClient<Database>();
  const containerRef = useRef<HTMLTableElement>(null);
  const team = useActiveTeam();
  const viewport = useRef<HTMLDivElement>(null);

  const [requisitionList, setRequisitionList] = useState(data);
  const [offset, setOffset] = useState(1);
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollBarType, setScrollBarType] = useState<"always" | "never">(
    "always"
  );
  const [isFetchable, setIsFetchable] = useState(
    requisitionList.length === DEFAULT_NUMBER_SSOT_ROWS
  );

  const requisitionTable = useSSOTTableFilter(true, requisitionTableColumnList);
  const requisitionItemTable = useSSOTTableFilter(
    true,
    requisitionItemTableColumnList
  );

  const quotationTable = useSSOTTableFilter(true, quotationTableColumnList);
  const quotationItemTable = useSSOTTableFilter(
    true,
    quotationItemTableColumnList
  );

  const sourcedItemTable = useSSOTTableFilter(true, sourcedItemTableColumnList);
  const sourcedItemItemTable = useSSOTTableFilter(
    true,
    sourcedItemItemTableColumnList
  );

  const rirTable = useSSOTTableFilter(true, rirTableColumnList);
  const rirItemTable = useSSOTTableFilter(true, rirItemTableColumnList);

  const releaseOrderTable = useSSOTTableFilter(
    true,
    releaseOrderTableColumnList
  );
  const releaseOrderItemTable = useSSOTTableFilter(
    true,
    releaseOrderItemTableColumnList
  );

  const transferReceiptTable = useSSOTTableFilter(
    true,
    transferReceiptTableColumnList
  );
  const transferReceiptItemTable = useSSOTTableFilter(
    true,
    transferReceiptItemTableColumnList
  );

  const tables = {
    requisitionTable,
    requisitionItemTable,
    quotationTable,
    quotationItemTable,
    sourcedItemTable,
    sourcedItemItemTable,
    rirTable,
    rirItemTable,
    releaseOrderTable,
    releaseOrderItemTable,
    transferReceiptTable,
    transferReceiptItemTable,
  };

  const filterSSOTMethods = useForm<SSOTFilterFormValues>({
    defaultValues: {
      search: "",
      itemNameList: [],
      requestingProjectList: [],
      supplierList: [],
    },
    mode: "onChange",
  });

  const { handleSubmit, getValues } = filterSSOTMethods;
  const handleFilterSSOT = async (
    {
      search,
      requestingProjectList,
      itemNameList,
      supplierList,
    }: SSOTFilterFormValues = getValues()
  ) => {
    try {
      setIsLoading(true);
      setScrollBarType("never");
      setOffset(1);

      const trimmedSearch = search.trim();

      let requisitionFilterCount = 0;
      requestingProjectList.length !== 0 && requisitionFilterCount++;
      itemNameList.length !== 0 && requisitionFilterCount++;
      trimmedSearch.length !== 0 && requisitionFilterCount++;

      const { data, error } = await supabaseClient.rpc("get_ssot", {
        input_data: {
          activeTeam: team.team_id,
          pageNumber: 1,
          rowLimit: DEFAULT_NUMBER_SSOT_ROWS,
          search: trimmedSearch,
          requisitionFilter: [
            ...requestingProjectList,
            ...itemNameList,
            ...(trimmedSearch ? [`${trimmedSearch}`] : []),
          ],
          requisitionFilterCount,
          supplierList,
        },
      });

      if (error) throw error;
      const formattedData = data as SSOTType[];
      if (formattedData.length === DEFAULT_NUMBER_SSOT_ROWS) {
        setIsFetchable(true);
      } else {
        setIsFetchable(false);
      }
      setRequisitionList(formattedData);
      viewport.current &&
        viewport.current.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setScrollBarType("always");
      setIsLoading(false);
    }
  };

  const loadMoreRequests = async (
    offset: number,
    {
      search,
      requestingProjectList,
      itemNameList,
      supplierList,
    }: SSOTFilterFormValues = getValues()
  ) => {
    try {
      setIsLoading(true);
      setScrollBarType("never");

      const trimmedSearch = search.trim();

      let requisitionFilterCount = 0;
      requestingProjectList.length !== 0 && requisitionFilterCount++;
      itemNameList.length !== 0 && requisitionFilterCount++;
      trimmedSearch.length !== 0 && requisitionFilterCount++;

      const { data, error } = await supabaseClient.rpc("get_ssot", {
        input_data: {
          activeTeam: team.team_id,
          pageNumber: offset,
          rowLimit: DEFAULT_NUMBER_SSOT_ROWS,
          search: trimmedSearch,
          requisitionFilter: [
            ...requestingProjectList,
            ...itemNameList,
            ...(trimmedSearch ? [`${trimmedSearch}`] : []),
          ],
          requisitionFilterCount,
          supplierList: supplierList,
        },
      });

      if (error) throw error;
      if (data) {
        const formattedData = data as SSOTType[];
        if (formattedData.length < DEFAULT_NUMBER_SSOT_ROWS) {
          setIsFetchable(false);
          setRequisitionList((prev) => [...prev, ...formattedData]);
        } else {
          setIsFetchable(true);
          setRequisitionList((prev) => [...prev, ...formattedData]);
        }
      }
    } catch (e) {
      console.error(e);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setScrollBarType("always");
      setIsLoading(false);
    }
  };

  const handleScroll = () => {
    if (!isFetchable) return;
    if (containerRef.current && typeof window !== "undefined") {
      const container = containerRef.current;
      const { bottom } = container.getBoundingClientRect();
      const { innerHeight } = window;
      setIsInView(bottom <= innerHeight);
    }
  };

  useEffect(() => {
    if (isInView) {
      loadMoreRequests(offset + 1);
      setOffset((prev) => (prev += 1));
    }
  }, [isInView]);

  const renderRir = (
    request: SSOTType["requisition_quotation_request"][0]["quotation_rir_request"]
  ) => {
    return request.map((request) => {
      const itemName: string[] = [];
      const itemQuantity: string[] = [];
      const itemUnit: string[] = [];
      const itemStatus: string[] = [];
      const itemNameOnly: string[] = [];
      const itemDescriptionOnly: string[] = [];
      const items = request.rir_request_response;
      let dr = "";
      let si = "";
      let qcir = "";

      items.forEach((item) => {
        if (item.request_response_field_name === "Item") {
          const quantityMatch = item.request_response.match(/(\d+)/);
          if (!quantityMatch) return;
          itemName.push(
            JSON.parse(
              item.request_response.replace(
                quantityMatch[1],
                addCommaToNumber(Number(quantityMatch[1]))
              )
            )
          );
        } else if (item.request_response_field_name === "Quantity") {
          const matches = regExp.exec(itemName[itemQuantity.length]);
          const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

          itemQuantity.push(JSON.parse(item.request_response));
          itemUnit.push(`${unit}`);
        } else if (item.request_response_field_name === "Receiving Status") {
          itemStatus.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "DR") {
          dr = item.request_response;
        } else if (item.request_response_field_name === "SI") {
          si = item.request_response;
        } else if (item.request_response_field_name === "QCIR") {
          qcir = item.request_response;
        }
      });

      itemName.forEach((item) => {
        const closingIndex = item.indexOf(")");
        const newItem = item.slice(0, closingIndex + 1);
        const description = item
          .slice(closingIndex + 3, item.length - 1)
          .split(", ")
          .join("\n");
        itemNameOnly.push(newItem);
        itemDescriptionOnly.push(description);
      });

      return (
        <tr
          key={request.rir_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {rirTable.columnList["rir_id"] && (
            <td>{request.rir_request_formsly_id}</td>
          )}
          {rirTable.columnList["date_created"] && (
            <td>
              {new Date(request.rir_request_date_created).toLocaleDateString()}
            </td>
          )}
          {rirTable.columnList["site_warehouse"] && (
            <td>{`${request.rir_request_owner.user_first_name} ${request.rir_request_owner.user_last_name}`}</td>
          )}
          {rirTable.columnList["dr"] && (
            <td>
              {dr && (
                <ActionIcon
                  w="100%"
                  variant="outline"
                  onClick={() => window.open(`${JSON.parse(dr)}`, "_blank")}
                >
                  <Flex align="center" justify="center" gap={2}>
                    <Text size={14}>File</Text> <IconFile size={14} />
                  </Flex>
                </ActionIcon>
              )}
            </td>
          )}
          {rirTable.columnList["si"] && (
            <td>
              {si && (
                <ActionIcon
                  w="100%"
                  variant="outline"
                  onClick={() => window.open(`${JSON.parse(si)}`, "_blank")}
                >
                  <Flex align="center" justify="center" gap={2}>
                    <Text size={14}>File</Text> <IconFile size={14} />
                  </Flex>
                </ActionIcon>
              )}
            </td>
          )}
          {rirTable.columnList["qcir"] && (
            <td>
              {qcir && (
                <ActionIcon
                  w="100%"
                  variant="outline"
                  onClick={() => window.open(`${JSON.parse(qcir)}`, "_blank")}
                >
                  <Flex align="center" justify="center" gap={2}>
                    <Text size={14}>File</Text> <IconFile size={14} />
                  </Flex>
                </ActionIcon>
              )}
            </td>
          )}
          {rirItemTable.show && (
            <td style={{ padding: 0 }}>
              <Table
                withBorder
                withColumnBorders
                pos="relative"
                h="100%"
                className={classes.rirTable}
                ref={containerRef}
              >
                <thead>
                  <tr>
                    {rirItemTable.columnList["item_description"] && (
                      <th className={classes.description}>Item Description</th>
                    )}
                    {rirItemTable.columnList["quantity"] && (
                      <th className={classes.normal}>Quantity</th>
                    )}
                    {rirItemTable.columnList["base_unit_of_measurement"] && (
                      <th className={classes.date}>Base Unit of Measurement</th>
                    )}
                    {rirItemTable.columnList["receiving_status"] && (
                      <th className={classes.long}>Receiving Status</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {itemName.map((item, index) => {
                    return (
                      <tr key={index} className={classes.cell}>
                        {rirItemTable.columnList["item_description"] && (
                          <td>
                            <Text fw={700}>{itemNameOnly[index]}</Text>
                            <pre style={{ marginTop: 10 }}>
                              <Text>{itemDescriptionOnly[index]}</Text>
                            </pre>
                          </td>
                        )}
                        {rirItemTable.columnList["quantity"] && (
                          <td>
                            <Text size={14}>
                              {addCommaToNumber(Number(itemQuantity[index]))}
                            </Text>
                          </td>
                        )}
                        {rirItemTable.columnList[
                          "base_unit_of_measurement"
                        ] && (
                          <td>
                            <Text size={14}>{itemUnit[index]}</Text>
                          </td>
                        )}
                        {rirItemTable.columnList["receiving_status"] && (
                          <td>
                            <Text size={14}>{itemStatus[index]}</Text>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </td>
          )}
        </tr>
      );
    });
  };

  const renderTransferReceipt = (
    request: SSOTType["requisition_sourced_item_request"][0]["sourced_item_ro_request"][0]["ro_transfer_receipt_request"]
  ) => {
    return request.map((request) => {
      const itemName: string[] = [];
      const itemQuantity: string[] = [];
      const itemUnit: string[] = [];
      const itemStatus: string[] = [];
      const items = request.transfer_receipt_request_response;
      const itemSourceProject: string[] = [];
      const itemNameOnly: string[] = [];
      const itemDescriptionOnly: string[] = [];

      let transferShipment = "";
      let transferReceipt = "";

      items.forEach((item) => {
        if (item.request_response_field_name === "Item") {
          const quantityMatch = item.request_response.match(/(\d+)/);
          if (!quantityMatch) return;
          itemName.push(
            JSON.parse(
              item.request_response.replace(
                quantityMatch[1],
                addCommaToNumber(Number(quantityMatch[1]))
              )
            )
          );
        } else if (item.request_response_field_name === "Quantity") {
          const matches = regExp.exec(itemName[itemQuantity.length]);
          const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

          itemQuantity.push(JSON.parse(item.request_response));
          itemUnit.push(`${unit}`);
        } else if (item.request_response_field_name === "Receiving Status") {
          itemStatus.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "Transfer Shipment") {
          transferShipment = item.request_response;
        } else if (item.request_response_field_name === "Transfer Receipt") {
          transferReceipt = item.request_response;
        } else if (item.request_response_field_name === "Source Project") {
          itemSourceProject.push(JSON.parse(item.request_response));
        }
      });

      itemName.forEach((item) => {
        const firstClosingIndex = item.indexOf(")");
        const secondClosingIndex = item
          .slice(firstClosingIndex + 1)
          .indexOf(")");

        const newItem = item.slice(0, firstClosingIndex + 1);
        const description = item
          .slice(firstClosingIndex + secondClosingIndex + 4, item.length - 3)
          .split(", ")
          .join("\n");
        itemNameOnly.push(newItem);
        itemDescriptionOnly.push(description);
      });

      return (
        <tr
          key={request.transfer_receipt_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {transferReceiptTable.columnList["transfer_receipt_id"] && (
            <td>{request.transfer_receipt_request_formsly_id}</td>
          )}
          {transferReceiptTable.columnList["date_created"] && (
            <td>
              {new Date(
                request.transfer_receipt_request_date_created
              ).toLocaleDateString()}
            </td>
          )}
          {transferReceiptTable.columnList["site_warehouse"] && (
            <td>{`${request.transfer_receipt_request_owner.user_first_name} ${request.transfer_receipt_request_owner.user_last_name}`}</td>
          )}
          {transferReceiptTable.columnList["transfer_shipment"] && (
            <td>
              {transferShipment && (
                <ActionIcon
                  w="100%"
                  variant="outline"
                  onClick={() =>
                    window.open(`${JSON.parse(transferShipment)}`, "_blank")
                  }
                >
                  <Flex align="center" justify="center" gap={2}>
                    <Text size={14}>File</Text> <IconFile size={14} />
                  </Flex>
                </ActionIcon>
              )}
            </td>
          )}
          {transferReceiptTable.columnList["transfer_receipt"] && (
            <td>
              {transferReceipt && (
                <ActionIcon
                  w="100%"
                  variant="outline"
                  onClick={() =>
                    window.open(`${JSON.parse(transferReceipt)}`, "_blank")
                  }
                >
                  <Flex align="center" justify="center" gap={2}>
                    <Text size={14}>File</Text> <IconFile size={14} />
                  </Flex>
                </ActionIcon>
              )}
            </td>
          )}

          {transferReceiptItemTable.show && (
            <td style={{ padding: 0 }}>
              <Table
                withBorder
                withColumnBorders
                pos="relative"
                h="100%"
                className={classes.transferReceiptTable}
                ref={containerRef}
              >
                <thead>
                  <tr>
                    {transferReceiptItemTable.columnList[
                      "item_description"
                    ] && (
                      <th className={classes.description}>Item Description</th>
                    )}
                    {transferReceiptItemTable.columnList["quantity"] && (
                      <th className={classes.normal}>Quantity</th>
                    )}
                    {transferReceiptItemTable.columnList[
                      "base_unit_of_measurement"
                    ] && (
                      <th className={classes.date}>Base Unit of Measurement</th>
                    )}
                    {transferReceiptItemTable.columnList[
                      "receiving_status"
                    ] && <th className={classes.long}>Receiving Status</th>}
                    {transferReceiptItemTable.columnList["source_project"] && (
                      <th className={classes.long}>Source Project</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {itemName.map((item, index) => {
                    return (
                      <tr key={index} className={classes.cell}>
                        {transferReceiptItemTable.columnList[
                          "item_description"
                        ] && (
                          <td>
                            <Text fw={700}>{itemNameOnly[index]}</Text>
                            <pre style={{ marginTop: 10 }}>
                              <Text>{itemDescriptionOnly[index]}</Text>
                            </pre>
                          </td>
                        )}
                        {transferReceiptItemTable.columnList["quantity"] && (
                          <td>
                            <Text size={14}>
                              {addCommaToNumber(Number(itemQuantity[index]))}
                            </Text>
                          </td>
                        )}
                        {transferReceiptItemTable.columnList[
                          "base_unit_of_measurement"
                        ] && (
                          <td>
                            <Text size={14}>{itemUnit[index]}</Text>
                          </td>
                        )}
                        {transferReceiptItemTable.columnList[
                          "receiving_status"
                        ] && (
                          <td>
                            <Text size={14}>{itemStatus[index]}</Text>
                          </td>
                        )}
                        {transferReceiptItemTable.columnList[
                          "source_project"
                        ] && (
                          <td>
                            <Text size={14}>{itemSourceProject[index]}</Text>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </td>
          )}
        </tr>
      );
    });
  };

  const renderReleaseOrder = (
    request: SSOTType["requisition_sourced_item_request"][0]["sourced_item_ro_request"]
  ) => {
    return request.map((request) => {
      const itemName: string[] = [];
      const itemQuantity: string[] = [];
      const itemUnit: string[] = [];
      const itemStatus: string[] = [];
      const items = request.ro_request_response;
      const itemSourceProject: string[] = [];
      const itemNameOnly: string[] = [];
      const itemDescriptionOnly: string[] = [];

      items.forEach((item) => {
        if (item.request_response_field_name === "Item") {
          const quantityMatch = item.request_response.match(/(\d+)/);
          if (!quantityMatch) return;
          itemName.push(
            JSON.parse(
              item.request_response.replace(
                quantityMatch[1],
                addCommaToNumber(Number(quantityMatch[1]))
              )
            )
          );
        } else if (item.request_response_field_name === "Quantity") {
          const matches = regExp.exec(itemName[itemQuantity.length]);
          const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

          itemQuantity.push(JSON.parse(item.request_response));
          itemUnit.push(`${unit}`);
        } else if (item.request_response_field_name === "Receiving Status") {
          itemStatus.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "Source Project") {
          itemSourceProject.push(JSON.parse(item.request_response));
        }
      });

      itemName.forEach((item) => {
        const firstClosingIndex = item.indexOf(")");
        const secondClosingIndex = item
          .slice(firstClosingIndex + 1)
          .indexOf(")");

        const newItem = item.slice(0, firstClosingIndex + 1);
        const description = item
          .slice(firstClosingIndex + secondClosingIndex + 4, item.length - 2)
          .split(", ")
          .join("\n");
        itemNameOnly.push(newItem);
        itemDescriptionOnly.push(description);
      });

      return (
        <tr
          key={request.ro_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {releaseOrderTable.columnList["ro_id"] && (
            <td>{request.ro_request_formsly_id}</td>
          )}
          {releaseOrderTable.columnList["date_created"] && (
            <td>
              {new Date(request.ro_request_date_created).toLocaleDateString()}
            </td>
          )}
          {releaseOrderTable.columnList["warehouse_corporate_support_lead"] && (
            <td>{`${request.ro_request_owner.user_first_name} ${request.ro_request_owner.user_last_name}`}</td>
          )}

          {releaseOrderItemTable.columnList && (
            <td style={{ padding: 0 }}>
              <Table
                withBorder
                withColumnBorders
                pos="relative"
                h="100%"
                className={classes.roTable}
                ref={containerRef}
              >
                <thead>
                  <tr>
                    {releaseOrderItemTable.columnList["item_description"] && (
                      <th className={classes.description}>Item Description</th>
                    )}
                    {releaseOrderItemTable.columnList["quantity"] && (
                      <th className={classes.normal}>Quantity</th>
                    )}
                    {releaseOrderItemTable.columnList[
                      "base_unit_of_measurement"
                    ] && (
                      <th className={classes.date}>Base Unit of Measurement</th>
                    )}
                    {releaseOrderItemTable.columnList["receiving_status"] && (
                      <th className={classes.long}>Receiving Status</th>
                    )}
                    {releaseOrderItemTable.columnList["source_project"] && (
                      <th className={classes.long}>Source Project</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {itemName.map((item, index) => {
                    return (
                      <tr key={index} className={classes.cell}>
                        {releaseOrderItemTable.columnList[
                          "item_description"
                        ] && (
                          <td>
                            <Text fw={700}>{itemNameOnly[index]}</Text>
                            <pre style={{ marginTop: 10 }}>
                              <Text>{itemDescriptionOnly[index]}</Text>
                            </pre>
                          </td>
                        )}
                        {releaseOrderItemTable.columnList["quantity"] && (
                          <td>
                            <Text size={14}>
                              {addCommaToNumber(Number(itemQuantity[index]))}
                            </Text>
                          </td>
                        )}
                        {releaseOrderItemTable.columnList[
                          "base_unit_of_measurement"
                        ] && (
                          <td>
                            <Text size={14}>{itemUnit[index]}</Text>
                          </td>
                        )}
                        {releaseOrderItemTable.columnList[
                          "receiving_status"
                        ] && (
                          <td>
                            <Text size={14}>{itemStatus[index]}</Text>
                          </td>
                        )}
                        {releaseOrderItemTable.columnList["source_project"] && (
                          <td>
                            <Text size={14}>{itemSourceProject[index]}</Text>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </td>
          )}
          {transferReceiptTable.show && (
            <td style={{ padding: 0 }}>
              {request.ro_transfer_receipt_request.length !== 0 ? (
                <Table
                  withBorder
                  withColumnBorders
                  h="100%"
                  className={classes.transferReceiptTable}
                >
                  <thead>
                    <tr>
                      {transferReceiptTable.columnList[
                        "transfer_receipt_id"
                      ] && (
                        <th className={classes.long}>Transfer Receipt ID</th>
                      )}
                      {transferReceiptTable.columnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {transferReceiptTable.columnList["site_warehouse"] && (
                        <th className={classes.processor}>Site Warehouse</th>
                      )}
                      {transferReceiptTable.columnList["transfer_shipment"] && (
                        <th className={classes.short}>Transfer Shipment</th>
                      )}
                      {transferReceiptTable.columnList["transfer_receipt"] && (
                        <th className={classes.short}>Transfer Receipt</th>
                      )}
                      {transferReceiptItemTable && <th>Item</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {renderTransferReceipt(request.ro_transfer_receipt_request)}
                  </tbody>
                </Table>
              ) : null}
            </td>
          )}
        </tr>
      );
    });
  };

  const renderQuotation = (
    request: SSOTType["requisition_quotation_request"]
  ) => {
    return request.map((request) => {
      const itemName: string[] = [];
      const itemPrice: string[] = [];
      const itemQuantity: string[] = [];
      const itemUnit: string[] = [];
      const itemNameOnly: string[] = [];
      const itemDescriptionOnly: string[] = [];

      let supplier,
        supplierQuotation: string,
        requestSendMethod,
        proofOfSending: string,
        paymentTerms,
        leadTime,
        requiredDownPayment = "";

      const requestReponse = request.quotation_request_response;

      requestReponse.forEach((response) => {
        if (response.request_response_field_name === "Item") {
          const quantityMatch = response.request_response.match(/(\d+)/);
          if (!quantityMatch) return;
          itemName.push(
            JSON.parse(
              response.request_response.replace(
                quantityMatch[1],
                addCommaToNumber(Number(quantityMatch[1]))
              )
            )
          );
        } else if (response.request_response_field_name === "Price per Unit") {
          itemPrice.push(JSON.parse(response.request_response));
        } else if (response.request_response_field_name === "Quantity") {
          const matches = regExp.exec(itemName[itemQuantity.length]);
          const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

          itemQuantity.push(JSON.parse(response.request_response));
          itemUnit.push(`${unit}`);
        } else if (response.request_response_field_name === "Supplier") {
          supplier = JSON.parse(response.request_response);
        } else if (
          response.request_response_field_name === "Supplier Quotation"
        ) {
          supplierQuotation = JSON.parse(response.request_response);
        } else if (
          response.request_response_field_name === "Request Send Method"
        ) {
          requestSendMethod = JSON.parse(response.request_response);
        } else if (
          response.request_response_field_name === "Proof of Sending"
        ) {
          proofOfSending = JSON.parse(response.request_response);
        } else if (response.request_response_field_name === "Payment Terms") {
          paymentTerms = JSON.parse(response.request_response);
        } else if (response.request_response_field_name === "Lead Time") {
          leadTime = addCommaToNumber(JSON.parse(response.request_response));
        } else if (
          response.request_response_field_name === "Required Down Payment"
        ) {
          requiredDownPayment = addCommaToNumber(
            JSON.parse(response.request_response)
          );
        }
      });

      itemName.forEach((item) => {
        const closingIndex = item.indexOf(")");
        const newItem = item.slice(0, closingIndex + 1);
        const description = item
          .slice(closingIndex + 3, item.length - 1)
          .split(", ")
          .join("\n");
        itemNameOnly.push(newItem);
        itemDescriptionOnly.push(description);
      });

      return (
        <tr
          key={request.quotation_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {quotationTable.columnList["quotation_id"] && (
            <td>{request.quotation_request_formsly_id}</td>
          )}
          {quotationTable.columnList["date_created"] && (
            <td>
              {new Date(
                request.quotation_request_date_created
              ).toLocaleDateString()}
            </td>
          )}
          {quotationTable.columnList["purchaser"] && (
            <td>{`${request.quotation_request_owner.user_first_name} ${request.quotation_request_owner.user_last_name}`}</td>
          )}
          {quotationTable.columnList["supplier"] && (
            <td style={{ wordBreak: "break-all" }}>{supplier}</td>
          )}
          {quotationTable.columnList["supplier_quotation"] && (
            <td>
              <ActionIcon
                w="100%"
                variant="outline"
                onClick={() => window.open(supplierQuotation, "_blank")}
              >
                <Flex align="center" justify="center" gap={2}>
                  <Text size={14}>File</Text> <IconFile size={14} />
                </Flex>
              </ActionIcon>
            </td>
          )}
          {quotationTable.columnList["request_send_method"] && (
            <td>{requestSendMethod}</td>
          )}
          {quotationTable.columnList["proof_of_sending"] && (
            <td>
              <ActionIcon
                w="100%"
                variant="outline"
                onClick={() => window.open(proofOfSending, "_blank")}
              >
                <Flex align="center" justify="center" gap={2}>
                  <Text size={14}>File</Text> <IconFile size={14} />
                </Flex>
              </ActionIcon>
            </td>
          )}
          {quotationTable.columnList["payment_terms"] && (
            <td>{paymentTerms}</td>
          )}
          {quotationTable.columnList["lead_time"] && (
            <td>{addCommaToNumber(Number(leadTime))}</td>
          )}
          {quotationTable.columnList["required_down_payment"] && (
            <td>₱ {requiredDownPayment}</td>
          )}
          {quotationItemTable.show && (
            <td style={{ padding: 0 }}>
              <Table
                withBorder
                withColumnBorders
                pos="relative"
                h="100%"
                className={classes.quotationTable}
                ref={containerRef}
              >
                <thead>
                  <tr>
                    {quotationItemTable.columnList["item_description"] && (
                      <th className={classes.description}>Item Description</th>
                    )}
                    {quotationItemTable.columnList["price_per_unit"] && (
                      <th className={classes.normal}>Price per Unit</th>
                    )}
                    {quotationItemTable.columnList["quantity"] && (
                      <th className={classes.normal}>Quantity</th>
                    )}
                    {quotationItemTable.columnList[
                      "base_unit_of_measurement"
                    ] && (
                      <th className={classes.date}>Base Unit of Measurement</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {itemName.map((item, index) => {
                    return (
                      <tr key={index} className={classes.cell}>
                        {quotationItemTable.columnList["item_description"] && (
                          <td>
                            <Text fw={700}>{itemNameOnly[index]}</Text>
                            <pre style={{ marginTop: 10 }}>
                              <Text>{itemDescriptionOnly[index]}</Text>
                            </pre>
                          </td>
                        )}
                        {quotationItemTable.columnList["price_per_unit"] && (
                          <td>
                            <Text size={14}>
                              ₱ {addCommaToNumber(Number(itemPrice[index]))}
                            </Text>
                          </td>
                        )}
                        {quotationItemTable.columnList["quantity"] && (
                          <td>
                            <Text size={14}>
                              {addCommaToNumber(Number(itemQuantity[index]))}
                            </Text>
                          </td>
                        )}
                        {quotationItemTable.columnList[
                          "base_unit_of_measurement"
                        ] && (
                          <td>
                            <Text size={14}>{itemUnit[index]}</Text>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </td>
          )}
          {quotationTable.show && (
            <td style={{ padding: 0 }}>
              {rirTable.show && request.quotation_rir_request.length !== 0 ? (
                <Table
                  withBorder
                  withColumnBorders
                  h="100%"
                  className={classes.rirTable}
                >
                  <thead style={{ height: 58 }}>
                    <tr>
                      {rirTable.columnList["rir_id"] && (
                        <th className={classes.long}>RIR ID</th>
                      )}
                      {rirTable.columnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {rirTable.columnList["site_warehouse"] && (
                        <th className={classes.processor}>Site Warehouse</th>
                      )}
                      {rirTable.columnList["dr"] && (
                        <th className={classes.short}>DR</th>
                      )}
                      {rirTable.columnList["si"] && (
                        <th className={classes.short}>SI</th>
                      )}
                      {rirTable.columnList["qcir"] && (
                        <th className={classes.short}>QCIR</th>
                      )}
                      {rirItemTable.show && <th>Item</th>}
                    </tr>
                  </thead>
                  <tbody>{renderRir(request.quotation_rir_request)}</tbody>
                </Table>
              ) : null}
            </td>
          )}
        </tr>
      );
    });
  };

  const renderSourcedItem = (
    request: SSOTType["requisition_sourced_item_request"]
  ) => {
    return request.map((request) => {
      const itemName: string[] = [];
      const itemSourceProject: string[] = [];
      const itemQuantity: string[] = [];
      const itemUnit: string[] = [];
      const itemNameOnly: string[] = [];
      const itemDescriptionOnly: string[] = [];

      const items = request.sourced_item_request_response.slice(1);

      items.forEach((item) => {
        if (item.request_response_field_name === "Item") {
          const quantityMatch = item.request_response.match(/(\d+)/);
          if (!quantityMatch) return;
          itemName.push(
            JSON.parse(
              item.request_response.replace(
                quantityMatch[1],
                addCommaToNumber(Number(quantityMatch[1]))
              )
            )
          );
        } else if (item.request_response_field_name === "Quantity") {
          const matches = regExp.exec(itemName[itemQuantity.length]);
          const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

          itemQuantity.push(JSON.parse(item.request_response));
          itemUnit.push(`${unit}`);
        } else if (item.request_response_field_name === "Source Project") {
          itemSourceProject.push(JSON.parse(item.request_response));
        }
      });

      itemName.forEach((item) => {
        const closingIndex = item.indexOf(")");
        const newItem = item.slice(0, closingIndex + 1);
        const description = item
          .slice(closingIndex + 3, item.length - 1)
          .split(", ")
          .join("\n");
        itemNameOnly.push(newItem);
        itemDescriptionOnly.push(description);
      });

      return (
        <tr
          key={request.sourced_item_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {sourcedItemTable.show && (
            <>
              {sourcedItemTable.columnList["sourced_item_id"] && (
                <td>{request.sourced_item_request_formsly_id}</td>
              )}
              {sourcedItemTable.columnList["date_created"] && (
                <td>
                  {new Date(
                    request.sourced_item_request_date_created
                  ).toLocaleDateString()}
                </td>
              )}
              {sourcedItemTable.columnList["lead_inventory_controller"] && (
                <td>{`${request.sourced_item_request_owner.user_first_name} ${request.sourced_item_request_owner.user_last_name}`}</td>
              )}
              {sourcedItemItemTable.show && (
                <td style={{ padding: 0 }}>
                  <Table
                    withBorder
                    withColumnBorders
                    pos="relative"
                    h="100%"
                    className={classes.sourcedItemTable}
                    ref={containerRef}
                  >
                    <thead>
                      <tr>
                        {sourcedItemItemTable.columnList[
                          "item_description"
                        ] && (
                          <th className={classes.description}>
                            Item Description
                          </th>
                        )}
                        {sourcedItemItemTable.columnList["quantity"] && (
                          <th className={classes.normal}>Quantity</th>
                        )}
                        {sourcedItemItemTable.columnList[
                          "base_unit_of_measurement"
                        ] && (
                          <th className={classes.date}>
                            Base Unit of Measurement
                          </th>
                        )}
                        {sourcedItemItemTable.columnList["source_project"] && (
                          <th className={classes.long}>Source Project</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {itemName.map((item, index) => {
                        return (
                          <tr key={index} className={classes.cell}>
                            {sourcedItemItemTable.columnList[
                              "item_description"
                            ] && (
                              <td>
                                <Text fw={700}>{itemNameOnly[index]}</Text>
                                <pre style={{ marginTop: 10 }}>
                                  <Text>{itemDescriptionOnly[index]}</Text>
                                </pre>
                              </td>
                            )}

                            {sourcedItemItemTable.columnList["quantity"] && (
                              <td>
                                <Text size={14}>
                                  {addCommaToNumber(
                                    Number(itemQuantity[index])
                                  )}
                                </Text>
                              </td>
                            )}
                            {sourcedItemItemTable.columnList[
                              "base_unit_of_measurement"
                            ] && (
                              <td>
                                <Text size={14}>{itemUnit[index]}</Text>
                              </td>
                            )}
                            {sourcedItemItemTable.columnList[
                              "source_project"
                            ] && (
                              <td>
                                <Text size={14}>
                                  {itemSourceProject[index]}
                                </Text>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </td>
              )}
              {releaseOrderTable.show && (
                <td style={{ padding: 0 }}>
                  {request.sourced_item_ro_request.length !== 0 ? (
                    <Table
                      withBorder
                      withColumnBorders
                      h="100%"
                      className={classes.roTable}
                    >
                      <thead>
                        <tr>
                          {releaseOrderTable.columnList["ro_id"] && (
                            <th className={classes.long}>Release Order ID</th>
                          )}
                          {releaseOrderTable.columnList["date_created"] && (
                            <th className={classes.date}>Date Created</th>
                          )}
                          {releaseOrderTable.columnList[
                            "warehouse_corporate_support_lead"
                          ] && (
                            <th className={classes.processor}>
                              Warehouse Corporate Support Lead
                            </th>
                          )}
                          {releaseOrderItemTable.show && <th>Item</th>}
                          {releaseOrderTable.show &&
                            transferReceiptTable.show && (
                              <th>Transfer Receipt</th>
                            )}
                        </tr>
                      </thead>
                      <tbody>
                        {renderReleaseOrder(request.sourced_item_ro_request)}
                      </tbody>
                    </Table>
                  ) : null}
                </td>
              )}
            </>
          )}
        </tr>
      );
    });
  };

  const renderRequisition = () => {
    return requisitionList.map((request) => {
      const itemName: string[] = [];
      const itemUnit: string[] = [];
      const itemQuantity: string[] = [];
      const itemDescription: string[] = [];
      const itemGlAccount: string[] = [];
      const itemCSICode: string[] = [];

      const fields = request.requisition_request_response.sort(
        (a: SSOTResponseType, b: SSOTResponseType) => {
          return (
            REQUISITION_FIELDS_ORDER.indexOf(a.request_response_field_name) -
            REQUISITION_FIELDS_ORDER.indexOf(b.request_response_field_name)
          );
        }
      );

      const items = fields.slice(0, -REQUISITION_FIELDS_ORDER.length);

      const sortedAndGroupedItems = sortAndGroupItems(items);
      sortedAndGroupedItems.forEach((group, groupIndex) => {
        itemDescription[groupIndex] = "";
        group.forEach((item) => {
          if (item.request_response_field_name === "General Name") {
            itemName[groupIndex] = JSON.parse(item.request_response);
          } else if (
            item.request_response_field_name === "Base Unit of Measurement"
          ) {
            itemUnit[groupIndex] = JSON.parse(item.request_response);
          } else if (item.request_response_field_name === "Quantity") {
            itemQuantity[groupIndex] = JSON.parse(item.request_response);
          } else if (item.request_response_field_name === "GL Account") {
            itemGlAccount[groupIndex] = JSON.parse(item.request_response);
          } else if (
            item.request_response_field_name === "CSI Code Description"
          ) {
            itemCSICode[groupIndex] = JSON.parse(item.request_response);
          } else if (
            [
              "CSI Code",
              "Division Description",
              "Level 2 Major Group Description",
              "Level 2 Minor Group Description",
            ].includes(item.request_response_field_name)
          ) {
          } else {
            itemDescription[groupIndex] += `${
              item.request_response_field_name
            }: ${JSON.parse(item.request_response)}\n`;
          }
        });
        itemDescription[groupIndex] = itemDescription[groupIndex].slice(0, -1);
      });

      return (
        <tr key={request.requisition_request_id} className={classes.cell}>
          {requisitionTable.show && (
            <>
              {requisitionTable.columnList["requisition_id"] && (
                <td>
                  {request.requisition_request_formsly_id ||
                    request.requisition_request_id}
                </td>
              )}
              {requisitionTable.columnList["date_created"] && (
                <td>
                  {new Date(
                    request.requisition_request_date_created
                  ).toLocaleDateString()}
                </td>
              )}

              {requisitionTable.columnList["operations/engineering"] && (
                <td>{`${request.requisition_request_owner.user_first_name} ${request.requisition_request_owner.user_last_name}`}</td>
              )}
              {fields
                .slice(-REQUISITION_FIELDS_ORDER.length)
                .map((response, index) => {
                  const fieldName =
                    response.request_response_field_name.toLowerCase();
                  const columnPropName = fieldName.replace(/\s+/g, "_");
                  const showColumn =
                    requisitionTable.columnList[columnPropName];

                  return (
                    showColumn && (
                      <td key={index}>
                        {response.request_response_field_type === "DATE"
                          ? new Date(
                              JSON.parse(response.request_response)
                            ).toLocaleDateString()
                          : JSON.parse(response.request_response) !== "null"
                          ? JSON.parse(response.request_response)
                          : ""}
                      </td>
                    )
                  );
                })}
              {requisitionItemTable.show && (
                <td style={{ padding: 0 }}>
                  <Table
                    withBorder
                    withColumnBorders
                    pos="relative"
                    h="100%"
                    className={classes.requisitionTable}
                    ref={containerRef}
                  >
                    <thead>
                      <tr>
                        {requisitionItemTable.columnList["general_name"] && (
                          <th className={classes.description}>General Name</th>
                        )}
                        {requisitionItemTable.columnList["quantity"] && (
                          <th className={classes.normal}>Quantity</th>
                        )}
                        {requisitionItemTable.columnList[
                          "base_unit_of_measurement"
                        ] && (
                          <th className={classes.date}>
                            Base Unit of Measurement
                          </th>
                        )}
                        {requisitionItemTable.columnList[
                          "item_description"
                        ] && (
                          <th className={classes.description}>Description</th>
                        )}
                        {requisitionItemTable.columnList["gl_account"] && (
                          <th className={classes.short}>GL Account</th>
                        )}
                        {requisitionItemTable.columnList["csi_code"] && (
                          <th className={classes.description}>CSI Code</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {itemName.map((item, index) => {
                        return (
                          <tr key={index} className={classes.cell}>
                            {requisitionItemTable.columnList[
                              "general_name"
                            ] && (
                              <td>
                                <Text size={14}>{item}</Text>
                              </td>
                            )}
                            {requisitionItemTable.columnList["quantity"] && (
                              <td>
                                <Text size={14}>
                                  {addCommaToNumber(
                                    Number(itemQuantity[index])
                                  )}
                                </Text>
                              </td>
                            )}
                            {requisitionItemTable.columnList[
                              "base_unit_of_measurement"
                            ] && (
                              <td>
                                <Text size={14}>{itemUnit[index]}</Text>
                              </td>
                            )}
                            {requisitionItemTable.columnList[
                              "item_description"
                            ] && (
                              <td>
                                <pre style={{ margin: 0 }}>
                                  <Text size={14}>
                                    {itemDescription[index]}
                                  </Text>
                                </pre>
                              </td>
                            )}
                            {requisitionItemTable.columnList["gl_account"] && (
                              <td>
                                <Text size={14}>{itemGlAccount[index]}</Text>
                              </td>
                            )}
                            {requisitionItemTable.columnList["csi_code"] && (
                              <td>
                                <Text size={14}>{itemCSICode[index]}</Text>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </td>
              )}
            </>
          )}
          {quotationTable.show && (
            <td style={{ padding: 0 }}>
              {request.requisition_quotation_request.length !== 0 ? (
                <Table
                  withBorder
                  withColumnBorders
                  h="100%"
                  className={classes.quotationTable}
                >
                  <thead>
                    <tr>
                      {quotationTable.columnList["quotation_id"] && (
                        <th className={classes.long}>Quotation ID</th>
                      )}
                      {quotationTable.columnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {quotationTable.columnList["purchaser"] && (
                        <th className={classes.processor}>Purchaser</th>
                      )}
                      {quotationTable.columnList["supplier"] && (
                        <th className={classes.long}>Supplier</th>
                      )}
                      {quotationTable.columnList["supplier_quotation"] && (
                        <th className={classes.normal}>Supplier Quotation</th>
                      )}
                      {quotationTable.columnList["request_send_method"] && (
                        <th className={classes.short}>Send Method</th>
                      )}
                      {quotationTable.columnList["proof_of_sending"] && (
                        <th className={classes.normal}>Proof of Sending</th>
                      )}
                      {quotationTable.columnList["payment_terms"] && (
                        <th className={classes.normal}>Payment Terms</th>
                      )}
                      {quotationTable.columnList["lead_time"] && (
                        <th className={classes.normal}>Lead Time</th>
                      )}
                      {quotationTable.columnList["required_down_payment"] && (
                        <th className={classes.long}>Required Down Payment</th>
                      )}
                      {quotationItemTable.show && <th>Item</th>}

                      {quotationTable.columnList && rirTable.show && (
                        <th>Receiving Inspecting Report</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {renderQuotation(request.requisition_quotation_request)}
                  </tbody>
                </Table>
              ) : null}
            </td>
          )}
          {sourcedItemTable.show && (
            <td style={{ padding: 0 }}>
              {request.requisition_sourced_item_request.length !== 0 ? (
                <Table
                  withBorder
                  withColumnBorders
                  h="100%"
                  className={classes.sourcedItemTable}
                >
                  <thead>
                    <tr>
                      {sourcedItemTable.columnList["sourced_item_id"] && (
                        <th className={classes.long}>Sourced Item ID</th>
                      )}
                      {sourcedItemTable.columnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {sourcedItemTable.columnList[
                        "lead_inventory_controller"
                      ] && (
                        <th className={classes.processor}>
                          Lead Inventory Controller
                        </th>
                      )}
                      {sourcedItemItemTable.show && <th>Item</th>}

                      {sourcedItemTable.show && releaseOrderTable.show && (
                        <th>Release Order</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {renderSourcedItem(
                      request.requisition_sourced_item_request
                    )}
                  </tbody>
                </Table>
              ) : null}
            </td>
          )}
        </tr>
      );
    });
  };

  const sortAndGroupItems = (fieldResponse: SSOTResponseType[]) => {
    const uniqueIdList = fieldResponse.reduce((unique, item) => {
      const { request_response_duplicatable_section_id } = item;
      // Check if the item's duplicatable_section_id is already in the unique array
      const isDuplicate = unique.some((uniqueItem) =>
        uniqueItem.includes(`${request_response_duplicatable_section_id}`)
      );
      // If the item is not a duplicate, add it to the unique array
      if (!isDuplicate) {
        unique.push(`${request_response_duplicatable_section_id}`);
      }

      return unique;
    }, [] as string[]);

    const returnValue = uniqueIdList.map((id) => {
      const fields = fieldResponse.filter(
        (response) =>
          `${response.request_response_duplicatable_section_id}` === id
      );
      return fields;
    });

    return returnValue;
  };

  return (
    <Flex direction="column" p="0">
      <Box ref={topElementRef}>
        <Group>
          <Title order={2} color="dimmed">
            SSOT Spreadsheet View
          </Title>

          <FormProvider {...filterSSOTMethods}>
            <form onSubmit={handleSubmit(handleFilterSSOT)}>
              <SSOTSpreadsheetViewFilter
                handleFilterSSOT={handleFilterSSOT}
                requestingProjectList={requestingProjectList}
                itemNameList={itemNameList}
              />
            </form>
          </FormProvider>
          <SSOTSpreadsheetViewTableFilter tables={tables} />
        </Group>
      </Box>

      <Paper mt="xs" p="xs" shadow="sm">
        <ScrollArea
          scrollbarSize={10}
          offsetScrollbars
          type={scrollBarType}
          onScrollCapture={handleScroll}
          viewportRef={viewport}
        >
          <Box
            mah={{
              base: height - (topElementHeight + 130),
              xs: height - (topElementHeight + 130),
              sm: height - (topElementHeight + 130),
              md: height - (topElementHeight + 150),
              lg: height - (topElementHeight + 145),
              600: height - (topElementHeight + 130),
              1030: height - (topElementHeight + 150),
            }}
          >
            <LoadingOverlay
              visible={isLoading}
              loader={<Loader variant="dots" />}
            />
            <Table
              withBorder
              withColumnBorders
              pos="relative"
              h="100%"
              className={classes.requisitionTable}
              ref={containerRef}
            >
              <thead>
                <tr>
                  {requisitionTable.show && (
                    <>
                      {requisitionTable.columnList["requisition_id"] && (
                        <th className={classes.long}>Requisition ID</th>
                      )}
                      {requisitionTable.columnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {requisitionTable.columnList[
                        "operations/engineering"
                      ] && (
                        <th className={classes.processor}>
                          Operations / Engineering
                        </th>
                      )}
                      {requisitionTable.columnList["requesting_project"] && (
                        <th className={classes.long}>Requesting Project</th>
                      )}
                      {requisitionTable.columnList["type"] && (
                        <th className={classes.normal}>Type</th>
                      )}
                      {requisitionTable.columnList["date_needed"] && (
                        <th className={classes.normal}>Date Needed</th>
                      )}
                      {requisitionTable.columnList["purpose"] && (
                        <th className={classes.long}>Purpose</th>
                      )}
                      {requisitionItemTable.show && <th>Item</th>}
                    </>
                  )}
                  {quotationTable.show && <th>Quotation</th>}
                  {sourcedItemTable.show && <th>Sourced Item</th>}
                </tr>
              </thead>
              <tbody>{renderRequisition()}</tbody>
            </Table>
          </Box>
        </ScrollArea>
      </Paper>
    </Flex>
  );
};

export default SSOTSpreadsheetView;
