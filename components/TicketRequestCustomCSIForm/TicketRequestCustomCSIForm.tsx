import {
  checkCSICodeDescriptionExists,
  checkCSICodeExists,
} from "@/backend/api/get";
import { createTicket, editTicket } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { CreateTicketFormValues } from "@/utils/types";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import TicketFormSection from "../CreateTicketPage/TicketFormSection";

type Props = {
  category: string;
  memberId: string;
  ticketForm: CreateTicketFormValues | null;
  isEdit?: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  onOverrideTicket?: () => void;
  onClose?: () => void;
};

const TicketRequestCustomCSIForm = ({
  category,
  memberId,
  ticketForm,
  isEdit,
  setIsLoading,
  onOverrideTicket,
  onClose,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const { ticketId } = router.query;
  const user = useUserProfile();

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

      const ticket = await createTicket(supabaseClient, {
        category,
        teamMemberId: memberId,
        ticketFormValues: data,
      });

      notifications.show({
        message: "Ticket created.",
        color: "green",
      });

      router.push(
        `/${formatTeamNameToUrlKey(activeTeam.team_name)}/tickets/${
          ticket.ticket_id
        }`
      );
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTicket = async (data: CreateTicketFormValues) => {
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

      if (!category && !ticketId && user) return;

      const edited = await editTicket(supabaseClient, {
        ticketId: `${ticketId}`,
        ticketFormValues: data,
      });
      if (!edited) return;
      if (onOverrideTicket) onOverrideTicket();
      if (onClose) onClose();

      notifications.show({
        message: "Ticket overriden.",
        color: "green",
      });
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
        <form
          onSubmit={handleSubmit(
            isEdit ? handleEditTicket : handleCreateTicket
          )}
        >
          {ticketSections.map((ticketSection, ticketSectionIdx) => (
            <TicketFormSection
              category={category}
              ticketSection={ticketSection}
              ticketSectionIdx={ticketSectionIdx}
              key={ticketSectionIdx}
            />
          ))}
          <Button type="submit" mt="lg" fullWidth>
            {isEdit ? "Save Changes" : "Submit"}
          </Button>
        </form>
      </FormProvider>
    </>
  );
};

export default TicketRequestCustomCSIForm;
