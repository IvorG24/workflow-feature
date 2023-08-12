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
  List,
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
}));

export type SSOTFilterFormValues = {
  search: string;
  projectNameList: string[];
  itemNameList: string[];
  supplierList: string[];
};

type Props = {
  data: SSOTType[];
  projectNameList: string[];
  itemNameList: string[];
};

export type ShowColumnList = { [key: string]: boolean };

const requisitionTableColumnList = [
  "Requisition ID",
  "Date Created",
  "Operations/Engineering",
  "Project Name",
  "Type",
  "Date Needed",
  "Purpose",
  "Item Name",
  "Quantity",
  "Unit of Measurement",
  "Description",
  "Cost Code",
  "GL Account",
];

const quotationTableColumnList = [
  "Quotation ID",
  "Date Created",
  "Purchaser",
  "Supplier",
  "Supplier Quotation",
  "Send Method",
  "Proof of Sending",
  "Item",
  "Price Per Unit",
  "Quantity",
  "Unit of Measurement",
];

const sourcedItemTableColumnList = [
  "Sourced Item ID",
  "Date Created",
  "Lead Inventory Controller",
  "Item",
  "Quantity",
  "Unit of Measurement",
  "Project Site",
];

const rirTableColumnList = [
  "RIR ID",
  "Date Created",
  "Site Warehouse",
  "DR",
  "SI",
  "Item",
  "Quantity",
  "Unit of Measurement",
  "Receiving Status",
];

const releaseOrderTableColumnList = [
  "RO ID",
  "Date Created",
  "Warehouse Corporate Support Lead",
  "Item",
  "Quantity",
  "Unit of Measurement",
  "Receiving Status",
  "Project Site",
];

const chequeReferenceTableColumnList = [
  "Cheque Reference ID",
  "Date Created",
  "Treasury",
  "Treasury Status",
  "Cheque Cancelled",
  "Cheque Printed Date",
  "Cheque Clearing Date",
  "Cheque First Signatory Name",
  "Cheque First Date Signed",
  "Cheque Second Signatory Name",
  "Cheque Second Date Signed",
];

const convertColumnListArrayToObject = (array: string[]) => {
  const obj = array.reduce((obj, item) => {
    obj[item.toLowerCase().replace(/\s+/g, "_")] = true;
    return obj;
  }, {} as ShowColumnList);

  return obj;
};

