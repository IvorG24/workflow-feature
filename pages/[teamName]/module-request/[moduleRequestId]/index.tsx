import { getRequestId } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
// import ModuleItAssetRequestPage from "@/components/ModuleItAssetRequestPage/ModuleItAssetRequestPage";
// import ModuleItemRequestPage from "@/components/ModuleItemRequestPage/ModuleItemRequestPage";
// import ModuleOtherExpensesRequestPage from "@/components/ModuleOtherExpensesRequestPage/ModuleOtherExpensesRequestPage";
// import ModulePEDEquipmentRequestPage from "@/components/ModulePEDEquipmentRequestPage/ModulePEDEquipmentRequestPage";
// import ModulePEDItemRequestPage from "@/components/ModulePEDItemRequestPage/ModulePEDItemRequestPage";
// import ModulePEDPartRequestPage from "@/components/ModulePEDPartRequestPage/ModulePEDPartRequestPage";
// import ModuleServicesRequestPage from "@/components/ModuleServicesRequestPage/ModuleServicesRequestPage";
// import ModuleRequestPage from "@/components/ModulesRequestPage/ModuleRequestPage";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { RequestWithModuleResponseType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(
    async ({ supabaseClient, user, context }) => {
      try {
        const nextRequest = context.query.requestId as string;
        const requestIdCollection = await getRequestId(supabaseClient, {
          moduleRequestId: context.query.moduleRequestId as string,
        });

        const currentRequestIndex = requestIdCollection.findIndex(
          (req) => req.request_id === nextRequest
        );

        let requestIdToLoad;
        if (currentRequestIndex === -1 || !nextRequest) {
          requestIdToLoad = requestIdCollection[0].request_id;
        } else {
          const nextIndex = currentRequestIndex + 1;
          if (nextIndex < requestIdCollection.length) {
            requestIdToLoad = requestIdCollection[nextIndex].request_id;
          } else {
            requestIdToLoad =
              requestIdCollection[currentRequestIndex].request_id;
          }
        }

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
  request: RequestWithModuleResponseType;
  moduleId: string;
  duplicatableSectionIdList: string[];
  sectionIdWithDuplicatableSectionIdList: {
    request_response_duplicatable_section_id: string;
    section_id: string;
  }[];
};

const Page = ({ request, moduleId, duplicatableSectionIdList }: Props) => {
  //   const formslyForm = () => {
  //     if (request.request_form.form_name === "Item") {
  //       return (
  //         <ModuleItemRequestPage
  //           moduleId={moduleId}
  //           request={request}
  //           duplicatableSectionIdList={duplicatableSectionIdList}
  //         />
  //       );
  //     } else if (request.request_form.form_name === "Services") {
  //       return (
  //         <ModuleServicesRequestPage
  //           moduleId={moduleId}
  //           request={request}
  //           duplicatableSectionIdList={duplicatableSectionIdList}
  //         />
  //       );
  //     } else if (request.request_form.form_name === "Other Expenses") {
  //       return (
  //         <ModuleOtherExpensesRequestPage
  //           moduleId={moduleId}
  //           request={request}
  //           duplicatableSectionIdList={duplicatableSectionIdList}
  //         />
  //       );
  //     } else if (request.request_form.form_name === "PED Equipment") {
  //       return (
  //         <ModulePEDEquipmentRequestPage
  //           request={request}
  //           moduleId={moduleId}
  //           duplicatableSectionIdList={duplicatableSectionIdList}
  //         />
  //       );
  //     } else if (request.request_form.form_name === "PED Part") {
  //       return (
  //         <ModulePEDPartRequestPage
  //           request={request}
  //           moduleId={moduleId}
  //           duplicatableSectionIdList={duplicatableSectionIdList}
  //         />
  //       );
  //     } else if (request.request_form.form_name === "PED Item") {
  //       return (
  //         <ModulePEDItemRequestPage
  //           request={request}
  //           moduleId={moduleId}
  //           duplicatableSectionIdList={duplicatableSectionIdList}
  //         />
  //       );
  //     } else if (request.request_form.form_name === "IT Asset") {
  //       return (
  //         <ModuleItAssetRequestPage
  //           request={request}
  //           moduleId={moduleId}
  //           duplicatableSectionIdList={duplicatableSectionIdList}
  //         />
  //       );
  //     } else {
  //       return (
  //         <ModuleRequestPage
  //           moduleId={moduleId}
  //           request={request}
  //           isFormslyForm
  //         />
  //       );
  //     }
  //   };

  return (
    <>
      <Meta
        description="Request Page"
        url="/teamName/module-request/[moduleRequestId]"
      />

      {/* {request.request_form.form_is_formsly_form ? formslyForm() : null}
      {!request.request_form.form_is_formsly_form ? (
        <ModuleRequestPage moduleId={moduleId} request={request} />
      ) : null} */}
    </>
  );
};

export default Page;
Page.Layout = "APP";
