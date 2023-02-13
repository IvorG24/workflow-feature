import { getUserProfile, GetUserProfile } from "@/utils/queries";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

const useFetchUserProfile = (userId: string | null | undefined) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [userProfile, setUserProfile] = useState<GetUserProfile>();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsFetching(true);
        if (!user?.id) return;
        if (!userId) return;
        if (!supabaseClient) return;

        const data = await getUserProfile(supabaseClient, userId);

        setUserProfile(data);
        setIsFetching(false);
      } catch (error) {
        console.error(error);
        showNotification({
          message: "Failed to fetch user profile",
          color: "red",
        });
      }
    })();
  }, [userId, user?.id, supabaseClient]);

  return { userProfile, setUserProfile, isFetching };
};

export default useFetchUserProfile;
