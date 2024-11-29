import { getRequestId } from "@/backend/api/get";
import ITAssetRequestPage from "@/components/ITAssetRequestPage/ITAssetRequestPage";
import ItemRequestPage from "@/components/ItemRequestPage/ItemRequestPage";
import Meta from "@/components/Meta/Meta";
import OtherExpensesRequestPage from "@/components/OtherExpensesRequestPage/OtherExpensesRequestPage";
import PEDEquipmentRequestPage from "@/components/PEDEquipmentRequestPage/PEDEquipmentRequestPage";
import PEDItemRequestPage from "@/components/PEDItemRequestPage/PEDItemRequestPage";
import PEDPartRequestPage from "@/components/PEDPartRequestPage/PEDPartRequestPage";
import RequestPage from "@/components/RequestPage/RequestPage";
import ServicesRequestPage from "@/components/ServicesRequestPage/ServicesRequestPage";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { RequestWithResponseType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(
    async ({ supabaseClient, user, context }) => {
      try {
        const nextRequest = context.query.requestId as string;

        const requestIdToLoad = await getRequestId(supabaseClient, {
          moduleRequestId: context.query.moduleRequestId as string,
          nextRequest,
        });

        const { data, error } = await supabaseClient.rpc(
          "module_request_page_on_load",
          {
            input_data: {
              moduleRequestId: context.query.moduleRequestId as string,
              requestId: requestIdToLoad,
              userId: user.id,
            },
          }
        );

        if (error) throw error;

        return {
          props: data as Props,
        };
      } catch (e) {
        console.log(e);

        return {
          redirect: {
            destination: "/500",
            permanent: false,
          },
        };
      }
    }
  );

type Props = {
  request: RequestWithResponseType;
  moduleId: string;
  duplicatableSectionIdList: string[];
  sectionIdWithDuplicatableSectionIdList: {
    request_response_duplicatable_section_id: string;
    section_id: string;
  }[];
};

const Page = ({ request, moduleId, duplicatableSectionIdList }: Props) => {
  const formslyForm = () => {
    if (request.request_form.form_name === "Item") {
      return (
        <ItemRequestPage
          type="Module Request"
          moduleId={moduleId}
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "Services") {
      return (
        <ServicesRequestPage
          type="Module Request"
          moduleId={moduleId}
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "Other Expenses") {
      return (
        <OtherExpensesRequestPage
          type="Module Request"
          moduleId={moduleId}
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "PED Equipment") {
      return (
        <PEDEquipmentRequestPage
          type="Module Request"
          request={request}
          moduleId={moduleId}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "PED Part") {
      return (
        <PEDPartRequestPage
          type="Module Request"
          request={request}
          moduleId={moduleId}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "PED Item") {
      return (
        <PEDItemRequestPage
          type="Module Request"
          request={request}
          moduleId={moduleId}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "IT Asset") {
      return (
        <ITAssetRequestPage
          type="Module Request"
          request={request}
          moduleId={moduleId}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else {
      return (
        <RequestPage
          type="Module Request"
          moduleId={moduleId}
          request={request}
          isFormslyForm
        />
      );
    }
  };

  return (
    <>
      <Meta
        description="Request Page"
        url="/teamName/module-request/[moduleRequestId]"
      />

      {request.request_form.form_is_formsly_form ? formslyForm() : null}
      {!request.request_form.form_is_formsly_form ? (
        <RequestPage
          type="Module Request"
          moduleId={moduleId}
          request={request}
          isFormslyForm
        />
      ) : null}
    </>
  );
};

export default Page;
Page.Layout = "APP";
