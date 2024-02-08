import { CreateTicketFormValues } from "@/utils/types";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Dispatch, SetStateAction, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import TicketFormSection from "../CreateTicketPage/TicketFormSection";

type Props = {
  category: string;
  ticketForm: CreateTicketFormValues | null;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

const TicketRequestCustomCSIForm = ({
  category,
  ticketForm,
  setIsLoading,
}: Props) => {
  // const supabaseClient = createPagesBrowserClient<Database>();
  //   const router = useRouter();
  //   const activeTeam = useActiveTeam();

  const createTicketFormMethods = useForm<CreateTicketFormValues>();
  const { handleSubmit, control } = createTicketFormMethods;

  const { fields: ticketSections, replace: replaceSection } = useFieldArray({
    control,
    name: "ticket_sections",
  });

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    try {
      setIsLoading(true);
      console.log(category);
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

  const handleCSICodeDescriptionChange = async (value: string) => {
    console.log(value);
  };

  useEffect(() => {
    if (ticketForm) {
      replaceSection(ticketForm.ticket_sections);
    }
  }, []);

  return (
    <>
      <FormProvider {...createTicketFormMethods}>
        <form onSubmit={handleSubmit(handleCreateTicket)}>
          {ticketSections.map((ticketSection, ticketSectionIdx) => (
            <>
              <TicketFormSection
                ticketSection={ticketSection}
                ticketSectionIdx={ticketSectionIdx}
                requestCustomCSIMethodsFormMethods={{
                  onCSICodeDescriptionChange: handleCSICodeDescriptionChange,
                }}
              />
            </>
          ))}
          <Button type="submit" mt="lg" fullWidth>
            Submit
          </Button>
        </form>
      </FormProvider>
    </>
  );
};

export default TicketRequestCustomCSIForm;
