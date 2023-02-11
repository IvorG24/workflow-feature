import { Button, Center, Flex, Text } from "@mantine/core";

import Onboarding from "@/components/OnboardingPage/Onboarding";
import { isUserOnboarded } from "@/utils/queries";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "./_app";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/authentication",
        permanent: false,
      },
    };
  }

  const isOnboarded = await isUserOnboarded(supabaseClient, session?.user?.id);

  return {
    props: {
      isOnboarded,
    },
  };
};

const OnboardingPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ isOnboarded }) => {
  const router = useRouter();

  return (
    <>
      {isOnboarded && (
        <Center h="90vh">
          <Flex direction="column" gap="sm" w={400}>
            <Text size="xl" c="dimmed" fw="bold">
              You already finished the onboarding process...
            </Text>
            <Button onClick={() => router.push("/")}>
              Go back to the homepage
            </Button>
          </Flex>
        </Center>
      )}

      {!isOnboarded && <Onboarding />}
    </>
  );
};

export default OnboardingPage;
