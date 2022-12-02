import { Team } from "@/utils/types";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

const useTeams = () => {
  const { supabaseClient } = useSessionContext();
  const [data, setData] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { data: team_table, error: team_table_error } =
          await supabaseClient
            .from("team_table")
            .select("*")
            .abortSignal(ac.signal);

        if (team_table_error) throw team_table_error;

        setData(team_table);
      } catch (error) {
        setError("Failed to fetch teams");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [supabaseClient]);

  return { data, loading, error };
};

export default useTeams;
