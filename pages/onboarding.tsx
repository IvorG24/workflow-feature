import { Button, Center, Flex, Stack, Text } from "@mantine/core";

import { getUserProfileNullable, getUserTeamList } from "@/utils/queries";
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

  const user = session?.user;

  const [userProfile, userTeamList] = await Promise.all([
    getUserProfileNullable(supabaseClient, user.id),
    getUserTeamList(supabaseClient, user.id),
  ]);

  const isOnboarded = userProfile && userTeamList.length > 0;

  return {
    props: {
      user,
      userProfile,
      userTeamList,
      isOnboarded,
    },
  };
};

const OnboardingPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user, userProfile, userTeamList, isOnboarded }) => {
  const router = useRouter();

  return (
    <>
      {/* {isOnboarded && (
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

      {!isOnboarded && (
        <Center h="90vh">
          <Stack spacing="sm" w={400}>
            <Text size="xl" c="dimmed" fw="bold">
              You are onboarding...
            </Text>
            <Button onClick={() => router.push("/")}>
              Proceed to the homepage
            </Button>
          </Stack>
        </Center>
      )} */}

      <Center h="90vh">
        <Stack spacing="sm" w={400}>
          <Text size="xl" c="dimmed" fw="bold">
            You are onboarding...
          </Text>
          <Button onClick={() => router.push("/")}>
            Proceed to the homepage
          </Button>
        </Stack>
      </Center>
    </>
  );
};

export default OnboardingPage;
