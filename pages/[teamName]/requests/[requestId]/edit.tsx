import { getEditRequestOnLoad } from "@/backend/api/get";
import EditItemRequestPage from "@/components/EditItemRequestPage/EditItemRequestPage";
import EditOtherExpensesRequestPage from "@/components/EditOtherExpenesesRequestPage/EditOtherExpenesesRequestPage";
import EditPEDConsumableRequestPage from "@/components/EditPEDConsumableRequestPage/EditPEDConsumableRequestPage";
import EditPEDEquipmentRequestPage from "@/components/EditPEDEquipmentRequestPage/EditPEDEquipmentRequestPage";
import EditPEDPartRequestPage from "@/components/EditPEDPartRequestPage/EditPEDPartRequestPage";
import EditQuotationRequestPage from "@/components/EditQuotationRequestPage/EditQuotationRequestPage";
import EditReceivingInspectingReportPage from "@/components/EditReceivingInspectingReport/EditReceivingInspectingReport";
import EditReleaseOrderPage from "@/components/EditReleaseOrderPage/EditReleaseOrderPage";
import EditRequestPage from "@/components/EditRequestPage/EditRequestPage";
import EditServicesRequestPage from "@/components/EditServicesRequestPage/EditServicesRequestPage";
import EditSourcedItemRequestPage from "@/components/EditSourcedItemRequestPage/EditSourcedItemRequestPage";
import EditSubconRequestPage from "@/components/EditSubconRequestPage/EditSubconRequestPage";
import EditTransferReceiptPage from "@/components/EditTransferReceiptPage/EditTransferReceiptPage";
import Meta from "@/components/Meta/Meta";
import { safeParse } from "@/utils/functions";
import { withActiveTeam } from "@/utils/server-side-protections";
import { getInitials } from "@/utils/string";
import {
  FieldTableRow,
  FormType,
  OptionTableRow,
  RequestWithResponseType,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, user, context }) => {
    try {
      const referenceOnly = Boolean(context.query.referenceOnly === "true");
      const editRequestOnLoad = await getEditRequestOnLoad(supabaseClient, {
        userId: user.id,
        requestId: `${context.query.requestId}`,
        referenceOnly,
      });

      return {
        props: {
          ...editRequestOnLoad,
          referenceOnly,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

export type EditRequestOnLoadProps = {
  request: RequestWithResponseType;
  itemOptions: OptionTableRow[];
  serviceOptions: OptionTableRow[];
  originalItemOptions?: OptionTableRow[];
  projectOptions?: OptionTableRow[];
  sourceProjectList?: Record<string, string>;
  requestingProject?: string;
  specialApprover?: {
    special_approver_id: string;
    special_approver_item_list: string[];
    special_approver_signer: FormType["form_signer"][0];
  }[];
  referenceOnly: boolean;
  supplierOptions?: OptionTableRow[];
  preferredSupplierField?: FieldTableRow;
  categoryOptions?: OptionTableRow[];
  propertyNumberOptions?: OptionTableRow[];
  generalItemNameOptions?: OptionTableRow[];
  equipmentId: string;
};

const Page = ({
  request,
  itemOptions,
  serviceOptions = [],
  originalItemOptions = [],
  projectOptions = [],
  requestingProject = "",
  sourceProjectList = {},
  specialApprover = [],
  referenceOnly,
  supplierOptions = [],
  preferredSupplierField,
  categoryOptions = [],
  propertyNumberOptions = [],
  generalItemNameOptions = [],
  equipmentId,
}: EditRequestOnLoadProps) => {
  const { request_form: form } = request;

  const formslyForm = () => {
    switch (form.form_name) {
      case "Item":
        return (
          <EditItemRequestPage
            request={request}
            itemOptions={itemOptions}
            projectOptions={projectOptions}
            specialApprover={specialApprover}
            referenceOnly={referenceOnly}
            supplierOptions={supplierOptions}
            preferredSupplierField={preferredSupplierField}
          />
        );
      case "Services":
        return (
          <EditServicesRequestPage
            request={request}
            projectOptions={projectOptions}
            referenceOnly={referenceOnly}
          />
        );
      case "Other Expenses":
        return (
          <EditOtherExpensesRequestPage
            request={request}
            projectOptions={projectOptions}
            referenceOnly={referenceOnly}
          />
        );
      case "PED Equipment":
        return (
          <EditPEDEquipmentRequestPage
            request={request}
            projectOptions={projectOptions}
            categoryOptions={categoryOptions}
            referenceOnly={referenceOnly}
          />
        );
      case "PED Part":
        if (
          JSON.parse(
            request.request_form.form_section[0].section_field[2]
              .field_response[0].request_response
          ) === "Single"
        ) {
          const propertyNumberValue = safeParse(
            request.request_form.form_section[0].section_field[4]
              .field_response[0].request_response
          );
          if (Number(propertyNumberValue)) {
            const categoryValue = safeParse(
              request.request_form.form_section[0].section_field[1]
                .field_response[0].request_response
            );
            const value = `"${getInitials(
              categoryValue
            )}-${propertyNumberValue}"`;
            request.request_form.form_section[0].section_field[4].field_response[0].request_response =
              value;
          }
        }

        return (
          <EditPEDPartRequestPage
            request={request}
            projectOptions={projectOptions}
            categoryOptions={categoryOptions}
            referenceOnly={referenceOnly}
            generalItemNameOptions={generalItemNameOptions}
            equipmentId={equipmentId}
          />
        );
      case "PED Consumable":
        return (
          <EditPEDConsumableRequestPage
            request={request}
            projectOptions={projectOptions}
            itemOptions={itemOptions}
            propertyNumberOptions={propertyNumberOptions}
            referenceOnly={referenceOnly}
          />
        );
      case "Subcon":
        return (
          <EditSubconRequestPage
            request={request}
            serviceOptions={serviceOptions}
            projectOptions={projectOptions}
          />
        );
      case "Sourced Item":
        return (
          <EditSourcedItemRequestPage
            request={request}
            itemOptions={itemOptions}
            requestingProject={requestingProject}
          />
        );
      case "Release Order":
        return (
          <EditReleaseOrderPage
            request={request}
            itemOptions={itemOptions}
            originalItemOptions={originalItemOptions}
            sourceProjectList={sourceProjectList}
            requestingProject={requestingProject}
          />
        );
      case "Transfer Receipt":
        return (
          <EditTransferReceiptPage
            request={request}
            itemOptions={itemOptions}
            originalItemOptions={originalItemOptions}
            sourceProjectList={sourceProjectList}
            requestingProject={requestingProject}
          />
        );
      case "Quotation":
        return (
          <EditQuotationRequestPage
            request={request}
            itemOptions={itemOptions}
            originalItemOptions={originalItemOptions}
            requestingProject={requestingProject}
          />
        );
      case "Receiving Inspecting Report":
        return (
          <EditReceivingInspectingReportPage
            request={request}
            itemOptions={itemOptions}
            originalItemOptions={originalItemOptions}
            requestingProject={requestingProject}
          />
        );
    }
  };

  return (
    <>
      <Meta
        description="Edit Request Page"
        url="/<teamName>/requests/[requestId]/edit"
      />
      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? (
        <EditRequestPage request={request} />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
