import Account from "@/components/Account/Account";
import type { Database } from "@/utils/types";
import { Team, UserProfile } from "@/utils/types";
import { Container } from "@mantine/core";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!session) return;

    (async () => {
      try {
        const { data: user_profile_table, error } = await supabase
          .from("user_profile_table")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;

        setProfile(user_profile_table);
      } catch (error) {
        console.error(error);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [session?.user.id, supabase, session]);

  useEffect(() => {
    if ((profileLoading && profile) || !session?.user.id) return;

    (async () => {
      try {
        const { error } = await supabase
          .from("user_profile_table")
          .insert([{ user_id: session.user.id }]);

        if (error) throw error;

        router.push("/teams/create?step=1");
      } catch (error) {
        console.error(error);
      }
    })();
  }, [profile, profileLoading, session?.user.id, supabase, router]);

  useEffect(() => {
    if (!session) return;

    (async () => {
      try {
        const { data: team_table, error } = await supabase
          .from("team_table")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;

        setTeam(team_table);
      } catch (error) {
        console.error(error);
      } finally {
        setTeamLoading(false);
      }
    })();
  }, [supabase, session]);

  useEffect(() => {
    if (!session || teamLoading || team || !profile) return;

    router.push("/teams/create?step=1");
  }, [session, teamLoading, team, router, profile]);

  return (
    <Container>
      {!session ? (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      ) : (
        <Account session={session} />
      )}
    </Container>
  );
};

export default Home;
