import { getTicketFields } from "@/backend/api/get";
import { Database } from "@/utils/database";
import { Button, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import TicketFieldList, {
  CreateTicketFormValues,
} from "../CreateTicketPage/TicketFieldList";

type Props = {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

const TicketRequestCustomCSIForm = ({ setIsLoading }: Props) => {
  const ticketType = "Request Custom CSI";
  const supabaseClient = createPagesBrowserClient<Database>();
  //   const router = useRouter();
  //   const activeTeam = useActiveTeam();

  const createTicketFormMethods = useForm<CreateTicketFormValues>();
  const { handleSubmit, control } = createTicketFormMethods;

  const { fields: ticketFields, replace: replaceField } = useFieldArray({
    control,
    name: "fields",
  });

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    try {
      setIsLoading(true);
      console.log(data);

      notifications.show({
        message: "Ticket created.",
        color: "green",
      });
      //   router.push(
      //     `/${formatTeamNameToUrlKey(activeTeam.team_name)}/tickets/${
      //       ticket.ticket_id
      //     }`
      //   );
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async (ticketType: string | null) => {
    try {
      if (!ticketType) {
        replaceField([]);
        return;
      }
      const fieldList = await getTicketFields(supabaseClient, {
        ticketType,
      });

      const fieldWithResponse = fieldList.map((field) => {
        return {
          ...field,
          options: [],
          response: "",
        };
      });

      replaceField(fieldWithResponse);
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleItemNameChange = (index: number, value: string | null) => {
    console.log(value);
  };

  useEffect(() => {
    handleCategoryChange(ticketType);
  }, []);

  return (
    <>
      <FormProvider {...createTicketFormMethods}>
        <form onSubmit={handleSubmit(handleCreateTicket)}>
          <Stack>
            {ticketFields.length > 0 && (
              <>
                <TicketFieldList
                  ticketFields={ticketFields}
                  requestCustomCSIMethodsFormMethods={{
                    onItemNameChange: handleItemNameChange,
                  }}
                />

                <Button type="submit" size="md">
                  Submit
                </Button>
              </>
            )}
          </Stack>
        </form>
      </FormProvider>
    </>
  );
};

export default TicketRequestCustomCSIForm;
