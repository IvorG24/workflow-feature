import { getUserActiveTeamId } from "@/backend/api/get";
import { checkIfEmailExists } from "@/backend/api/post";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SupabaseClient, User } from "@supabase/supabase-js";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { SIGN_IN_PAGE_PATH } from "./constant";
import { Database } from "./database";

export const withAuth = <P extends { [key: string]: any }>(
  getServerSidePropsFunc: (params: {
    context: GetServerSidePropsContext;
    supabaseClient: SupabaseClient<Database>;
    user: User;
  }) => Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P> => {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const supabaseClient = createServerSupabaseClient(context);

    try {
      // * 1. Check if user is authenticated
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        return {
          redirect: {
            destination: SIGN_IN_PAGE_PATH,
            permanent: false,
          },
        };
      }

      const user = session.user;
      if (!user) throw new Error("No email in session");

      return await getServerSidePropsFunc({ context, supabaseClient, user });
    } catch (error) {
      console.error(error);
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  };
};

export const withAuthAndOnboarding = <P extends { [key: string]: any }>(
  getServerSidePropsFunc: (params: {
    context: GetServerSidePropsContext;
    supabaseClient: SupabaseClient<Database>;
    user: User;
    teamId: string;
  }) => Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P> => {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const supabaseClient = createServerSupabaseClient(context);

    try {
      // * 1. Check if user is authenticated
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        return {
          redirect: {
            destination: SIGN_IN_PAGE_PATH,
            permanent: false,
          },
        };
      }
      if (!session?.user?.email) throw new Error("No email in session");

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

      const user = session.user;

      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      return getServerSidePropsFunc({ context, supabaseClient, user, teamId });
    } catch (error) {
      console.error(error);
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  };
};
