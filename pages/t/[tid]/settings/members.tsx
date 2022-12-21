import TeamLayout from "@/components/Layout/TeamLayout";
import Meta from "@/components/Meta/Meta";
import Setting from "@/components/Setting/Setting";
import {
  MemberListActionEnum,
  useMemberListContext,
} from "@/contexts/MemberListContext";

import { FetchTeamMemberList, fetchTeamMemberList } from "@/utils/queries";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import { ReactElement, useEffect } from "react";
import type { NextPageWithLayout } from "../../../_app";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("Not authorized");
    const fetchedMemberList = await fetchTeamMemberList(
      supabase,
      `${ctx.query.tid}`
    );
    return {
      props: {
        memberList: fetchedMemberList,
      },
    };
  } catch (error) {
    return {
      props: {
        memberList: null,
      },
    };
  }
};

type Props = {
  memberList: FetchTeamMemberList;
};

const MemberSettingsPage: NextPageWithLayout<Props> = ({ memberList }) => {
  const { dispatchMemberList } = useMemberListContext();

  useEffect(() => {
    dispatchMemberList({
      type: MemberListActionEnum.SET,
      payload: {
        memberList,
      },
    });
  }, [memberList]);

  return (
    <div>
      <Meta
        description="Member Settings Page"
        url="localhost:3000/settings/members"
      />
      <Setting activeTab="members" />
    </div>
  );
};

MemberSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default MemberSettingsPage;
