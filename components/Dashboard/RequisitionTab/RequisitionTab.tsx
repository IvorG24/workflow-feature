import useFetchRequestListByForm from "@/hooks/useFetchRequestListByForm";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  generateFormslyResponseData,
  getItemPurchaseTrendData,
} from "@/utils/arrayFunctions/dashboard";
import { Container, SegmentedControl, Text } from "@mantine/core";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import PurchaseOrder from "./PurchaseOrder";
import PurchaseTrend from "./PurchaseTrend";

type Props = {
  selectedStatus: string | null;
  selectedForm: string | null;
};

const RequisitionTab = ({ selectedForm, selectedStatus }: Props) => {
  const activeTeam = useActiveTeam();
  const supabaseClient = useSupabaseClient();
  const [selectedPurchaseData, setSelectedPurchaseData] = useState("user");
  const [selectedBarChartItem, setSelectedBarChartItem] = useState("");

  const { requestList } = useFetchRequestListByForm({
    teamId: activeTeam.team_id,
    formId: selectedForm,
    requestStatus: selectedStatus,
    supabaseClient,
  });

  const sectionList = requestList.flatMap(
    (request) => request.request_form.form_section
  );
  const fieldResponseData = generateFormslyResponseData(sectionList);

  const approvedFieldResponseData = fieldResponseData.map((data) => {
    const responseData = data.responseData.map((field) => {
      const approvedResponseList = field.field_response.filter(
        (res) => res.request_response_request_status === "APPROVED"
      );

      return {
        ...field,
        field_response: approvedResponseList,
      };
    });

    return {
      ...data,
      responseData,
    };
  });

  const itemPurchaseTrendData = getItemPurchaseTrendData(
    approvedFieldResponseData
  );

  return (
    <Container p={0} h="100%" fluid>
      {fieldResponseData.length > 0 ? (
        <>
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
            fieldResponseData &&
            fieldResponseData.length > 0 && (
              <PurchaseOrder
                selectedPurchaseData={selectedPurchaseData}
                selectedBarChartItem={selectedBarChartItem}
                setSelectedBarChartItem={setSelectedBarChartItem}
                purchaseOrderData={fieldResponseData}
              />
            )}

          {selectedPurchaseData === "purchase" && itemPurchaseTrendData && (
            <PurchaseTrend itemPurchaseTrendData={itemPurchaseTrendData} />
          )}
        </>
      ) : (
        <Text>No data available.</Text>
      )}
    </Container>
  );
};

export default RequisitionTab;
