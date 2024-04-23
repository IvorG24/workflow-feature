import { Database } from "@/utils/database";
import {
  ActionIcon,
  Button,
  ButtonProps,
  Flex,
  FlexProps,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Provider } from "@supabase/supabase-js";
import { AzureIcon } from "./AzureIcon";
import { GoogleIcon } from "./GoogleIcon";

type ButtonListProps = {
  flexprops?: FlexProps;
  buttonprops?: ButtonProps;
  providerLabel: {
    google: string;
    azure: string;
  };
};

const SocialMediaButtonList = (props: ButtonListProps) => {
  const { flexprops, buttonprops, providerLabel } = props;
  const supabaseClient = createPagesBrowserClient<Database>();

  const handleSignin = async (provider: Provider) => {
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: provider,
      });

      if (error) throw error;
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleSignInWithAzure = async () => {
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "azure",
        options: {
          scopes: "email",
        },
      });
      if (error) throw error;
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Flex {...flexprops}>
      {/* <Button
        leftIcon={<FacebookIcon color="#1877F2" />}
        {...buttonprops}
        onClick={() => handleSignin("facebook")}
      >
        Facebook
      </Button> */}
      <Button
        leftIcon={
          <ActionIcon size={16}>
            <GoogleIcon />
          </ActionIcon>
        }
        {...buttonprops}
        onClick={() => handleSignin("google")}
      >
        {providerLabel.google}
      </Button>
      {/* <Button
        leftIcon={<TwitterIcon color="#00acee" />}
        {...buttonprops}
        onClick={() => handleSignin("twitter")}
      >
        Twitter
      </Button> */}
      <Button
        leftIcon={
          <ActionIcon size={16}>
            <AzureIcon />
          </ActionIcon>
        }
        {...buttonprops}
        onClick={() => handleSignInWithAzure()}
      >
        {providerLabel.azure}
      </Button>
    </Flex>
  );
};

export default SocialMediaButtonList;