const SSOTSpreadsheetView = ({
  data,
  projectNameList,
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

  const [showRequisitionTable, setShowRequisitionTable] = useState(true);
  const [showQuotationTable, setShowQuotationTable] = useState(true);
  const [showSourcedItemTable, setShowSourcedItemTable] = useState(true);
  const [showRIRTable, setShowRIRTable] = useState(true);
  const [showReleaseOrderTable, setShowReleaseOrderTable] = useState(true);
  const [showChequeReferenceTable, setShowChequeReferenceTable] =
    useState(true);

  const [showRequisitionColumnList, setShowRequisitionColumnList] =
    useState<ShowColumnList>(
      convertColumnListArrayToObject(requisitionTableColumnList)
    );

  const [showQuotationColumnList, setShowQuotationColumnList] =
    useState<ShowColumnList>(
      convertColumnListArrayToObject(quotationTableColumnList)
    );

  const [showSourcedItemColumnList, setShowSourcedItemColumnList] =
    useState<ShowColumnList>(
      convertColumnListArrayToObject(sourcedItemTableColumnList)
    );

  const [showRIRColumnList, setShowRIRColumnList] = useState<ShowColumnList>(
    convertColumnListArrayToObject(rirTableColumnList)
  );

  const [showReleaseOrderColumnList, setShowReleaseOrderColumnList] =
    useState<ShowColumnList>(
      convertColumnListArrayToObject(releaseOrderTableColumnList)
    );

  const [showChequeReferenceColumnList, setShowChequeReferenceColumnList] =
    useState<ShowColumnList>(
      convertColumnListArrayToObject(chequeReferenceTableColumnList)
    );

  const filterSSOTMethods = useForm<SSOTFilterFormValues>({
    defaultValues: {
      search: "",
      itemNameList: [],
      projectNameList: [],
      supplierList: [],
    },
    mode: "onChange",
  });

  const { handleSubmit, getValues } = filterSSOTMethods;
  const handleFilterSSOT = async (
    {
      search,
      projectNameList,
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
      projectNameList.length !== 0 && requisitionFilterCount++;
      itemNameList.length !== 0 && requisitionFilterCount++;
      trimmedSearch.length !== 0 && requisitionFilterCount++;

      const { data, error } = await supabaseClient.rpc("get_ssot", {
        input_data: {
          activeTeam: team.team_id,
          pageNumber: 1,
          rowLimit: DEFAULT_NUMBER_SSOT_ROWS,
          search: trimmedSearch,
          requisitionFilter: [
            ...projectNameList,
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
      projectNameList,
      itemNameList,
      supplierList,
    }: SSOTFilterFormValues = getValues()
  ) => {
    try {
      setIsLoading(true);
      setScrollBarType("never");

      const trimmedSearch = search.trim();

      let requisitionFilterCount = 0;
      projectNameList.length !== 0 && requisitionFilterCount++;
      itemNameList.length !== 0 && requisitionFilterCount++;
      trimmedSearch.length !== 0 && requisitionFilterCount++;

      const { data, error } = await supabaseClient.rpc("get_ssot", {
        input_data: {
          activeTeam: team.team_id,
          pageNumber: offset,
          rowLimit: DEFAULT_NUMBER_SSOT_ROWS,
          search: trimmedSearch,
          requisitionFilter: [
            ...projectNameList,
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

  const renderChequeReference = (
    request: SSOTType["requisition_cheque_reference_request"]
  ) => {
    return request.map((request) => {
      return (
        <tr
          key={request.cheque_reference_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {showChequeReferenceColumnList["cheque_reference_id"] && (
            <td>{request.cheque_reference_request_formsly_id}</td>
          )}
          {showChequeReferenceColumnList["date_created"] && (
            <td>
              {new Date(
                request.cheque_reference_request_date_created
              ).toLocaleDateString()}
            </td>
          )}
          {showChequeReferenceColumnList["treasury"] && (
            <td>{`${request.cheque_reference_request_owner.user_first_name} ${request.cheque_reference_request_owner.user_last_name}`}</td>
          )}

          {request.cheque_reference_request_response
            .slice(1)
            .map((response, index) => {
              const fieldName =
                response.request_response_field_name.toLowerCase();
              const columnPropName = fieldName.replace(/\s+/g, "_");
              const showColumn = showChequeReferenceColumnList[columnPropName];

              return (
                showColumn && (
                  <td key={index}>
                    {response.request_response_field_type === "DATE" ? (
                      new Date(
                        JSON.parse(response.request_response)
                      ).toLocaleDateString()
                    ) : response.request_response_field_type === "FILE" ? (
                      <ActionIcon
                        w="100%"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `${JSON.parse(response.request_response)}`,
                            "_blank"
                          )
                        }
                      >
                        <Flex align="center" justify="center" gap={2}>
                          <Text size={14}>File</Text> <IconFile size={14} />
                        </Flex>
                      </ActionIcon>
                    ) : (
                      `${JSON.parse(response.request_response)}`
                    )}
                  </td>
                )
              );
            })}
        </tr>
      );
    });
  };

  const renderRir = (
    request: SSOTType["requisition_quotation_request"][0]["quotation_rir_request"]
  ) => {
    return request.map((request) => {
      const itemName: string[] = [];
      const itemQuantity: string[] = [];
      const itemUnit: string[] = [];
      const itemStatus: string[] = [];
      const items = request.rir_request_response;
      let dr = "";
      let si = "";

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
        }
      });

      return (
        <tr
          key={request.rir_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {showRIRColumnList["rir_id"] && (
            <td>{request.rir_request_formsly_id}</td>
          )}
          {showRIRColumnList["date_created"] && (
            <td>
              {new Date(request.rir_request_date_created).toLocaleDateString()}
            </td>
          )}
          {showRIRColumnList["site_warehouse"] && (
            <td>{`${request.rir_request_owner.user_first_name} ${request.rir_request_owner.user_last_name}`}</td>
          )}
          {showRIRColumnList["dr"] && (
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
          {showRIRColumnList["si"] && (
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
          {showRIRColumnList["item"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemName.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{item}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showRIRColumnList["quantity"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemQuantity.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{addCommaToNumber(Number(item))}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showRIRColumnList["unit_of_measurement"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemUnit.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{item}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showRIRColumnList["receiving_status"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemStatus.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{item}</Text>
                  </List.Item>
                ))}
              </List>
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
      const itemProjectSite: string[] = [];

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
        } else if (item.request_response_field_name === "Project Site") {
          itemProjectSite.push(JSON.parse(item.request_response));
        }
      });

      return (
        <tr
          key={request.ro_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {showReleaseOrderColumnList["ro_id"] && (
            <td>{request.ro_request_formsly_id}</td>
          )}
          {showReleaseOrderColumnList["date_created"] && (
            <td>
              {new Date(request.ro_request_date_created).toLocaleDateString()}
            </td>
          )}
          {showReleaseOrderColumnList["warehouse_corporate_support_lead"] && (
            <td>{`${request.ro_request_owner.user_first_name} ${request.ro_request_owner.user_last_name}`}</td>
          )}
          {showReleaseOrderColumnList["item"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemName.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{item}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showReleaseOrderColumnList["quantity"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemQuantity.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{addCommaToNumber(Number(item))}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showReleaseOrderColumnList["unit_of_measurement"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemUnit.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{item}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showReleaseOrderColumnList["receiving_status"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemStatus.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{item}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showReleaseOrderColumnList["project_site"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemProjectSite.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{item}</Text>
                  </List.Item>
                ))}
              </List>
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

      const items = request.quotation_request_response.slice(
        3,
        request.quotation_request_response.length
      );

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
        } else if (item.request_response_field_name === "Price per Unit") {
          itemPrice.push(JSON.parse(item.request_response));
        } else if (item.request_response_field_name === "Quantity") {
          const matches = regExp.exec(itemName[itemQuantity.length]);
          const unit = matches && matches[1].replace(/[0-9,]/g, "").trim();

          itemQuantity.push(JSON.parse(item.request_response));
          itemUnit.push(`${unit}`);
        }
      });

      return (
        <tr
          key={request.quotation_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {showQuotationColumnList["quotation_id"] && (
            <td>{request.quotation_request_formsly_id}</td>
          )}
          {showQuotationColumnList["date_created"] && (
            <td>
              {new Date(
                request.quotation_request_date_created
              ).toLocaleDateString()}
            </td>
          )}
          {showQuotationColumnList["purchaser"] && (
            <td>{`${request.quotation_request_owner.user_first_name} ${request.quotation_request_owner.user_last_name}`}</td>
          )}
          {request.quotation_request_response
            .slice(1, 3)
            .map((response, index) => {
              const fieldName =
                response.request_response_field_name.toLowerCase();
              const columnPropName = fieldName.replace(/\s+/g, "_");
              const showColumn = showQuotationColumnList[columnPropName];

              return (
                showColumn && (
                  <td key={index}>
                    {response.request_response_field_type === "DATE" ? (
                      new Date(
                        JSON.parse(response.request_response)
                      ).toLocaleDateString()
                    ) : response.request_response_field_type === "FILE" ? (
                      <ActionIcon
                        w="100%"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `${JSON.parse(response.request_response)}`,
                            "_blank"
                          )
                        }
                      >
                        <Flex align="center" justify="center" gap={2}>
                          <Text size={14}>File</Text> <IconFile size={14} />
                        </Flex>
                      </ActionIcon>
                    ) : (
                      JSON.parse(response.request_response)
                    )}
                  </td>
                )
              );
            })}
          {showQuotationColumnList["send_method"] && (
            <td>
              {request.quotation_request_response[3]
                .request_response_field_name === "Request Send Method" &&
                JSON.parse(
                  request.quotation_request_response[3].request_response
                )}
            </td>
          )}
          {showQuotationColumnList["proof_of_sending"] && (
            <td>
              {request.quotation_request_response[4]
                .request_response_field_name === "Proof of Sending" && (
                <ActionIcon
                  w="100%"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `${JSON.parse(
                        request.quotation_request_response[4].request_response
                      )}`,
                      "_blank"
                    )
                  }
                >
                  <Flex align="center" justify="center" gap={2}>
                    <Text size={14}>File</Text> <IconFile size={14} />
                  </Flex>
                </ActionIcon>
              )}
            </td>
          )}
          {showQuotationColumnList["item"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemName.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{item}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showQuotationColumnList["price_per_unit"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemPrice.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>₱ {addCommaToNumber(Number(item))}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showQuotationColumnList["quantity"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemQuantity.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{addCommaToNumber(Number(item))}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showQuotationColumnList["unit_of_measurement"] && (
            <td>
              <List sx={{ listStyle: "none" }} spacing="xs">
                {itemUnit.map((item, index) => (
                  <List.Item key={index}>
                    <Text size={14}>{item}</Text>
                  </List.Item>
                ))}
              </List>
            </td>
          )}
          {showQuotationTable && (
            <td style={{ padding: 0 }}>
              {showRIRTable && request.quotation_rir_request.length !== 0 ? (
                <Table
                  withBorder
                  withColumnBorders
                  h="100%"
                  className={classes.rirTable}
                >
                  <thead>
                    <tr>
                      {showRIRColumnList["rir_id"] && (
                        <th className={classes.long}>RIR ID</th>
                      )}
                      {showRIRColumnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {showRIRColumnList["site_warehouse"] && (
                        <th className={classes.processor}>Site Warehouse</th>
                      )}
                      {showRIRColumnList["dr"] && (
                        <th className={classes.short}>DR</th>
                      )}
                      {showRIRColumnList["si"] && (
                        <th className={classes.short}>SI</th>
                      )}
                      {showRIRColumnList["item"] && (
                        <th className={classes.description}>Item</th>
                      )}
                      {showRIRColumnList["quantity"] && (
                        <th className={classes.normal}>Quantity</th>
                      )}
                      {showRIRColumnList["unit_of_measurement"] && (
                        <th className={classes.date}>Unit of Measurement</th>
                      )}
                      {showRIRColumnList["receiving_status"] && (
                        <th className={classes.long}>Receiving Status</th>
                      )}
                      {showRIRColumnList["project_site"] && (
                        <th className={classes.long}>Project Site</th>
                      )}
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
      const itemProjectSite: string[] = [];
      const itemQuantity: string[] = [];
      const itemUnit: string[] = [];

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
        } else if (item.request_response_field_name === "Project Site") {
          itemProjectSite.push(JSON.parse(item.request_response));
        }
      });

      return (
        <tr
          key={request.sourced_item_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          {showSourcedItemTable && (
            <>
              {showSourcedItemColumnList["sourced_item_id"] && (
                <td>{request.sourced_item_request_formsly_id}</td>
              )}
              {showSourcedItemColumnList["date_created"] && (
                <td>
                  {new Date(
                    request.sourced_item_request_date_created
                  ).toLocaleDateString()}
                </td>
              )}
              {showSourcedItemColumnList["lead_inventory_controller"] && (
                <td>{`${request.sourced_item_request_owner.user_first_name} ${request.sourced_item_request_owner.user_last_name}`}</td>
              )}

              {showSourcedItemColumnList["item"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemName.map((item, index) => (
                      <List.Item key={index}>
                        <Text size={14}>{item}</Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
              {showSourcedItemColumnList["quantity"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemQuantity.map((quantity, index) => (
                      <List.Item key={index}>
                        <Text size={14}>
                          {addCommaToNumber(Number(quantity))}
                        </Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
              {showSourcedItemColumnList["unit_of_measurement"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemUnit.map((unit, index) => (
                      <List.Item key={index}>
                        <Text size={14}>{unit}</Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
              {showSourcedItemColumnList["project_site"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemProjectSite.map((projectSite, index) => (
                      <List.Item key={index}>
                        <Text size={14}>{projectSite}</Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
              {showReleaseOrderTable && (
                <td style={{ padding: 0 }}>
                  {showReleaseOrderTable &&
                  request.sourced_item_ro_request.length !== 0 ? (
                    <Table
                      withBorder
                      withColumnBorders
                      h="100%"
                      className={classes.roTable}
                    >
                      <thead>
                        <tr>
                          {showReleaseOrderColumnList["ro_id"] && (
                            <th className={classes.long}>Release Order ID</th>
                          )}
                          {showReleaseOrderColumnList["date_created"] && (
                            <th className={classes.date}>Date Created</th>
                          )}
                          {showReleaseOrderColumnList[
                            "warehouse_corporate_support_lead"
                          ] && (
                            <th className={classes.processor}>
                              Warehouse Corporate Support Lead
                            </th>
                          )}
                          {showReleaseOrderColumnList["item"] && (
                            <th className={classes.description}>Item</th>
                          )}
                          {showReleaseOrderColumnList["quantity"] && (
                            <th className={classes.normal}>Quantity</th>
                          )}
                          {showReleaseOrderColumnList[
                            "unit_of_measurement"
                          ] && (
                            <th className={classes.long}>
                              Unit of Measurement
                            </th>
                          )}
                          {showReleaseOrderColumnList["receiving_status"] && (
                            <th className={classes.long}>Receiving Status</th>
                          )}
                          {showReleaseOrderColumnList["project_site"] && (
                            <th className={classes.long}>Project Site</th>
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
      const itemCostCode: string[] = [];
      const itemGlAccount: string[] = [];

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
            item.request_response_field_name === "Unit of Measurement"
          ) {
            itemUnit[groupIndex] = JSON.parse(item.request_response);
          } else if (item.request_response_field_name === "Quantity") {
            itemQuantity[groupIndex] = JSON.parse(item.request_response);
          } else if (item.request_response_field_name === "Cost Code") {
            itemCostCode[groupIndex] = JSON.parse(item.request_response);
          } else if (item.request_response_field_name === "GL Account") {
            itemGlAccount[groupIndex] = JSON.parse(item.request_response);
          } else {
            itemDescription[groupIndex] += `${
              item.request_response_field_name
            }: ${JSON.parse(item.request_response)}, `;
          }
        });
        itemDescription[groupIndex] = itemDescription[groupIndex].slice(0, -2);
      });

      return (
        <tr key={request.requisition_request_id} className={classes.cell}>
          {showRequisitionTable && (
            <>
              {showRequisitionColumnList["requisition_id"] && (
                <td>
                  {request.requisition_request_formsly_id ||
                    request.requisition_request_id}
                </td>
              )}
              {showRequisitionColumnList["date_created"] && (
                <td>
                  {new Date(
                    request.requisition_request_date_created
                  ).toLocaleDateString()}
                </td>
              )}

              {showRequisitionColumnList["operations/engineering"] && (
                <td>{`${request.requisition_request_owner.user_first_name} ${request.requisition_request_owner.user_last_name}`}</td>
              )}
              {fields
                .slice(-REQUISITION_FIELDS_ORDER.length)
                .map((response, index) => {
                  const fieldName =
                    response.request_response_field_name.toLowerCase();
                  const columnPropName = fieldName.replace(/\s+/g, "_");
                  const showColumn = showRequisitionColumnList[columnPropName];

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
              {showRequisitionColumnList["item_name"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemName.map((item, index) => (
                      <List.Item key={index}>
                        <Text size={14}>{item}</Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
              {showRequisitionColumnList["quantity"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemQuantity.map((item, index) => (
                      <List.Item key={index}>
                        <Text size={14}>{addCommaToNumber(Number(item))}</Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
              {showRequisitionColumnList["unit_of_measurement"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemUnit.map((item, index) => (
                      <List.Item key={index}>
                        <Text size={14}>{item}</Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
              {showRequisitionColumnList["description"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemDescription.map((item, index) => (
                      <List.Item key={index}>
                        <Text size={14}>{item}</Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
              {showRequisitionColumnList["cost_code"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemCostCode.map((item, index) => (
                      <List.Item key={index}>
                        <Text size={14}>{item}</Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
              {showRequisitionColumnList["gl_account"] && (
                <td>
                  <List sx={{ listStyle: "none" }} spacing="xs">
                    {itemGlAccount.map((item, index) => (
                      <List.Item key={index}>
                        <Text size={14}>{item}</Text>
                      </List.Item>
                    ))}
                  </List>
                </td>
              )}
            </>
          )}
          {showQuotationTable && (
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
                      {showQuotationColumnList["quotation_id"] && (
                        <th className={classes.long}>Quotation ID</th>
                      )}
                      {showQuotationColumnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {showQuotationColumnList["purchaser"] && (
                        <th className={classes.processor}>Purchaser</th>
                      )}
                      {showQuotationColumnList["supplier"] && (
                        <th className={classes.long}>Supplier</th>
                      )}
                      {showQuotationColumnList["supplier_quotation"] && (
                        <th className={classes.normal}>Supplier Quotation</th>
                      )}
                      {showQuotationColumnList["send_method"] && (
                        <th className={classes.short}>Send Method</th>
                      )}
                      {showQuotationColumnList["proof_of_sending"] && (
                        <th className={classes.normal}>Proof of Sending</th>
                      )}
                      {showQuotationColumnList["item"] && (
                        <th className={classes.description}>Item</th>
                      )}
                      {showQuotationColumnList["price_per_unit"] && (
                        <th className={classes.normal}>Price per Unit</th>
                      )}
                      {showQuotationColumnList["quantity"] && (
                        <th className={classes.normal}>Quantity</th>
                      )}
                      {showQuotationColumnList["unit_of_measurement"] && (
                        <th className={classes.date}>Unit of Measurement</th>
                      )}
                      {showQuotationTable && showRIRTable && (
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
          {showSourcedItemTable && (
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
                      {showSourcedItemColumnList["sourced_item_id"] && (
                        <th className={classes.long}>Sourced Item ID</th>
                      )}
                      {showSourcedItemColumnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {showSourcedItemColumnList[
                        "lead_inventory_controller"
                      ] && (
                        <th className={classes.processor}>
                          Lead Inventory Controller
                        </th>
                      )}
                      {showSourcedItemColumnList["item"] && (
                        <th className={classes.description}>Item</th>
                      )}
                      {showSourcedItemColumnList["quantity"] && (
                        <th className={classes.normal}>Quantity</th>
                      )}
                      {showSourcedItemColumnList["unit_of_measurement"] && (
                        <th className={classes.date}>Unit of Measurement</th>
                      )}
                      {showSourcedItemColumnList["project_site"] && (
                        <th className={classes.long}>Project Site</th>
                      )}
                      {showSourcedItemTable && showReleaseOrderTable && (
                        <th className={classes.description}>Release Order</th>
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
          {showChequeReferenceTable && (
            <td style={{ padding: 0 }}>
              {request.requisition_cheque_reference_request.length !== 0 ? (
                <Table
                  withBorder
                  withColumnBorders
                  h="100%"
                  className={classes.chequeReferenceTable}
                >
                  <thead>
                    <tr>
                      {showChequeReferenceColumnList["cheque_reference_id"] && (
                        <th className={classes.long}>Cheque Reference ID</th>
                      )}
                      {showChequeReferenceColumnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {showChequeReferenceColumnList["treasury"] && (
                        <th className={classes.processor}>Treasury</th>
                      )}
                      {showChequeReferenceColumnList["treasury_status"] && (
                        <th className={classes.normal}>Treasury Status</th>
                      )}
                      {showChequeReferenceColumnList["cheque_cancelled"] && (
                        <th className={classes.short}>Cheque Cancelled</th>
                      )}
                      {showChequeReferenceColumnList["cheque_printed_date"] && (
                        <th className={classes.date}>Cheque Printed Date</th>
                      )}
                      {showChequeReferenceColumnList[
                        "cheque_clearing_date"
                      ] && (
                        <th className={classes.date}>Cheque Clearing Date</th>
                      )}
                      {showChequeReferenceColumnList[
                        "cheque_first_signatory_name"
                      ] && (
                        <th className={classes.processor}>
                          Cheque First Signatory Name
                        </th>
                      )}
                      {showChequeReferenceColumnList[
                        "cheque_first_date_signed"
                      ] && (
                        <th className={classes.date}>
                          Cheque First Date Signed
                        </th>
                      )}
                      {showChequeReferenceColumnList[
                        "cheque_second_signatory_name"
                      ] && (
                        <th className={classes.processor}>
                          Cheque Second Signatory Name
                        </th>
                      )}
                      {showChequeReferenceColumnList[
                        "cheque_second_date_signed"
                      ] && (
                        <th className={classes.date}>
                          Cheque Second Date Signed
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {renderChequeReference(
                      request.requisition_cheque_reference_request
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
                projectNameList={projectNameList}
                itemNameList={itemNameList}
              />
            </form>
          </FormProvider>
          <SSOTSpreadsheetViewTableFilter
            // column list
            requisitionTableColumnList={requisitionTableColumnList}
            quotationTableColumnList={quotationTableColumnList}
            rirTableColumnList={rirTableColumnList}
            sourcedItemTableColumnList={sourcedItemTableColumnList}
            releaseOrderTableColumnList={releaseOrderTableColumnList}
            chequeReferenceTableColumnList={chequeReferenceTableColumnList}
            // table list state
            showRequisitionTable={showRequisitionTable}
            setShowRequisitionTable={setShowRequisitionTable}
            showQuotationTable={showQuotationTable}
            setShowQuotationTable={setShowQuotationTable}
            showSourcedItemTable={showSourcedItemTable}
            setShowSourcedItemTable={setShowSourcedItemTable}
            showRIRTable={showRIRTable}
            setShowRIRTable={setShowRIRTable}
            showReleaseOrderTable={showReleaseOrderTable}
            setShowReleaseOrderTable={setShowReleaseOrderTable}
            showChequeReferenceTable={showChequeReferenceTable}
            setShowChequeReferenceTable={setShowChequeReferenceTable}
            // column list state
            showRequisitionColumnList={showRequisitionColumnList}
            setShowRequisitionColumnList={setShowRequisitionColumnList}
            showQuotationColumnList={showQuotationColumnList}
            setShowQuotationColumnList={setShowQuotationColumnList}
            showSourcedItemColumnList={showSourcedItemColumnList}
            setShowSourcedItemColumnList={setShowSourcedItemColumnList}
            showRIRColumnList={showRIRColumnList}
            setShowRIRColumnList={setShowRIRColumnList}
            showReleaseOrderColumnList={showReleaseOrderColumnList}
            setShowReleaseOrderColumnList={setShowReleaseOrderColumnList}
            showChequeReferenceColumnList={showChequeReferenceColumnList}
            setShowChequeReferenceColumnList={setShowChequeReferenceColumnList}
          />
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
                  {showRequisitionTable && (
                    <>
                      {showRequisitionColumnList["requisition_id"] && (
                        <th className={classes.long}>Requisition ID</th>
                      )}
                      {showRequisitionColumnList["date_created"] && (
                        <th className={classes.date}>Date Created</th>
                      )}
                      {showRequisitionColumnList["operations/engineering"] && (
                        <th className={classes.processor}>
                          Operations / Engineering
                        </th>
                      )}
                      {showRequisitionColumnList["project_name"] && (
                        <th className={classes.long}>Project Name</th>
                      )}
                      {showRequisitionColumnList["type"] && (
                        <th className={classes.normal}>Type</th>
                      )}
                      {showRequisitionColumnList["date_needed"] && (
                        <th className={classes.normal}>Date Needed</th>
                      )}
                      {showRequisitionColumnList["purpose"] && (
                        <th className={classes.long}>Purpose</th>
                      )}
                      {showRequisitionColumnList["item_name"] && (
                        <th className={classes.description}>Item Name</th>
                      )}
                      {showRequisitionColumnList["quantity"] && (
                        <th className={classes.normal}>Quantity</th>
                      )}
                      {showRequisitionColumnList["unit_of_measurement"] && (
                        <th className={classes.date}>Unit of Measurement</th>
                      )}
                      {showRequisitionColumnList["description"] && (
                        <th className={classes.description}>Description</th>
                      )}
                      {showRequisitionColumnList["cost_code"] && (
                        <th className={classes.short}>Cost Code</th>
                      )}
                      {showRequisitionColumnList["gl_account"] && (
                        <th className={classes.short}>GL Account</th>
                      )}
                    </>
                  )}
                  {showQuotationTable && <th>Quotation</th>}
                  {showSourcedItemTable && <th>Sourced Item</th>}
                  {showChequeReferenceTable && <th>Cheque Reference</th>}
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
