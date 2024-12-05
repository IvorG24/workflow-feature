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
        props: { ...data, moduleId },
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
  initialData?: {
    initialLabel: string;
    initialVersion: number;
  };
  moduleVersionId: string;
  moduleId: string;
};

const Page = ({
  initialData = { initialLabel: "", initialVersion: 0 },
  moduleVersionId = "",
  moduleId = "",
}: Props) => {
  return (
    <>
      <Meta description="Modules Page" url="/teamName/modules/modulesId/edit" />
      <ModulesPage
        mode="edit"
        initialData={initialData}
        moduleVersionId={moduleVersionId}
        moduleId={moduleId}
      />
    </>
  );
};

export default Page;
Page.Layout = "APP";
