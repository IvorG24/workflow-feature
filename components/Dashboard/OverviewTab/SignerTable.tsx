import { startCase } from "@/utils/string";
import { getAvatarColor, getStatusToColor } from "@/utils/styling";
import {
  Avatar,
  Badge,
  Center,
  Group,
  Paper,
  Progress,
  ScrollArea,
  Stack,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import { IconShieldCheckFilled } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { RequestorAndSignerDataType } from "./Overview";

const useStyles = createStyles(() => ({
  withBorderBottom: {
    borderBottom: "0.0625rem solid #dee2e6",
  },
}));

type SignerTableProps = {
  signerList: RequestorAndSignerDataType[];
  totalRequestCount: number;
  loadMoreSigner: (page: number) => void;
  isSignerFetchable: boolean;
  signerOffset: number;
  setSignerOffset: Dispatch<SetStateAction<number>>;
};

const SignerTable = ({
  signerList,
  totalRequestCount,
  loadMoreSigner,
  isSignerFetchable,
  signerOffset,
  setSignerOffset,
}: SignerTableProps) => {
  const { classes } = useStyles();

  const containerRef = useRef<HTMLDivElement>(null);

  const [isInView, setIsInView] = useState(false);

  const handleScroll = () => {
    if (!isSignerFetchable) return;
    if (containerRef.current && typeof window !== "undefined") {
      const container = containerRef.current;
      const { bottom } = container.getBoundingClientRect();
      const { innerHeight } = window;
      setIsInView(bottom <= innerHeight);
    }
  };

  useEffect(() => {
    if (isInView) {
      loadMoreSigner(signerOffset + 1);
      setSignerOffset((prev) => (prev += 1));
    }
  }, [isInView]);

  return (
    <ScrollArea
      w="100%"
      h="100%"
      onScrollCapture={handleScroll}
      className="onboarding-dashboard-top-signer"
    >
      <Paper w={{ base: "100%" }} mih={420} withBorder>
        <Group p="md" spacing="xs" className={classes.withBorderBottom}>
          <Center c="green">
            <IconShieldCheckFilled />
          </Center>
          <Title order={4}>Top Signer</Title>
        </Group>

        <Stack p="lg" mb="sm" spacing={32} ref={containerRef}>
          {totalRequestCount > 0 ? (
            signerList.map((signer) => {
              const user = signer.team_member_user;
              const progressSections = signer.request
                .map(({ label, value }) => ({
                  value: (value / totalRequestCount) * 100,
                  color: `${getStatusToColor(label) || "dark"}`,
                  tooltip: `${startCase(label)}: ${value}`,
                }))
                .filter((section) => !section.tooltip.includes("Total"));

              return (
                <Stack key={user.user_id} spacing="xs">
                  <Group position="apart">
                    <Group spacing="xs">
                      <Avatar
                        size="sm"
                        radius="xl"
                        src={user.user_avatar ?? null}
                        color={getAvatarColor(
                          Number(`${user.user_id.charCodeAt(0)}`)
                        )}
                      >
                        {!user.user_avatar &&
                          `${user.user_first_name[0]}${user.user_last_name[0]}`}
                      </Avatar>
                      <Text
                        weight={500}
                      >{`${user.user_first_name} ${user.user_last_name}`}</Text>
                    </Group>

                    <Badge size="sm" variant="filled" color="dark">
                      Total: {signer.total.toLocaleString()}
                    </Badge>
                  </Group>
                  <Progress
                    size="md"
                    radius="lg"
                    color="green"
                    sections={progressSections}
                  />
                </Stack>
              );
            })
          ) : (
            <Center h={175}>
              <Text size={20} color="dimmed" weight={600}>
                No data to display
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>
    </ScrollArea>
  );
};

export default SignerTable;
