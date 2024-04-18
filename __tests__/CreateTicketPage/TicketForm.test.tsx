import TicketForm from "@/components/CreateTicketPage/TicketForm";
import { CreateTicketFormValues } from "@/utils/types";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dispatch, SetStateAction } from "react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    query: {
      ticketId: "mockId",
    },
  })),
}));

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createPagesBrowserClient: jest.fn(),
}));

const setup = ({
  category,
  memberId,
  ticketForm,
  setIsLoading,
}: {
  category: string | null;
  memberId: string;
  ticketForm: CreateTicketFormValues | null;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  render(
    <TicketForm
      category={category}
      memberId={memberId}
      ticketForm={ticketForm}
      setIsLoading={setIsLoading}
    />
  );
};

const mockGeneralCategoryTicketForm = {
  ticket_sections: [
    {
      ticket_section_id: "0db787b2-092f-4499-ab82-2c42a459c8f0",
      ticket_section_name: "Request Details",
      ticket_section_is_duplicatable: false,
      ticket_section_category_id: "1e9aef8b-cf84-4443-9e07-d9ad2461a301",
      ticket_section_fields: [
        {
          ticket_field_id: "849c0073-ec1e-4557-beed-6e930cd69c78",
          ticket_field_name: "Title",
          ticket_field_type: "TEXT",
          ticket_field_is_required: true,
          ticket_field_is_read_only: false,
          ticket_field_order: 1,
          ticket_field_section_id: "0db787b2-092f-4499-ab82-2c42a459c8f0",
          ticket_field_option: [],
          ticket_field_response: "",
        },
        {
          ticket_field_id: "8b034462-a8d3-4649-8832-d248d94024c1",
          ticket_field_name: "Description",
          ticket_field_type: "TEXTAREA",
          ticket_field_is_required: true,
          ticket_field_is_read_only: false,
          ticket_field_order: 2,
          ticket_field_section_id: "0db787b2-092f-4499-ab82-2c42a459c8f0",
          ticket_field_option: [],
          ticket_field_response: "",
        },
      ],
    },
  ],
};

describe("TicketForm", () => {
  it("renders form fields in general category", async () => {
    setup({
      setIsLoading: jest.fn(),
      category: "General",
      memberId: "mockMemberId",
      ticketForm: mockGeneralCategoryTicketForm,
    });
    const titleInput = screen.getByRole("textbox", { name: "Title" });
    const descriptionInput = screen.getByRole("textbox", {
      name: "Description",
    });
    expect(titleInput).toBeInTheDocument();
    expect(descriptionInput).toBeInTheDocument();
  });
  it("renders error messages", async () => {
    setup({
      setIsLoading: jest.fn(),
      category: "General",
      memberId: "mockMemberId",
      ticketForm: mockGeneralCategoryTicketForm,
    });
    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(
      await screen.findByText("Description is required")
    ).toBeInTheDocument();
  });
});
