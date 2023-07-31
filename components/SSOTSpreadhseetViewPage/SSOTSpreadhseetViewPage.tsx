import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_NUMBER_SSOT_ROWS, OTP_FIELDS_ORDER } from "@/utils/constant";
import { Database } from "@/utils/database";
import { addCommaToNumber, regExp } from "@/utils/string";
import { SSOTResponseType, SSOTType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Flex,
  List,
  Loader,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Space,
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
  otpTable: {
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
  rirPurchasedTable: {
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
  rirSourcedTable: {
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
};

type Props = {
  data: SSOTType[];
  projectNameList: string[];
  itemNameList: string[];
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

  const [otpList, setOtpList] = useState(data);
  const [offset, setOffset] = useState(1);
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollBarType, setScrollBarType] = useState<"always" | "never">(
    "always"
  );
  const [isFetchable, setIsFetchable] = useState(
    otpList.length === DEFAULT_NUMBER_SSOT_ROWS
  );

  const filterSSOTMethods = useForm<SSOTFilterFormValues>({
    defaultValues: { search: "", itemNameList: [], projectNameList: [] },
    mode: "onChange",
  });

  const { handleSubmit, getValues } = filterSSOTMethods;

  const handleFilterSSOT = async (
    {
      search,
      projectNameList,
      itemNameList,
    }: SSOTFilterFormValues = getValues()
  ) => {
    try {
      setIsLoading(true);
      setScrollBarType("never");
      setOffset(1);
      const { data, error } = await supabaseClient.rpc("get_ssot", {
        input_data: {
          activeTeam: team.team_id,
          pageNumber: 1,
          rowLimit: DEFAULT_NUMBER_SSOT_ROWS,
          search,
          otpCondition: [...projectNameList, ...itemNameList],
          numberOfCondition:
            projectNameList.length !== 0 && itemNameList.length !== 0 ? 2 : 1,
        },
      });
      if (error) throw error;
      const formattedData = data as SSOTType[];
      if (formattedData.length === DEFAULT_NUMBER_SSOT_ROWS) {
        setIsFetchable(true);
      } else {
        setIsFetchable(false);
      }
      setOtpList(formattedData);
      viewport.current &&
        viewport.current.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
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
    }: SSOTFilterFormValues = getValues()
  ) => {
    try {
      setIsLoading(true);
      setScrollBarType("never");
      const { data, error } = await supabaseClient.rpc("get_ssot", {
        input_data: {
          activeTeam: team.team_id,
          pageNumber: offset,
          rowLimit: DEFAULT_NUMBER_SSOT_ROWS,
          search,
          otpCondition: [...projectNameList, ...itemNameList],
          numberOfCondition:
            projectNameList.length !== 0 && itemNameList.length !== 0 ? 2 : 1,
        },
      });
      if (error) throw error;
      if (data) {
        const formattedData = data as SSOTType[];
        if (formattedData.length < DEFAULT_NUMBER_SSOT_ROWS) {
          setIsFetchable(false);
        } else {
          setIsFetchable(true);
          setOtpList((prev) => [...prev, ...formattedData]);
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
    request: SSOTType["otp_cheque_reference_request"]
  ) => {
    return request.map((request) => {
      return (
        <tr
          key={request.cheque_reference_request_id}
          className={classes.cell}
          style={{ borderTop: "solid 1px #DEE2E6" }}
        >
          <td>{request.cheque_reference_request_id}</td>
          <td>
            {new Date(
              request.cheque_reference_request_date_created
            ).toLocaleDateString()}
          </td>
          <td>{`${request.cheque_reference_request_owner.user_first_name} ${request.cheque_reference_request_owner.user_last_name}`}</td>
          {request.cheque_reference_request_response
            .slice(1)
            .map((response, index) => {
              return (
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
              );
            })}
        </tr>
      );
    });
  };

  const renderRir = (
    request: SSOTType["otp_quotation_request"][0]["quotation_rir_request"]
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
          <td>{request.rir_request_id}</td>
          <td>
            {new Date(request.rir_request_date_created).toLocaleDateString()}
          </td>
          <td>{`${request.rir_request_owner.user_first_name} ${request.rir_request_owner.user_last_name}`}</td>
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
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemName.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemQuantity.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{addCommaToNumber(Number(item))}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemUnit.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemStatus.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
        </tr>
      );
    });
  };

  const renderQuotation = (request: SSOTType["otp_quotation_request"]) => {
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
          <td>{request.quotation_request_id}</td>
          <td>
            {new Date(
              request.quotation_request_date_created
            ).toLocaleDateString()}
          </td>
          <td>{`${request.quotation_request_owner.user_first_name} ${request.quotation_request_owner.user_last_name}`}</td>
          {request.quotation_request_response
            .slice(1, 3)
            .map((response, index) => {
              return (
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
              );
            })}
          <td>
            {request.quotation_request_response[3]
              .request_response_field_name === "Request Send Method" &&
              JSON.parse(
                request.quotation_request_response[3].request_response
              )}
          </td>
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
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemName.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemPrice.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>₱ {addCommaToNumber(Number(item))}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemQuantity.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{addCommaToNumber(Number(item))}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemUnit.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          {request.quotation_rir_request.length !== 0 ? (
            <td style={{ padding: 0 }}>
              <Table
                withBorder
                withColumnBorders
                h="100%"
                className={classes.rirPurchasedTable}
              >
                <thead>
                  <tr>
                    <th className={classes.long}>RIR ID</th>
                    <th className={classes.date}>Date Created</th>
                    <th className={classes.processor}>Warehouse Receiver</th>
                    <th className={classes.short}>DR</th>
                    <th className={classes.short}>SI</th>
                    <th className={classes.description}>Item</th>
                    <th className={classes.normal}>Quantity</th>
                    <th className={classes.date}>Unit of Measurement</th>
                    <th className={classes.long}>Receiving Status</th>
                  </tr>
                </thead>
                <tbody>{renderRir(request.quotation_rir_request)}</tbody>
              </Table>
            </td>
          ) : null}
        </tr>
      );
    });
  };

  const renderOtp = () => {
    return otpList.map((request) => {
      const itemName: string[] = [];
      const itemUnit: string[] = [];
      const itemQuantity: string[] = [];
      const itemDescription: string[] = [];
      const itemCostCode: string[] = [];
      const itemGlAccount: string[] = [];

      const fields = request.otp_request_response.sort(
        (a: SSOTResponseType, b: SSOTResponseType) => {
          return (
            OTP_FIELDS_ORDER.indexOf(a.request_response_field_name) -
            OTP_FIELDS_ORDER.indexOf(b.request_response_field_name)
          );
        }
      );

      const items = fields.slice(0, -OTP_FIELDS_ORDER.length);
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
        <tr key={request.otp_request_id} className={classes.cell}>
          <td>{request.otp_request_id}</td>
          <td>
            {new Date(request.otp_request_date_created).toLocaleDateString()}
          </td>
          <td>{`${request.otp_request_owner.user_first_name} ${request.otp_request_owner.user_last_name}`}</td>
          {fields.slice(-OTP_FIELDS_ORDER.length).map((response, index) => {
            return (
              <td key={index}>
                {response.request_response_field_type === "DATE"
                  ? new Date(
                      JSON.parse(response.request_response)
                    ).toLocaleDateString()
                  : JSON.parse(response.request_response) !== "null"
                  ? JSON.parse(response.request_response)
                  : ""}
              </td>
            );
          })}
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemName.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemQuantity.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{addCommaToNumber(Number(item))}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemUnit.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemDescription.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemCostCode.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td>
            <List sx={{ listStyle: "none" }} spacing="xs">
              {itemGlAccount.map((item, index) => (
                <List.Item key={index}>
                  <Text size={14}>{item}</Text>
                </List.Item>
              ))}
            </List>
          </td>
          <td style={{ padding: 0 }}>
            {request.otp_quotation_request.length !== 0 ? (
              <Table
                withBorder
                withColumnBorders
                h="100%"
                className={classes.quotationTable}
              >
                <thead>
                  <tr>
                    <th className={classes.long}>Quotation ID</th>
                    <th className={classes.date}>Date Created</th>
                    <th className={classes.processor}>Accounting Processor</th>
                    <th className={classes.long}>Supplier</th>
                    <th className={classes.normal}>Supplier Quotation</th>
                    <th className={classes.short}> Send Method</th>
                    <th className={classes.normal}>Proof of Sending</th>
                    <th className={classes.description}>Item</th>
                    <th className={classes.normal}>Price per Unit</th>
                    <th className={classes.normal}>Quantity</th>
                    <th className={classes.date}>Unit of Measurement</th>
                    <th>Receiving Inspecting Report (Purchased)</th>
                  </tr>
                </thead>
                <tbody>{renderQuotation(request.otp_quotation_request)}</tbody>
              </Table>
            ) : null}
          </td>
          <td style={{ padding: 0 }}>
            {request.otp_rir_request.length !== 0 ? (
              <Table
                withBorder
                withColumnBorders
                h="100%"
                className={classes.rirSourcedTable}
              >
                <thead>
                  <tr>
                    <th className={classes.long}>RIR ID</th>
                    <th className={classes.date}>Date Created</th>
                    <th className={classes.processor}>Warehouse Receiver</th>
                    <th className={classes.short}>DR</th>
                    <th className={classes.short}>SI</th>
                    <th className={classes.description}>Item</th>
                    <th className={classes.normal}>Quantity</th>
                    <th className={classes.date}>Unit of Measurement</th>
                    <th className={classes.long}>Receiving Status</th>
                  </tr>
                </thead>
                <tbody>{renderRir(request.otp_rir_request)}</tbody>
              </Table>
            ) : null}
          </td>
          <td style={{ padding: 0 }}>
            {request.otp_cheque_reference_request.length !== 0 ? (
              <Table
                withBorder
                withColumnBorders
                h="100%"
                className={classes.chequeReferenceTable}
              >
                <thead>
                  <tr>
                    <th className={classes.long}>Cheque Reference ID</th>
                    <th className={classes.date}>Date Created</th>
                    <th className={classes.processor}>Treasury Processor</th>
                    <th className={classes.normal}>Treasury Status</th>
                    <th className={classes.short}>Cheque Cancelled</th>
                    <th className={classes.date}>Cheque Printed Date</th>
                    <th className={classes.date}>Cheque Clearing Date</th>
                    <th className={classes.processor}>
                      Cheque First Signatory Name
                    </th>
                    <th className={classes.date}>Cheque First Date Signed</th>
                    <th className={classes.processor}>
                      Cheque Second Signatory Name
                    </th>
                    <th className={classes.date}>Cheque Second Date Signed</th>
                  </tr>
                </thead>
                <tbody>
                  {renderChequeReference(request.otp_cheque_reference_request)}
                </tbody>
              </Table>
            ) : null}
          </td>
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
        <Title order={2} color="dimmed">
          SSOT Spreadsheet View
        </Title>

        <Space h="sm" />
        <FormProvider {...filterSSOTMethods}>
          <form onSubmit={handleSubmit(handleFilterSSOT)}>
            <SSOTSpreadsheetViewFilter
              handleFilterSSOT={handleFilterSSOT}
              projectNameList={projectNameList}
              itemNameList={itemNameList}
            />
          </form>
        </FormProvider>
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
              className={classes.otpTable}
              ref={containerRef}
            >
              <thead>
                <tr>
                  <th className={classes.long}>OTP ID</th>
                  <th className={classes.date}>Date Created</th>
                  <th className={classes.processor}>Warehouse Processor</th>
                  <th className={classes.long}>Parent OTP ID</th>
                  <th className={classes.long}>Project Name</th>
                  <th className={classes.normal}>Type</th>
                  <th className={classes.date}>Date Needed</th>
                  <th className={classes.description}>Item Name</th>
                  <th className={classes.normal}>Quantity</th>
                  <th className={classes.date}>Unit of Measurement</th>
                  <th className={classes.description}>Description</th>
                  <th className={classes.short}>Cost Code</th>
                  <th className={classes.short}>GL Account</th>
                  <th>Quotation</th>
                  <th>Receiving Inspecting Report (Sourced)</th>
                  <th>Cheque Reference</th>
                </tr>
              </thead>
              <tbody>{renderOtp()}</tbody>
            </Table>
          </Box>
        </ScrollArea>
      </Paper>
    </Flex>
  );
};

export default SSOTSpreadsheetView;
