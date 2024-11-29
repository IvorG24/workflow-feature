import { getAllOptionsPerBatch, pedPartCheck } from "@/backend/api/get";
import { createTicket, editTicket } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile } from "@/stores/useUserStore";
import { FETCH_OPTION_LIMIT } from "@/utils/constant";
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
  onOverrideResponseComment?: (
    formValues: CreateTicketFormValues
  ) => Promise<void>;
};

const TicketRequestPEDEquipmentPartForm = ({
  category,
  memberId,
  ticketForm,
  isEdit,
  setIsLoading,
  onOverrideTicket,
  onClose,
  onOverrideResponseComment,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const { ticketId } = router.query;
  const user = useUserProfile();

  const createTicketFormMethods = useForm<CreateTicketFormValues>();
  const { handleSubmit, control } = createTicketFormMethods;

  const { fields: ticketSections, replace: replaceSection } = useFieldArray({
    control,
    name: "ticket_sections",
  });

  const handleCreateTicket = async (data: CreateTicketFormValues) => {
    try {
      if (!user) return;
      setIsLoading(true);
      const pedPartExists = await pedPartCheck(supabaseClient, {
        equipmentName: data.ticket_sections[0].ticket_section_fields[0]
          .ticket_field_response as string,
        partName:
          `${data.ticket_sections[0].ticket_section_fields[1].ticket_field_response}`
            .trim()
            .toUpperCase(),
        partNumber:
          `${data.ticket_sections[0].ticket_section_fields[2].ticket_field_response}`
            .trim()
            .toUpperCase()
            .replace(/[^a-zA-Z0-9]/g, ""),
        brand:
          `${data.ticket_sections[0].ticket_section_fields[3].ticket_field_response}`
            .trim()
            .toUpperCase(),
        model:
          `${data.ticket_sections[0].ticket_section_fields[4].ticket_field_response}`
            .trim()
            .toUpperCase(),
        unitOfMeasure:
          `${data.ticket_sections[0].ticket_section_fields[5].ticket_field_response}`.trim(),
        category:
          `${data.ticket_sections[0].ticket_section_fields[6].ticket_field_response}`
            .trim()
            .toUpperCase(),
      });

      if (pedPartExists) {
        notifications.show({
          message: "PED Part already exists.",
          color: "orange",
        });
        return;
      }

      const ticket = await createTicket(supabaseClient, {
        category,
        teamMemberId: memberId,
        ticketFormValues: data,
        userId: user.user_id,
      });

      notifications.show({
        message: "Ticket created.",
        color: "green",
      });

      await router.push(
        `/${formatTeamNameToUrlKey(activeTeam.team_name)}/tickets/${
          ticket.ticket_id
        }`
      );
    } catch (e) {
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

      const pedPartExists = await pedPartCheck(supabaseClient, {
        equipmentName: data.ticket_sections[0].ticket_section_fields[0]
          .ticket_field_response as string,
        partName:
          `${data.ticket_sections[0].ticket_section_fields[1].ticket_field_response}`
            .trim()
            .toUpperCase(),
        partNumber:
          `${data.ticket_sections[0].ticket_section_fields[2].ticket_field_response}`
            .trim()
            .toUpperCase()
            .replace(/[^a-zA-Z0-9]/g, ""),
        brand:
          `${data.ticket_sections[0].ticket_section_fields[3].ticket_field_response}`
            .trim()
            .toUpperCase(),
        model:
          `${data.ticket_sections[0].ticket_section_fields[4].ticket_field_response}`
            .trim()
            .toUpperCase(),
        unitOfMeasure:
          `${data.ticket_sections[0].ticket_section_fields[5].ticket_field_response}`.trim(),
        category:
          `${data.ticket_sections[0].ticket_section_fields[6].ticket_field_response}`
            .trim()
            .toUpperCase(),
      });

      if (pedPartExists) {
        notifications.show({
          message: "PED Part already exists.",
          color: "orange",
        });
        return;
      }

      if (!category && !ticketId && user) return;
      if (!user) return;

      const edited = await editTicket(supabaseClient, {
        ticketId: `${ticketId}`,
        ticketFormValues: data,
        userId: user.user_id,
      });
      if (!edited) return;
      if (onOverrideResponseComment) await onOverrideResponseComment(data);
      if (onOverrideTicket) onOverrideTicket();
      if (onClose) onClose();

      notifications.show({
        message: "Ticket overriden.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptions = async (ticketForm: CreateTicketFormValues) => {
    try {
      setIsLoading(true);
      let index = 0;
      const equipmentNameOptions: string[] = [];
      while (1) {
        const data = (await getAllOptionsPerBatch(supabaseClient, {
          schema: "equipment",
          table: "equipment",
          select: "equipment_name",
          teamId: activeTeam.team_id,
          index,
          limit: FETCH_OPTION_LIMIT,
          order: "equipment_name",
        })) as unknown as { equipment_name: string }[];

        const options = data.map((value) => value.equipment_name);
        equipmentNameOptions.push(...options);
        if (data.length < FETCH_OPTION_LIMIT) break;
        index += FETCH_OPTION_LIMIT;
      }
      index = 0;
      const equipmentGeneralNameOptions: string[] = [];
      while (1) {
        const data = (await getAllOptionsPerBatch(supabaseClient, {
          schema: "equipment",
          table: "equipment_general_name",
          select: "equipment_general_name",
          teamId: activeTeam.team_id,
          index,
          limit: FETCH_OPTION_LIMIT,
          order: "equipment_general_name",
        })) as unknown as { equipment_general_name: string }[];

        const options = data.map((value) => value.equipment_general_name);
        equipmentGeneralNameOptions.push(...options);
        if (data.length < FETCH_OPTION_LIMIT) break;
        index += FETCH_OPTION_LIMIT;
      }
      index = 0;
      const brandOptions: string[] = [];
      while (1) {
        const data = (await getAllOptionsPerBatch(supabaseClient, {
          schema: "equipment",
          table: "equipment_brand",
          select: "equipment_brand",
          teamId: activeTeam.team_id,
          index,
          limit: FETCH_OPTION_LIMIT,
          order: "equipment_brand",
        })) as unknown as { equipment_brand: string }[];

        const options = data.map((value) => value.equipment_brand);
        brandOptions.push(...options);
        if (data.length < FETCH_OPTION_LIMIT) break;
        index += FETCH_OPTION_LIMIT;
      }
      index = 0;
      const modelOptions: string[] = [];
      while (1) {
        const data = (await getAllOptionsPerBatch(supabaseClient, {
          schema: "equipment",
          table: "equipment_model",
          select: "equipment_model",
          teamId: activeTeam.team_id,
          index,
          limit: FETCH_OPTION_LIMIT,
          order: "equipment_model",
        })) as unknown as { equipment_model: string }[];

        const options = data.map((value) => value.equipment_model);
        modelOptions.push(...options);
        if (data.length < FETCH_OPTION_LIMIT) break;
        index += FETCH_OPTION_LIMIT;
      }
      index = 0;
      const unitOfMeasurementOptions: string[] = [];
      while (1) {
        const data = (await getAllOptionsPerBatch(supabaseClient, {
          schema: "unit_of_measurement",
          table: "equipment_unit_of_measurement",
          select: "equipment_unit_of_measurement",
          teamId: activeTeam.team_id,
          index,
          limit: FETCH_OPTION_LIMIT,
          order: "equipment_unit_of_measurement",
        })) as unknown as { equipment_unit_of_measurement: string }[];

        const options = data.map(
          (value) => value.equipment_unit_of_measurement
        );
        unitOfMeasurementOptions.push(...options);
        if (data.length < FETCH_OPTION_LIMIT) break;
        index += FETCH_OPTION_LIMIT;
      }
      index = 0;
      const equipmentComponentCategoryOptions: string[] = [];
      while (1) {
        const data = (await getAllOptionsPerBatch(supabaseClient, {
          schema: "equipment",
          table: "equipment_component_category",
          select: "equipment_component_category",
          teamId: activeTeam.team_id,
          index,
          limit: FETCH_OPTION_LIMIT,
          order: "equipment_component_category",
        })) as unknown as { equipment_component_category: string }[];

        const options = data.map((value) => value.equipment_component_category);
        equipmentComponentCategoryOptions.push(...options);
        if (data.length < FETCH_OPTION_LIMIT) break;
        index += FETCH_OPTION_LIMIT;
      }

      replaceSection([
        {
          ...ticketForm.ticket_sections[0],
          ticket_section_fields: [
            {
              ...ticketForm.ticket_sections[0].ticket_section_fields[0],
              ticket_field_option: equipmentNameOptions,
            },
            {
              ...ticketForm.ticket_sections[0].ticket_section_fields[1],
              ticket_field_option: equipmentGeneralNameOptions,
            },
            ticketForm.ticket_sections[0].ticket_section_fields[2],
            {
              ...ticketForm.ticket_sections[0].ticket_section_fields[3],
              ticket_field_option: brandOptions,
            },
            {
              ...ticketForm.ticket_sections[0].ticket_section_fields[4],
              ticket_field_option: modelOptions,
            },
            {
              ...ticketForm.ticket_sections[0].ticket_section_fields[5],
              ticket_field_option: unitOfMeasurementOptions,
            },
            {
              ...ticketForm.ticket_sections[0].ticket_section_fields[6],
              ticket_field_option: equipmentComponentCategoryOptions,
            },
            ...ticketForm.ticket_sections[0].ticket_section_fields.slice(7),
          ],
        },
        ...ticketForm.ticket_sections.slice(1),
      ]);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticketForm) {
      fetchOptions(ticketForm);
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
              key={ticketSection.id}
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

export default TicketRequestPEDEquipmentPartForm;
