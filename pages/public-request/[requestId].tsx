import { getTeam, getUserActiveTeamId } from "@/backend/api/get";
import { checkIfEmailExists } from "@/backend/api/post";
import ITAssetRequestPage from "@/components/ITAssetRequestPage/ITAssetRequestPage";
import ItemRequestPage from "@/components/ItemRequestPage/ItemRequestPage";
import Meta from "@/components/Meta/Meta";
import OtherExpensesRequestPage from "@/components/OtherExpensesRequestPage/OtherExpensesRequestPage";
import PEDEquipmentRequestPage from "@/components/PEDEquipmentRequestPage/PEDEquipmentRequestPage";
import PEDItemRequestPage from "@/components/PEDItemRequestPage/PEDItemRequestPage";
import PEDPartRequestPage from "@/components/PEDPartRequestPage/PEDPartRequestPage";
import PaymentRequestPage from "@/components/PaymentRequestPage/PaymentRequestPage";
import RequestPage from "@/components/RequestPage/RequestPage";
import ServicesRequestPage from "@/components/ServicesRequestPage/ServicesRequestPage";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { RequestWithResponseType } from "@/utils/types";
import { Space } from "@mantine/core";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabaseClient = createPagesServerClient(context);
  try {
    const { data, error } = await supabaseClient.rpc(
      "public_request_page_on_load",
      {
        input_data: {
          requestId: context.query.requestId,
        },
      }
    );
    if (error) throw error;
    // * 1. Check if there is user active session
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (session) {
      if (!session?.user?.email) {
        return {
          redirect: {
            destination: "/sign-in",
            permanent: false,
          },
        };
      }

      // * 2. Check if user is onboarded
      if (
        !(await checkIfEmailExists(supabaseClient, {
          email: session.user.email,
        }))
      ) {
        return {
          redirect: {
            destination: "/onboarding",
            permanent: false,
          },
        };
      }

      // * 3. Check if user has active team
      const user = session.user;

      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      if (!teamId) {
        return {
          redirect: {
            destination: "/create-team",
            permanent: false,
          },
        };
      }

      const activeTeam = await getTeam(supabaseClient, { teamId });

      if (activeTeam) {
        return {
          redirect: {
            destination: `/${formatTeamNameToUrlKey(
              activeTeam.team_name
            )}/requests/${data.request.request_formsly_id}`,
            permanent: false,
          },
        };
      }
    }

    return {
      props: data,
    };
  } catch (e) {
    console.error(e);
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
};

type Props = {
  request: RequestWithResponseType;
  duplicatableSectionIdList: string[];
};

const Page = ({ request, duplicatableSectionIdList }: Props) => {
  const formslyForm = () => {
    if (request.request_form.form_name === "Item") {
      return (
        <ItemRequestPage
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "Services") {
      return (
        <ServicesRequestPage
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "Other Expenses") {
      return (
        <OtherExpensesRequestPage
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "PED Equipment") {
      return (
        <PEDEquipmentRequestPage
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "PED Part") {
      return (
        <PEDPartRequestPage
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "PED Item") {
      return (
        <PEDItemRequestPage
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else if (request.request_form.form_name === "Request For Payment") {
      return <PaymentRequestPage request={request} />;
    } else if (request.request_form.form_name === "IT Asset") {
      return (
        <ITAssetRequestPage
          request={request}
          duplicatableSectionIdList={duplicatableSectionIdList}
        />
      );
    } else {
      return <RequestPage request={request} isFormslyForm />;
    }
  };

  return (
    <>
      <Meta
        description="Public Request Page"
        url="/public-request/[requestId]"
      />
      <Space h="xl" />
      {request.request_form.form_is_formsly_form ? formslyForm() : null}
      {!request.request_form.form_is_formsly_form ? (
        <RequestPage request={request} />
      ) : null}
      <Space h="xl" />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
