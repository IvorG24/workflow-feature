import { getUserProfile, GetUserProfile } from "@/utils/queries";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

import useAuth from "./useAuth";

const useFetchUserProfile = (userId: string | null | undefined) => {
  const { session } = useAuth();
  const supabaseClient = useSupabaseClient();
  const [userProfile, setUserProfile] = useState<GetUserProfile>();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsFetching(true);
        if (!supabaseClient) return;
        if (!session) return;
        if (!userId) return;

        const data = await getUserProfile(supabaseClient, userId);

        setUserProfile(data);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error",
          message: "Failed to fetch user profile",
          color: "red",
        });
      } finally {
        setIsFetching(false);
      }
    })();
  }, [supabaseClient, session, userId]);

  return { userProfile, setUserProfile, isFetching };
};

export default useFetchUserProfile;
