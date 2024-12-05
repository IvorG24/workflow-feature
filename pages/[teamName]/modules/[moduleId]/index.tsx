import { checkIfOwnerOrAdmin, getModulePageOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import ModulesPage from "@/components/ModulesPage/ModulesPage";
import { withOwnerOrApprover } from "@/utils/server-side-protections";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerOrApprover(
  async ({ supabaseClient, context, user, teamId }) => {
    try {
      const moduleId = context.query.moduleId as string;
      const data = await getModulePageOnLoad(supabaseClient, {
        moduleId,
      });
      const isOwnerOrApprover = await checkIfOwnerOrAdmin(supabaseClient, {
        userId: user.id,
        teamId: teamId,
      });

      if (!isOwnerOrApprover) {
        return {
          redirect: {
            destination: "/500",
            permanent: false,
          },
        };
      }
      return {
        props: { ...data },
      };
    } catch (e) {
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
        props: {},
      };
    }
  }
);

type Props = {
  moduleVersionId: string;
  initialData?: {
    initialLabel: string;
    initialVersion: number;
  };
};

const Page = ({
  moduleVersionId = "",
  initialData = { initialLabel: "", initialVersion: 0 },
}: Props) => {
  return (
    <>
      <Meta description="Modules Page" url="/teamName/modules/modulesId" />
      <ModulesPage
        mode="view"
        initialData={initialData}
        moduleVersionId={moduleVersionId}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
