import { Button, MultiSelect, Text, Title } from "@mantine/core";
import { FormEvent, useState } from "react";
import styles from "./InviteTeamMembersSection.module.scss";
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
    <section className={styles.container}>
      <div className={styles.details}>
        <Title order={3}>Invite Team Members</Title>
        <Text>
          Admins can edit your profile, invite team members and manage all jobs.
          Recruiters can only manage their own jobs
        </Text>
      </div>

      <form
        className={styles.invitesList}
        data-testid="team__sendInvitesForm"
        autoComplete="off"
        onSubmit={handleFormSubmit}
      >
        <div className={styles.invitesList__content}>
          <div className={styles.emailInput}>
            <MultiSelect
              data={emails}
              placeholder="Select items"
              searchable
              creatable
              getCreateLabel={(query) => `+ Create ${query}`}
              onCreate={(query) => {
                const item = { value: query, label: query };
                setEmails((current) => [...current, item]);
                return item;
              }}
            />
          </div>
          <Button className={styles.sendInvitesButton}>Send Invites</Button>
        </div>
      </form>
    </section>
  );
};

export default InviteTeamMembersSection;
