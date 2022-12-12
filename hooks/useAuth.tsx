import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

// * I returened the user object only instead of the whole session object because I don't think we need the rest of the session object.
const useAuth = () => {
  const { supabaseClient, isLoading, session } = useSessionContext();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (isLoading) return;
    if (!session?.user) {
      router.push("/sign-in");
      return;
    }
  }, [supabaseClient, isLoading, session, router]);

  return { isLoading, user: session?.user };
};

export default useAuth;
