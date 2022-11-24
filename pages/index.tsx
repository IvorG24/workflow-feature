import Account from "@/components/Account/Account";
import type { Database } from "@/utils/types";
import { Container } from "@mantine/core";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();

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
