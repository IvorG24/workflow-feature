import CreateTicketPage from "@/components/CreateTicketPage/CreateTicketPage";
import { formatDate } from "@/utils/constant";
import { CreateTicketPageOnLoad } from "@/utils/types";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

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

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const mockMember = {
  team_member_id: "eb4d3419-b70f-44ba-b88f-c3d983cbcf3b",
  team_member_role: "OWNER",
  team_member_user: {
    user_id: "ae48cd52-d199-4e38-8bb1-42f6993ed929",
    user_first_name: "John",
    user_last_name: "Doe",
    user_avatar: null,
    user_email: "johndoe@gmail.com",
  },
};

const mockCategoryList = [
  {
    ticket_category_id: "1e9aef8b-cf84-4443-9e07-d9ad2461a301",
    ticket_category: "General",
    ticket_category_is_disabled: false,
    ticket_category_is_active: true,
  },
  {
    ticket_category_id: "a2cfde15-1b4a-41b2-8415-08221148ca2d",
    ticket_category: "Feature Request",
    ticket_category_is_disabled: false,
    ticket_category_is_active: true,
  },
  {
    ticket_category_id: "f57ced26-0b93-472f-8268-c41fbd7e010b",
    ticket_category: "Item Request",
    ticket_category_is_disabled: false,
    ticket_category_is_active: true,
  },
  {
    ticket_category_id: "f9d44ea0-4cdb-427f-8224-bc16fd92f1be",
    ticket_category: "Request Custom CSI",
    ticket_category_is_disabled: false,
    ticket_category_is_active: true,
  },
  {
    ticket_category_id: "ea67c627-6975-4e01-9c2d-445ae61fa144",
    ticket_category: "Request Item CSI",
    ticket_category_is_disabled: false,
    ticket_category_is_active: true,
  },
  {
    ticket_category_id: "f1759af2-2a07-460d-9a72-86faf8eccd85",
    ticket_category: "Request Item Option",
    ticket_category_is_disabled: false,
    ticket_category_is_active: true,
  },
  {
    ticket_category_id: "2df7ca37-444f-4e71-9c84-ad0d6f3e77b5",
    ticket_category: "Incident Report for Employees",
    ticket_category_is_disabled: false,
    ticket_category_is_active: true,
  },
  {
    ticket_category_id: "c9f373c8-09d6-46f0-92cb-5efeffd72758",
    ticket_category: "Bug Report",
    ticket_category_is_disabled: false,
    ticket_category_is_active: true,
  },
  {
    ticket_category_id: "3858113d-8a26-4d36-8c9a-a0e80ac657cc",
    ticket_category: "Request PED Equipment Part",
    ticket_category_is_disabled: false,
    ticket_category_is_active: true,
  },
];

const {
  team_member_user: { user_first_name, user_last_name },
} = mockMember;

describe("CreateTicketPage", () => {
  it("renders page", async () => {
    render(
      <CreateTicketPage
        member={mockMember as CreateTicketPageOnLoad["member"]}
        categorylist={mockCategoryList}
      />
    );
    const categoryListInput = screen.getByPlaceholderText(
      "Select a ticket category"
    );
    const memberName = screen.getByText(`${user_first_name} ${user_last_name}`);
    const currentDate = screen.getByText(formatDate(new Date()));
    expect(categoryListInput).toBeInTheDocument();
    expect(memberName).toBeInTheDocument();
    expect(currentDate).toBeInTheDocument();
  });
  it("renders ticket category", async () => {
    render(
      <CreateTicketPage
        member={mockMember as CreateTicketPageOnLoad["member"]}
        categorylist={mockCategoryList}
      />
    );
    const categoryListInput = screen.getByPlaceholderText(
      "Select a ticket category"
    );
    fireEvent.change(categoryListInput, { target: { value: "General" } });
    expect(await screen.findByDisplayValue("General")).toBeInTheDocument();
  });
});
