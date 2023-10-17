import { getTicketOnLoad } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import { TicketCommentType } from "@/components/TicketPage.tsx/TicketCommentSection";
import TicketPage from "@/components/TicketPage.tsx/TicketPage";
import { withAuthAndOnboardingRequestPage } from "@/utils/server-side-protections";
import { TicketType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const TEMP_TICKET_COMMENT_LIST = [
  {
    ticket_comment_id: "6990727c-ec13-4c45-85db-1570a80de2f8",
    ticket_comment_content:
      "orci luctus et ultrices posuere cubilia curae nulla dapibus dolor vel est donec odio justo sollicitudin ut suscipit a feugiat",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "5/11/2023",
    ticket_comment_team_member: {
      team_member_id: "db75aa06-225a-451d-854e-71a4be76c772",
      user: {
        user_id: "99a952fd-2926-4b1b-a0ba-4e76f2220c77",
        user_first_name: "Zane",
        user_last_name: "Ashfull",
        user_avatar:
          "https://robohash.org/officiismolestiaeest.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_comment_id: "c76eeac7-65f3-4819-a90e-a280eff6b43b",
    ticket_comment_content:
      "montes nascetur ridiculus mus vivamus vestibulum sagittis sapien cum sociis natoque penatibus",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "5/28/2023",
    ticket_comment_team_member: {
      team_member_id: "51666c96-4c4a-48ed-8810-bf8365edebb9",
      user: {
        user_id: "9d66e9ca-ff1b-4af6-be55-78c542263030",
        user_first_name: "Nike",
        user_last_name: "Martschik",
        user_avatar:
          "https://robohash.org/etsuscipitfuga.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_comment_id: "f7b0103b-c756-4f77-8969-24c3f32b1b25",
    ticket_comment_content:
      "sagittis dui vel nisl duis ac nibh fusce lacus purus aliquet at feugiat non pretium quis lectus suspendisse",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "8/3/2023",
    ticket_comment_team_member: {
      team_member_id: "cdc12fc7-9889-4425-bd08-60a15dfc1d88",
      user: {
        user_id: "c30574fe-4bf0-4f45-85f3-9e2bcb716cef",
        user_first_name: "Auria",
        user_last_name: "Tidcomb",
        user_avatar:
          "https://robohash.org/quaeratsitlabore.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_comment_id: "0a298f31-f595-484e-90da-9c07884799ef",
    ticket_comment_content:
      "viverra pede ac diam cras pellentesque volutpat dui maecenas tristique est",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "2/2/2023",
    ticket_comment_team_member: {
      team_member_id: "6b05307e-a328-4eef-b3d7-7b11fcf7d821",
      user: {
        user_id: "20930d12-d8d6-41ff-8484-3b1490506b98",
        user_first_name: "Dane",
        user_last_name: "Mouat",
        user_avatar:
          "https://robohash.org/fugitipsamdolorum.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_comment_id: "103d70c6-1e26-4d33-8237-70718d41ae64",
    ticket_comment_content:
      "sem sed sagittis nam congue risus semper porta volutpat quam pede lobortis ligula sit amet eleifend pede libero quis",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "8/30/2023",
    ticket_comment_team_member: {
      team_member_id: "17c0c687-c6bd-46ce-9e70-b9bd69885694",
      user: {
        user_id: "ce8e2ece-1a11-4368-8340-14d6c7dc51ba",
        user_first_name: "Brent",
        user_last_name: "Arons",
        user_avatar:
          "https://robohash.org/quiadelenitiillum.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_comment_id: "bc8c5738-e133-4e92-9d77-c80878a4bf66",
    ticket_comment_content:
      "cubilia curae nulla dapibus dolor vel est donec odio justo",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "8/7/2023",
    ticket_comment_team_member: {
      team_member_id: "2a45718e-d383-4c25-8201-0ec356aee545",
      user: {
        user_id: "26c1391b-6260-4d68-8e1b-f0dbd570fbad",
        user_first_name: "Tansy",
        user_last_name: "Jedrzej",
        user_avatar:
          "https://robohash.org/magnamutnostrum.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_comment_id: "78ebd4af-a0ec-438c-a743-d955b0b1a930",
    ticket_comment_content:
      "pede libero quis orci nullam molestie nibh in lectus pellentesque at nulla suspendisse potenti cras",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "9/23/2023",
    ticket_comment_team_member: {
      team_member_id: "656c2fbf-ca93-4dee-8192-7da090417c37",
      user: {
        user_id: "1780591e-6727-416e-9da7-c8fe66b2c1d5",
        user_first_name: "Paton",
        user_last_name: "Farndon",
        user_avatar:
          "https://robohash.org/atqueetipsum.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_comment_id: "fd4e3128-febf-47be-ad7a-f171307ec57c",
    ticket_comment_content:
      "vivamus vestibulum sagittis sapien cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "6/20/2023",
    ticket_comment_team_member: {
      team_member_id: "08f25f21-7f08-4dad-843d-eb48563c5a80",
      user: {
        user_id: "07b48bc7-8a1f-465b-b6e9-e4c995446206",
        user_first_name: "Mamie",
        user_last_name: "De Angelis",
        user_avatar:
          "https://robohash.org/possimusducimusblanditiis.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_comment_id: "84d95d5d-4949-43b4-bf4b-bd8f86ca9281",
    ticket_comment_content:
      "dis parturient montes nascetur ridiculus mus etiam vel augue vestibulum rutrum",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "9/12/2023",
    ticket_comment_team_member: {
      team_member_id: "661ff5af-8edb-4286-b356-89443a912c89",
      user: {
        user_id: "00d6e59a-0540-40a7-b642-6a715aff7e5f",
        user_first_name: "Gusty",
        user_last_name: "Acom",
        user_avatar:
          "https://robohash.org/nihilculpased.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_comment_id: "2b8be6e8-7041-47ca-b545-9ae388422662",
    ticket_comment_content:
      "tincidunt in leo maecenas pulvinar lobortis est phasellus sit amet erat nulla tempus vivamus in felis eu sapien cursus vestibulum",
    ticket_comment_is_edited: false,
    ticket_comment_is_disabled: false,
    ticket_comment_date_created: "5/31/2023",
    ticket_comment_team_member: {
      team_member_id: "d26488fc-38a2-4b0c-a26c-b34efe756a76",
      user: {
        user_id: "a84cf7c4-a6a7-4462-af3f-6547220bf66e",
        user_first_name: "Creight",
        user_last_name: "Dollin",
        user_avatar:
          "https://robohash.org/istesintminus.png?size=50x50&set=set1",
      },
    },
  },
];

export const TEMP_TICKET_COMMENT_ATTACHMENT_LIST = [
  {
    attachment_bucket: "COMMENT_ATTACHMENTS",
    attachment_date_created: "8/7/2023",
    attachment_id: "7de842dd-ba8d-4bc5-be2f-0eeaf388b67a",
    attachment_is_disabled: false,
    attachment_name: "neural-net.png",
    attachment_value:
      "6990727c-ec13-4c45-85db-1570a80de2f8-attachment_name.png",
    attachment_public_url:
      "https://robohash.org/autemvoluptatemvoluptates.png?size=50x50&set=set1",
  },
  {
    attachment_bucket: "COMMENT_ATTACHMENTS",
    attachment_date_created: "10/13/2023",
    attachment_id: "e76e6a95-e86a-4dd6-8b15-8f8ba6a78bcb",
    attachment_is_disabled: false,
    attachment_name: "task-force.pdf",
    attachment_value:
      "c76eeac7-65f3-4819-a90e-a280eff6b43b-attachment_name.pdf",
    attachment_public_url:
      "https://robohash.org/suntnesciuntfugiat.png?size=50x50&set=set1",
  },
  {
    attachment_bucket: "COMMENT_ATTACHMENTS",
    attachment_date_created: "9/19/2023",
    attachment_id: "5a759a22-3382-4a96-8100-30f5e834125a",
    attachment_is_disabled: false,
    attachment_name: "encoding.csv",
    attachment_value:
      "c76eeac7-65f3-4819-a90e-a280eff6b43b-attachment_name.csv",
    attachment_public_url:
      "https://robohash.org/numquamautpariatur.png?size=50x50&set=set1",
  },
];

export const getServerSideProps: GetServerSideProps =
  withAuthAndOnboardingRequestPage(async ({ context, supabaseClient }) => {
    try {
      const { ticket } = await getTicketOnLoad(supabaseClient, {
        ticketId: `${context.query.ticketId}`,
      });

      const commentList = TEMP_TICKET_COMMENT_LIST.sort((a, b) => {
        const date1 = new Date(a.ticket_comment_date_created);
        const date2 = new Date(b.ticket_comment_date_created);

        if (date1 < date2) {
          return -1;
        } else if (date1 > date2) {
          return 1;
        } else {
          return 0;
        }
      });

      return {
        props: {
          ticket,
          commentList,
        },
      };
    } catch (e) {
      console.error(e);
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  });

type Props = {
  ticket: TicketType;
  commentList: TicketCommentType[];
};

const Page = ({ ticket, commentList }: Props) => {
  return (
    <>
      <Meta description="Ticket Page" url="/team-requests/tickets/[ticketId]" />
      <TicketPage ticket={ticket} commentList={commentList} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
