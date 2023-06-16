import { checkIfOwnerOrAdmin, getUserActiveTeamId } from "@/backend/api/get";
import { checkIfEmailExists } from "@/backend/api/post";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
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
    const supabaseClient = createPagesServerClient(context);

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
  }) => Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P> => {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const supabaseClient = createPagesServerClient(context);

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

      return getServerSidePropsFunc({ context, supabaseClient, user });
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

export const withOwnerOrAdmin = <P extends { [key: string]: any }>(
  getServerSidePropsFunc: (params: {
    context: GetServerSidePropsContext;
    supabaseClient: SupabaseClient<Database>;
    user: User;
  }) => Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P> => {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const supabaseClient = createPagesServerClient(context);

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

      // * 3. Check if user is admin or owner
      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (!teamId) throw new Error("No team found");
      const isOwnerOrAdmin = await checkIfOwnerOrAdmin(supabaseClient, {
        userId: user.id,
        teamId: teamId,
      });
      if (!isOwnerOrAdmin) throw new Error("User is not an owner or admin");

      return getServerSidePropsFunc({ context, supabaseClient, user });
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
