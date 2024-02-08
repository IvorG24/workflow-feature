import {
  checkCSICodeDescriptionExists,
  checkCSICodeExists,
} from "@/backend/api/get";
import { Database } from "@/utils/database";
import { CreateTicketFormValues } from "@/utils/types";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
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
  const supabaseClient = createPagesBrowserClient<Database>();
  //   const router = useRouter();
  //   const activeTeam = useActiveTeam();

  const createTicketFormMethods = useForm<CreateTicketFormValues>();
  const { handleSubmit, control, setError } = createTicketFormMethods;

  const { fields: ticketSections, replace: replaceSection } = useFieldArray({
    control,
    name: "ticket_sections",
  });

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    try {
      setIsLoading(true);

      // check if csi exists
      const csiCodeDescription =
        data.ticket_sections[0].ticket_section_fields[1].ticket_field_response;
      const csiCode =
        data.ticket_sections[0].ticket_section_fields[2].ticket_field_response;

      const csiExists = await checkIfCSIExists(
        `${csiCode}`,
        `${csiCodeDescription}`
      );

      if (csiExists) return;
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

  const checkIfCSIExists = async (
    csiCode: string,
    csiCodeDescription: string
  ) => {
    const csiCodeDescriptionExists = await checkCSICodeDescriptionExists(
      supabaseClient,
      {
        csiCodeDescription: `${csiCodeDescription}`,
      }
    );
    if (csiCodeDescriptionExists)
      setError(
        `ticket_sections.0.ticket_section_fields.1.ticket_field_response`,
        { message: "CSI Code Description already exists" }
      );

    const csiCodeExists = await checkCSICodeExists(supabaseClient, {
      csiCode: `${csiCode}`,
    });
    if (csiCodeExists)
      setError(
        `ticket_sections.0.ticket_section_fields.2.ticket_field_response`,
        { message: "CSI Code already exists" }
      );

    return csiCodeExists || csiCodeDescriptionExists;
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
                category={category}
                ticketSection={ticketSection}
                ticketSectionIdx={ticketSectionIdx}
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
