import CreateTeam from "@/components/CreateTeamPage/CreateTeam";
import InviteUser from "@/components/CreateTeamPage/InviteUser";
import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import Meta from "@/components/Meta/Meta";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { resetServerContext } from "react-beautiful-dnd";
import type { NextPageWithLayout } from "../_app";

export const getServerSideProps: GetServerSideProps = async () => {
  resetServerContext();
  return {
    props: {
      data: [],
    },
  };
};

// todo: fix meta tags
const FormTeam: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Create Team"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/forms/type"
      />
      <CreateTeam />
    </div>
  );
};

// todo: fix meta tags
const FormInvite: NextPageWithLayout = () => {
  return (
    <div>
      <Meta
        description="Invite users"
        // this is just a temporary url, canoncial url will be set in the future
        url="localhost:3000/forms/question"
      />
      <InviteUser />
    </div>
  );
};

FormInvite.getLayout = function getLayout(page: ReactElement) {
  return <WorkspaceLayout>{page}</WorkspaceLayout>;
};

const CreateForm = () => {
  const router = useRouter();
  const { step } = router.query;
  return Number(step) === 1 ? <FormTeam /> : <FormInvite />;
};

export default CreateForm;
