import UserSettingsPage from "@/components/UserSettingsPage/UserSettingsPage";
import { mobileNumberFormatter } from "@/utils/styling";
import { UserWithSignatureType } from "@/utils/types";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createPagesBrowserClient: jest.fn(),
}));

const mockUserProps = {
  user_id: "e82ba7c6-80b2-4604-9bb1-87eb145cad76",
  user_date_created: "2024-03-12T04:10:40.122047+00:00",
  user_username: "janedoe",
  user_first_name: "Jane",
  user_last_name: "Doe",
  user_email: "janedoe@gmail.com",
  user_job_title: "Sales Management",
  user_phone_number: "9563268975",
  user_is_disabled: false,
  user_active_team_id: "a5a28977-6956-45c1-a624-b9e90911502e",
  user_active_app: "REQUEST",
  user_avatar: null,
  user_signature_attachment_id: null,
  user_employee_number: null,
  user_signature_attachment: null,
};

const setup = () =>
  render(
    <UserSettingsPage
      user={mockUserProps as unknown as UserWithSignatureType}
    />
  );

describe("USerSettingsPage", () => {
  it("renders correct user info", async () => {
    setup();
    const email = screen.getByRole("textbox", { name: "Email" });
    const employeeNumber = screen.getByRole("textbox", {
      name: "Employee Number",
    });
    const firstName = screen.getByRole("textbox", {
      name: "First Name",
    });
    const lastName = screen.getByRole("textbox", {
      name: "Last Name",
    });
    const mobileNumber = screen.getByRole("textbox", {
      name: "Mobile Number",
    });
    const jobTitle = screen.getByRole("textbox", {
      name: "Job Title",
    });

    expect(email).toHaveValue(mockUserProps.user_email);
    expect(employeeNumber).toHaveValue("---");
    expect(firstName).toHaveValue(mockUserProps.user_first_name);
    expect(lastName).toHaveValue(mockUserProps.user_last_name);
    expect(mobileNumber).toHaveValue(
      mobileNumberFormatter(mockUserProps.user_phone_number)
    );
    expect(jobTitle).toHaveValue(mockUserProps.user_job_title);
  });

  it("renders disabled update password button", async () => {
    setup();
    const updatePasswordButton = screen.getByRole("button", {
      name: "Update Password",
    });
    expect(updatePasswordButton).toBeDisabled();
  });

  it("renders error on empty input", async () => {
    setup();
    const firstName = screen.getByRole("textbox", {
      name: "First Name",
    });
    const saveChangesButton = screen.getByRole("button", {
      name: "Save Changes",
    });
    fireEvent.change(firstName, { target: { value: "" } });
    fireEvent.click(saveChangesButton);
    expect(
      await screen.findByText(/first name is required/i)
    ).toBeInTheDocument();
  });
});
