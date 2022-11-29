import { Button, MultiSelect, Stack, Text, Title } from "@mantine/core";
import { FormEvent, useState } from "react";
import { Member } from "./Member";

type Props = {
  members: Member[];
};

const InviteTeamMembersSection = ({ members }: Props) => {
  const [emails, setEmails] = useState<{ value: string; label: string }[]>([]);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emails.length === 0) {
      // setError("No email provided.");
      return;
    }

    //  don't invite if email is already in workspace
    const memberEmails = members.map((m) => m.email);
    const isAlreadyAMember = emails.some((email) =>
      memberEmails.includes(email.value)
    );

    if (isAlreadyAMember) {
      // setError("Cannot invite existing members.");
      return;
    }
  };

  return (
    <Stack pt="sm" style={{ maxWidth: "800px" }}>
      <div>
        <Title order={3}>Invite Team Members</Title>
        <Text>
          Admins can edit your profile, invite team members and manage all jobs.
          Recruiters can only manage their own jobs
        </Text>
      </div>

      <form
        data-testid="team__sendInvitesForm"
        autoComplete="off"
        onSubmit={handleFormSubmit}
      >
       // todo: validate inputs to only accept emails
        <MultiSelect
          data={emails}
          placeholder="Add users"
          size="md"
          mb="sm"
          searchable
          creatable
          getCreateLabel={(query) => `+ Create ${query}`}
          onCreate={(query) => {
            const item = { value: query, label: query };
            setEmails((current) => [...current, item]);
            return item;
          }}
        />
        <Button fullWidth>Send Invites</Button>
      </form>
    </Stack>
  );
};

export default InviteTeamMembersSection;
