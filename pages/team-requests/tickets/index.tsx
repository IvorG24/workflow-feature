// Imports
import Meta from "@/components/Meta/Meta";
import TicketListPage from "@/components/TicketListPage/TicketListPage";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { TeamMemberWithUserType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const TEMP_TICKET_LIST = [
  {
    ticket_id: "924ad6db-dac9-4cdf-8abb-2f0fa0804d4f",
    ticket_title: "Grass-roots bandwidth-monitored standardization",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "CLOSED",
    ticket_date_created: "5/31/2023",
    ticket_requester: {
      team_member_id: "73f2d460-2a03-409e-a5a7-191c6946d561",
      user: {
        user_first_name: "Ali",
        user_last_name: "Hatherley",
        user_avatar:
          "https://robohash.org/eatemporibusvel.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "b94c5280-c8d9-4d63-a009-6436075ace1c",
      user: {
        user_first_name: "Philippine",
        user_last_name: "Staves",
        user_avatar:
          "https://robohash.org/etrerumconsequatur.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_id: "da127818-2941-4d33-898f-63af654893a9",
    ticket_title: "Ergonomic scalable application",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "PENDING",
    ticket_date_created: "6/16/2023",
    ticket_requester: {
      team_member_id: "fd9f4771-8c2f-4e58-af8b-7938a38ac46e",
      user: {
        user_first_name: "Bordy",
        user_last_name: "Cattrall",
        user_avatar:
          "https://robohash.org/sequiinventoreofficiis.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "2d65a3cd-b0c9-4d71-bde1-14957504088c",
      user: {
        user_first_name: "Thedric",
        user_last_name: "Huot",
        user_avatar: "https://robohash.org/autetid.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_id: "df3e30c9-2b35-4eb2-ae80-d0278642fe60",
    ticket_title: "Object-based user-facing synergy",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "PENDING",
    ticket_date_created: "5/22/2023",
    ticket_requester: {
      team_member_id: "cc46afda-17b3-4fb9-8368-f762563cd0c0",
      user: {
        user_first_name: "Muriel",
        user_last_name: "Billham",
        user_avatar:
          "https://robohash.org/optioeiusvoluptas.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "3f51bbd8-643b-4771-a6b4-82b43f4e9a23",
      user: {
        user_first_name: "Coral",
        user_last_name: "Dibnah",
        user_avatar:
          "https://robohash.org/officiaquoquasi.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_id: "5f5d413c-a61a-48a2-9e67-5d675eb20f10",
    ticket_title: "Open-source uniform matrix",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "INCORRECT",
    ticket_date_created: "5/22/2023",
    ticket_requester: {
      team_member_id: "939ad1f6-58de-4bb3-9a89-042d6c661e77",
      user: {
        user_first_name: "Consolata",
        user_last_name: "Glidder",
        user_avatar: "https://robohash.org/iureestqui.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "e40513c7-2691-4986-b1fc-72b8cde1f499",
      user: {
        user_first_name: "Ashlan",
        user_last_name: "O'Reagan",
        user_avatar:
          "https://robohash.org/autexplicabosed.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_id: "035d930e-48e3-4af6-816c-8ddcafa11a47",
    ticket_title: "Sharable holistic info-mediaries",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "CLOSED",
    ticket_date_created: "5/24/2023",
    ticket_requester: {
      team_member_id: "489600e2-0917-4db2-bc43-8135d8f1bf5d",
      user: {
        user_first_name: "Kristyn",
        user_last_name: "Rawling",
        user_avatar:
          "https://robohash.org/voluptastemporavoluptates.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "0c2385b5-3184-4bd1-8070-03041031fdc2",
      user: {
        user_first_name: "Tildi",
        user_last_name: "Windebank",
        user_avatar:
          "https://robohash.org/etoccaecatilabore.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_id: "30b980fe-8cd0-4a12-b817-516fc1b39aa6",
    ticket_title: "Quality-focused heuristic local area network",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "CLOSED",
    ticket_date_created: "6/21/2023",
    ticket_requester: {
      team_member_id: "6f77ad58-ce5e-413b-8ffa-bbfb70dd1c9a",
      user: {
        user_first_name: "Lowe",
        user_last_name: "Olver",
        user_avatar:
          "https://robohash.org/aliquidvoluptasconsequatur.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "1d45b681-36e9-4842-8311-fbc763cb6ad5",
      user: {
        user_first_name: "Annie",
        user_last_name: "De Ambrosi",
        user_avatar:
          "https://robohash.org/etdebitisrepellendus.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_id: "ceaa0304-99bd-4e36-aed3-9445555e295f",
    ticket_title: "Monitored attitude-oriented artificial intelligence",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "INCORRECT",
    ticket_date_created: "6/17/2023",
    ticket_requester: {
      team_member_id: "35e64aa1-7ca3-413a-a10b-23b241764292",
      user: {
        user_first_name: "Noak",
        user_last_name: "Sheirlaw",
        user_avatar:
          "https://robohash.org/idnemoexcepturi.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "b9f45158-1781-4214-9c29-d2675bcca51e",
      user: {
        user_first_name: "Teri",
        user_last_name: "Samwaye",
        user_avatar:
          "https://robohash.org/nonlaborumut.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_id: "2faf44cf-4320-42cf-b161-5b0a67295dd5",
    ticket_title: "Multi-channelled dynamic parallelism",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "PENDING",
    ticket_date_created: "6/3/2023",
    ticket_requester: {
      team_member_id: "3280ebc8-01b3-46a9-95c0-058741fe0cb7",
      user: {
        user_first_name: "Valry",
        user_last_name: "Pickthorn",
        user_avatar:
          "https://robohash.org/utdistinctiopraesentium.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "6173aea9-4a1f-4d74-bd1f-e10786d8a76d",
      user: {
        user_first_name: "Cullie",
        user_last_name: "Coneybeare",
        user_avatar:
          "https://robohash.org/quameosdelectus.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_id: "48a1c5d0-5045-470d-884f-af0c67a4292d",
    ticket_title: "Synergistic composite approach",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "INCORRECT",
    ticket_date_created: "6/5/2023",
    ticket_requester: {
      team_member_id: "2d6bd112-eafd-46b9-a94e-c25513f25370",
      user: {
        user_first_name: "Patty",
        user_last_name: "Sessuns",
        user_avatar:
          "https://robohash.org/quomolestiaetempore.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "2af92491-5d51-4807-8801-6b26a41c6e0d",
      user: {
        user_first_name: "Kelsey",
        user_last_name: "Duggen",
        user_avatar:
          "https://robohash.org/debitisquosnostrum.png?size=50x50&set=set1",
      },
    },
  },
  {
    ticket_id: "2cea53cf-912b-4877-8872-620f9f0c9528",
    ticket_title: "Robust multimedia implementation",
    ticket_description:
      "Item: MOTOROLA GP999 Plus Gravel Base Course Fine Sand",
    ticket_category: "Item Request",
    ticket_status: "CLOSED",
    ticket_date_created: "6/5/2023",
    ticket_requester: {
      team_member_id: "b2789f2b-02ff-4094-8c61-7592e6964fbd",
      user: {
        user_first_name: "Rice",
        user_last_name: "Conaghan",
        user_avatar: "https://robohash.org/sedutminus.png?size=50x50&set=set1",
      },
    },
    ticket_approver: {
      team_member_id: "384feaae-0071-4dfb-8f4b-228bb83abb06",
      user: {
        user_first_name: "Rhetta",
        user_last_name: "Everson",
        user_avatar:
          "https://robohash.org/dictaessedistinctio.png?size=50x50&set=set1",
      },
    },
  },
];

export const TEMP_TEAM_MEMBER_LIST = [
  {
    team_member_id: "682f6413-1c18-4404-8ddb-ad957b2bdeeb",
    team_member_role: "Admin",
    team_member_user: {
      user_id: "e0085ae0-06b6-4573-9122-231d38df4e24",
      user_first_name: "Marius",
      user_last_name: "Simoneau",
      user_avatar:
        "https://robohash.org/eatemporibusvel.png?size=50x50&set=set1",
    },
  },
  {
    team_member_id: "e6afc054-238b-478b-885a-9f9d1ccb6ce4",
    team_member_role: "Admin",
    team_member_user: {
      user_id: "51fe296d-2995-4d32-b564-3d168b84a590",
      user_first_name: "Jeanie",
      user_last_name: "Bow",
    },
  },
  {
    team_member_id: "79f2e51b-90e0-4fbb-ae9b-33758e7b97bb",
    team_member_role: "Member",
    team_member_user: {
      user_id: "cee8e03d-8bca-4c9d-afcf-9b9aafcb6864",
      user_first_name: "Georgette",
      user_last_name: "Huburn",
    },
  },
  {
    team_member_id: "b9d0c766-2903-4644-b583-c44e0ad044d3",
    team_member_role: "Admin",
    team_member_user: {
      user_id: "4d4ccabe-eb4c-48b0-b664-248bf0ef6e8b",
      user_first_name: "Arty",
      user_last_name: "Lidgertwood",
    },
  },
  {
    team_member_id: "8f76237e-f73f-4746-bbfa-32848f6e18a3",
    team_member_role: "Admin",
    team_member_user: {
      user_id: "25bf7b05-f2e5-4992-9720-a454ea5076ec",
      user_first_name: "Delmar",
      user_last_name: "Mossop",
    },
  },
];

export type TicketListItemType = {
  ticket_id: string;
  ticket_title: string;
  ticket_description: string;
  ticket_category: string;
  ticket_status: string;
  ticket_date_created: string;
  ticket_requester: {
    team_member_id: string;
    user: {
      user_first_name: string;
      user_last_name: string;
      user_avatar: string;
    };
  };
  ticket_approver: {
    team_member_id: string;
    user: {
      user_first_name: string;
      user_last_name: string;
      user_avatar: string;
    };
  };
};

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async () => {
    try {
      const ticketList = TEMP_TICKET_LIST;
      const teamMemberList = TEMP_TEAM_MEMBER_LIST;

      return {
        props: {
          ticketList,
          teamMemberList,
        },
      };
    } catch (error) {
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

type Props = {
  ticketList: TicketListItemType[];
  teamMemberList: TeamMemberWithUserType[];
};

const Page = (props: Props) => {
  return (
    <>
      <Meta description="Ticket List Page" url="/team-requests/tickets" />

      <TicketListPage {...props} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
