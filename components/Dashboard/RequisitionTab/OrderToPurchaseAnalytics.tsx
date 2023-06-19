import { useUserProfile } from "@/stores/useUserStore";
import {
  generateFormslyFormResponseData,
  responseFieldReducer,
} from "@/utils/arrayFunctions";
import {
  FieldWithResponseType,
  FormslyFormResponseDataType,
  PurchaseTrendChartDataType,
  RequestByFormType,
} from "@/utils/types";
import { Container, SegmentedControl, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import PurchaseOrder from "./PurchaseOrder";
import PurchaseTrend from "./PurchaseTrend";

type Props = {
  selectedForm: string | null;
  requestListByForm: RequestByFormType[] | null;
};

const OrderToPurchaseAnalytics = ({ requestListByForm }: Props) => {
  const userProfile = useUserProfile();
  const [selectedPurchaseData, setSelectedPurchaseData] = useState("user");
  const [itemPurchaseTrendData, setItemPurchaseTrendData] = useState<
    PurchaseTrendChartDataType[] | null
  >(null);
  const [purchaseOrderData, setPurchaseOrderData] = useState<
    FormslyFormResponseDataType[] | null
  >(null);

  const [selectedBarChartItem, setSelectedBarChartItem] = useState("");

  const handleFilterRequisitionData = (
    requestList: RequestByFormType[],
    selectedPurchaseData: string
  ) => {
    if (requestList.length > 0) {
      const approvedRequestList = requestList.filter(
        (request) => request.request_status === "APPROVED"
      );

      const teamOrUserRequestList =
        selectedPurchaseData === "user"
          ? approvedRequestList.filter(
              (request) =>
                request.request_team_member.team_member_user.user_id ===
                userProfile?.user_id
            )
          : approvedRequestList;

      const itemSectionList = teamOrUserRequestList
        .flatMap((request) => request.request_form.form_section)
        .filter((section) => section.section_name === "Item");

      const fieldWithResponse: FieldWithResponseType = [];
      itemSectionList.forEach((section) =>
        section.section_field.forEach((field) => {
          if (field.field_response.length > 0) {
            fieldWithResponse.push(field);
          }
        })
      );
      const responseDataType = responseFieldReducer(fieldWithResponse);

      // get purchase trend data
      const dateCreatedList = teamOrUserRequestList.map((request) => ({
        id: request.request_id,
        date_created: request.request_date_created,
      }));
      const itemLabelList = fieldWithResponse.filter(
        (response) => response.field_name === "General Name"
      )[0];

      const purchaseTrendData = itemLabelList.field_response.map((response) => {
        const dateMatch = dateCreatedList.find(
          (item) => item.id === response.request_response_request_id
        )?.date_created;

        return {
          ...response,
          request_response_date_purchased: dateMatch,
        };
      });
      setItemPurchaseTrendData(purchaseTrendData);

      // get main and sub item data
      const uniqueSections: { id: string; name: string }[] = [];
      itemSectionList.forEach((section) => {
        const hasDuplicateIndex = uniqueSections.findIndex(
          (uniqueSection) => uniqueSection.id === section.section_id
        );
        if (hasDuplicateIndex < 0) {
          const newSection = {
            id: section.section_id,
            name: section.section_name,
          };
          uniqueSections.push(newSection);
        }
      });

      const groupedFieldResponse = generateFormslyFormResponseData(
        fieldWithResponse,
        responseDataType,
        uniqueSections
      );
      setPurchaseOrderData(groupedFieldResponse);

      return;
    } else {
      setPurchaseOrderData(null);
    }
  };

  useEffect(() => {
    if (requestListByForm) {
      handleFilterRequisitionData(requestListByForm, selectedPurchaseData);
    }
  }, [requestListByForm, selectedPurchaseData]);

  return (
    <Container h="100%" fluid>
      <SegmentedControl
        mb="md"
        value={selectedPurchaseData}
        onChange={setSelectedPurchaseData}
        data={[
          { value: "user", label: "Your Purchase Order" },
          { value: "team", label: "Team Purchase Order" },
          { value: "purchase", label: "Purchase Trend" },
        ]}
      />

      {selectedPurchaseData !== "purchase" &&
        purchaseOrderData &&
        purchaseOrderData.length > 0 && (
          <PurchaseOrder
            selectedBarChartItem={selectedBarChartItem}
            setSelectedBarChartItem={setSelectedBarChartItem}
            purchaseOrderData={purchaseOrderData}
          />
        )}

      {!purchaseOrderData && <Text>No data available.</Text>}

      {selectedPurchaseData === "purchase" && itemPurchaseTrendData && (
        <PurchaseTrend itemPurchaseTrendData={itemPurchaseTrendData} />
      )}
    </Container>
  );
};

export default OrderToPurchaseAnalytics;
