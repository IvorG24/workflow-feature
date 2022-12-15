import { fetchEmptyForm, FetchEmptyForm } from "@/utils/queries";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import showNotification from "./showNotifications";
import useAuth from "./useAuth";

const useFetchEmptyForm = (formId: number) => {
  const { user } = useAuth();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const [emptyForm, setEmptyForm] = useState<FetchEmptyForm>({
    formTableRow: null,
    fieldTableRowList: null,
  });

  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;
        if (!user) return;

        const emptyForm = await fetchEmptyForm(supabaseClient, formId);
        setEmptyForm(emptyForm);
      } catch (e) {
        console.error(e);
        showNotification({
          message: "Failed to fetch form.",
          state: "Danger",
          title: "Error",
        });
      }
    })();
  }, [supabaseClient, user, router]);

  return { emptyForm };
};

export default useFetchEmptyForm;
