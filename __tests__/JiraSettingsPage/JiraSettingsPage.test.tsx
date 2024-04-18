import JiraSettingsPage from "@/components/JiraSettingsPage/JiraSettingsPage";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createPagesBrowserClient: jest.fn(),
}));

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

const mockJiraFormslyProjectData = {
  data: [
    {
      team_project_id: "989dbcc2-fdfe-48c7-806a-98cf80e1bf42",
      team_project_name: "LAKE MAINIT",
      assigned_jira_project: {
        jira_formsly_project_id: "7be5661f-aa86-4257-bdbe-7c8c4dc9d412",
        jira_project_id: "5bae3b31-7b54-4585-a632-1e4b3695f224",
        formsly_project_id: "989dbcc2-fdfe-48c7-806a-98cf80e1bf42",
        jira_project: {
          jira_project_id: "5bae3b31-7b54-4585-a632-1e4b3695f224",
          jira_project_jira_id: "10200",
          jira_project_jira_label: "MIN-18-036 LAKEMAINIT",
        },
      },
    },
  ],
  count: 1,
};

const mockJiraProjectData = {
  data: [
    {
      jira_project_id: "5bae3b31-7b54-4585-a632-1e4b3695f224",
      jira_project_jira_id: "10200",
      jira_project_jira_label: "MIN-18-036 LAKEMAINIT",
    },
  ],
  count: 1,
};

const mockJiraUserAccountData = {
  data: [
    {
      jira_user_account_id: "bcba28a8-86f5-465a-ac47-f4c94727a6a1",
      jira_user_account_jira_id:
        "qm:1ba2089e-c98a-4c4b-9487-b12072afc5c6:fa6354ae-36a4-44f7-b155-e74c520cb592",
      jira_user_account_email_address: "adrian.ingles.23@gmail.com",
      jira_user_account_display_name: "Adrian Ingles",
      jira_user_account_date_created: "2024-04-17T03:53:55.265826+00:00",
      jira_user_account_date_updated: null,
    },
  ],
  count: 1,
};

const mockJiraItemCategoryData = {
  data: [
    {
      jira_item_category_id: "39a5787a-b1f8-4d05-8df0-47c1c81743fd",
      jira_item_category_jira_id: "10394",
      jira_item_category_jira_label: "Construction Items",
      jira_item_category_formsly_label: "Bidding",
      assigned_jira_user: {
        jira_item_user_id: "d5914ad0-7658-44f3-a448-0eefd0bd2cbf",
        jira_item_user_account_id: {
          jira_user_account_jira_id:
            "712020:5569bf38-2e86-4a70-9f86-24d79f271743",
          jira_user_account_display_name: "Meynard F. Gante",
          jira_user_account_id: "da4b9b0e-94f1-4a42-b6c0-68642daafe3f",
        },
        jira_item_user_role_id: {
          jira_user_role_id: "9fc8cdad-5302-4f45-b84a-31b886abc87a",
          jira_user_role_label: "WAREHOUSE CORPORATE LEAD",
        },
        jira_user_account_jira_id:
          "712020:5569bf38-2e86-4a70-9f86-24d79f271743",
        jira_user_account_display_name: "Meynard F. Gante",
        jira_user_account_id: "da4b9b0e-94f1-4a42-b6c0-68642daafe3f",
        jira_user_role_id: "9fc8cdad-5302-4f45-b84a-31b886abc87a",
        jira_user_role_label: "WAREHOUSE CORPORATE LEAD",
      },
    },
  ],
  count: 1,
};

const setup = () =>
  render(
    <JiraSettingsPage
      jiraFormslyProjectData={mockJiraFormslyProjectData}
      jiraProjectData={mockJiraProjectData}
      jiraUserAccountData={mockJiraUserAccountData}
      jiraItemCategoryData={mockJiraItemCategoryData}
    />
  );

describe("BuildFormPage", () => {
  it("renders project and item category", async () => {
    setup();
    const mockProject = mockJiraFormslyProjectData.data[0];
    const mockItemCategory = mockJiraItemCategoryData.data[0];
    const formslyProjectTitle = await screen.findByText(
      mockProject.team_project_name
    );
    const jiraProjectTitle = await screen.findByText(
      mockProject.assigned_jira_project.jira_project.jira_project_jira_label
    );
    const formslyItemCategoryTitle = await screen.findByText(
      mockItemCategory.jira_item_category_formsly_label
    );
    const jiraItemCategoryTitle = await screen.findByText(
      mockItemCategory.jira_item_category_jira_label
    );
    const corporateLeadName = await screen.findByText(
      mockItemCategory.assigned_jira_user.jira_user_account_display_name
    );

    expect(formslyProjectTitle).toBeInTheDocument();
    expect(jiraProjectTitle).toBeInTheDocument();
    expect(formslyItemCategoryTitle).toBeInTheDocument();
    expect(jiraItemCategoryTitle).toBeInTheDocument();
    expect(corporateLeadName).toBeInTheDocument();
  });

  it("renders project action menu", async () => {
    setup();
    const actionMenu = screen.getByRole("button", { name: "project-menu" });
    expect(actionMenu).toBeInTheDocument();

    fireEvent.click(actionMenu);

    expect(
      await screen.findByText("Reassign to Jira Project")
    ).toBeInTheDocument();
    expect(await screen.findByText("Manage Project Users")).toBeInTheDocument();
  });

  it("renders create item category form", async () => {
    setup();
    const createItemButton = screen.getByRole("button", {
      name: "Add Item Category",
    });
    fireEvent.click(createItemButton);

    expect(
      await screen.findByRole("textbox", { name: "Formsly Label" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", { name: "Jira ID" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", { name: "Jira Label" })
    ).toBeInTheDocument();
  });
});
