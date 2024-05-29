import { getCurrentDateString } from "@/backend/api/get";
import useRealtimeTeamExpiration from "@/hooks/useRealtimeTeamExpiration";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { formatDate } from "@/utils/constant";
import { formatTeamNameToUrlKey, pesoFormatter } from "@/utils/string";
import {
  Alert,
  Button,
  Flex,
  Group,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconCalendarDollar, IconReportMoney } from "@tabler/icons-react";
import moment from "moment";

import { useRouter } from "next/router";
import { Database } from "oneoffice-api";
import { Controller, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

type Props = {
  outstandingBalance: number;
  expirationDate: string;
  currentDate: string;
  price: number;
};

const Payment = ({
  outstandingBalance: initialOustandingBalance,
  expirationDate: initialExpirationDate,
  currentDate,
  price,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const { setIsLoading } = useLoadingActions();
  const activeTeam = useActiveTeam();
  const router = useRouter();

  const [opened, { open, close }] = useDisclosure(false);

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/${formatTeamNameToUrlKey(
    activeTeam.team_name ?? ""
  )}/invoice?`;

  const { outstandingBalance, expirationDate } = useRealtimeTeamExpiration(
    supabaseClient,
    {
      teamId: activeTeam.team_id,
      initialOutstandingBalance: initialOustandingBalance,
      initialExpirationDate: initialExpirationDate,
      currentDate: currentDate,
      price: price,
    }
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<{ months: number }>({ defaultValues: { months: 1 } });

  const monthsWatch = watch("months") ?? 1;

  const getNewExpirationDate = (startDate: string, numberOfMonths = 1) => {
    return moment(startDate)
      .add(numberOfMonths, "month")
      .startOf("month")
      .format("MM-DD-YYYY");
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      if (
        !process.env.NEXT_PUBLIC_ONEOFFICE_APP_SOURCE_ID ||
        !process.env.NEXT_PUBLIC_ONEOFFICE_SITE_URL
      )
        throw new Error("Env variables are undefined");

      const referenceNumber = uuidv4();
      const transactionId = uuidv4();
      const currentDate = await getCurrentDateString(supabaseClient);
      const newExpiryDate = getNewExpirationDate(currentDate);
      const quantity = Math.floor(outstandingBalance / price);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: outstandingBalance,
          url,
          referenceNumber,
          teamId: activeTeam.team_id,
          transactionId,
          newExpiryDate,
          userId: activeTeam.team_user_id,
          appSourceId: process.env.NEXT_PUBLIC_ONEOFFICE_APP_SOURCE_ID,
          quantity,
        }),
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ONEOFFICE_SITE_URL}/api/maya/formsly-create-maya-checkout-transaction`,
        requestOptions
      );
      const { url: mayaUrl } = await response.json();
      await router.push(mayaUrl);
    } catch (e) {
      notifications.show({
        title: "Error!",
        message: "Failed to pay formsly subscription",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancePayment = async ({ months }: { months: number }) => {
    try {
      setIsLoading(true);

      if (
        !process.env.NEXT_PUBLIC_ONEOFFICE_APP_SOURCE_ID ||
        !process.env.NEXT_PUBLIC_ONEOFFICE_SITE_URL
      )
        throw new Error("Env variables are undefined");

      const referenceNumber = uuidv4();
      const transactionId = uuidv4();
      const newExpiryDate = getNewExpirationDate(expirationDate, months);
      const totalAmount = months * price;

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount,
          url,
          referenceNumber,
          teamId: activeTeam.team_id,
          transactionId,
          newExpiryDate,
          userId: activeTeam.team_user_id,
          appSourceId: process.env.NEXT_PUBLIC_ONEOFFICE_APP_SOURCE_ID,
          quantity: months,
        }),
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ONEOFFICE_SITE_URL}/api/maya/formsly-create-maya-checkout-transaction`,
        requestOptions
      );
      const { url: mayaUrl } = await response.json();
      await router.push(mayaUrl);
    } catch (e) {
      notifications.show({
        title: "Error!",
        message: "Failed to advance pay for formsly subscription",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper shadow="md" p="md" mt="md">
      <Modal opened={opened} onClose={close} title="Advance Payment" centered>
        <form onSubmit={handleSubmit(handleAdvancePayment)}>
          <Controller
            control={control}
            name="months"
            render={({ field: { onChange } }) => (
              <NumberInput
                label="No. of Month/s"
                withAsterisk
                maxLength={10}
                min={1}
                max={1000}
                onChange={onChange}
                miw={200}
                defaultValue={1}
              />
            )}
          />
          <Group mt="xs">
            <Text>Total Price: </Text>
            <Title order={6}>
              {pesoFormatter(`${monthsWatch * price}`)}.00
            </Title>
          </Group>
          <Group>
            <Text>New Expiry Date: </Text>
            <Title order={6}>
              {moment(expirationDate)
                .add(monthsWatch, "months")
                .startOf("month")
                .format("MM-DD-YYYY")}
            </Title>
          </Group>

          <Button
            color="green"
            w="100%"
            mt="lg"
            type="submit"
            loading={isSubmitting}
          >
            Submit
          </Button>
        </form>
      </Modal>

      <Title order={3}>Payment</Title>
      <Stack>
        <Alert
          w="100%"
          title="Outstanding Balance"
          mt="xl"
          icon={<IconReportMoney />}
          color={outstandingBalance === 0 ? "blue" : "red"}
        >
          <Title order={4}>
            {pesoFormatter(outstandingBalance.toString())}.00
          </Title>
        </Alert>
        {outstandingBalance === 0 ? (
          <Alert
            w="100%"
            title="Next Payment Date"
            icon={<IconCalendarDollar />}
            color="gray"
          >
            <Title order={5}>
              {formatDate(new Date(expirationDate ?? ""))}
            </Title>
          </Alert>
        ) : null}

        <Flex justify="flex-end" gap="xs">
          <Button
            variant="light"
            disabled={outstandingBalance !== 0}
            onClick={open}
          >
            Advance Payment
          </Button>
          <Button onClick={handleCheckout} disabled={outstandingBalance === 0}>
            Pay
          </Button>
        </Flex>
      </Stack>
    </Paper>
  );
};

export default Payment;
