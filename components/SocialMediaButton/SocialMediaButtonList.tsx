import { Database } from "@/utils/database";
import { Button, ButtonProps, Flex, FlexProps } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Provider } from "@supabase/supabase-js";
import { AzureIcon } from "./AzureIcon";
import { FacebookIcon } from "./FacebookIcon";
import { GoogleIcon } from "./GoogleIcon";
import { TwitterIcon } from "./TwitterIcon";

type ButtonListProps = {
  flexprops?: FlexProps;
  buttonprops?: ButtonProps;
};

const SocialMediaButtonList = (props: ButtonListProps) => {
  const { flexprops, buttonprops } = props;
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
  return (
    <Flex {...flexprops}>
      <Button
        leftIcon={<FacebookIcon color="#1877F2" />}
        {...buttonprops}
        onClick={() => handleSignin("facebook")}
      >
        Facebook
      </Button>
      <Button
        leftIcon={<GoogleIcon />}
        {...buttonprops}
        onClick={() => handleSignin("google")}
      >
        Google
      </Button>
      <Button
        leftIcon={<TwitterIcon color="#00acee" />}
        {...buttonprops}
        onClick={() => handleSignin("twitter")}
      >
        Twitter
      </Button>
      <Button
        leftIcon={<AzureIcon />}
        {...buttonprops}
        onClick={() => handleSignin("azure")}
      >
        Azure
      </Button>
    </Flex>
  );
};

export default SocialMediaButtonList;
