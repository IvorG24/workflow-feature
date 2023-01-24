import { AppShell, Text, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormslyFooter from "./Footer/FormslyFooter";
import FormslyHeader from "./Header/FormslyHeader";
import FormslyNavbar from "./Navbar/FormslyNavbar";

const teamListData = [
  {
    name: "Lakers",
    id: "1",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Lakers@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
  {
    name: "Celtics",
    id: "2",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Celtics@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
  {
    name: "Warriors",
    id: "3",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Warriors@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
  {
    name: "Bulls",
    id: "4",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Bulls@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
  {
    name: "Spurs",
    id: "5",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Spurs@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
  {
    name: "Heat",
    id: "6",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Heat@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
  {
    name: "Rockets",
    id: "7",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Rockets@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
  {
    name: "Clippers",
    id: "8",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Clippers@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
  {
    name: "Pistons",
    id: "9",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Pistons@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
  {
    name: "Thunder",
    id: "10",
    image: "https://i.imgur.com/fGxgcDF.png",
    description: "Thunder@description.com",
    // icon: <IconSelector size={14} stroke={1.5} />,
  },
];

const formListData = [
  { name: "Requisition Form", id: "1" },
  { name: "Payment Form", id: "2" },
  { name: "Leave Form", id: "3" },
  { name: "Expense Form", id: "4" },
  { name: "Travel Form", id: "5" },
  { name: "Time-off Form", id: "6" },
  { name: "Equipment Form", id: "7" },
  { name: "Training Form", id: "8" },
  { name: "Purchase Form", id: "9" },
  { name: "Personnel Form", id: "10" },
  { name: "Performance Form", id: "11" },
  { name: "Onboarding Form", id: "12" },
  { name: "Inventory Form", id: "13" },
  { name: "Incident Form", id: "14" },
  { name: "Feedback Form", id: "15" },
  { name: "Facility Form", id: "16" },
  { name: "Expense Reimbursement Form", id: "17" },
  { name: "Emergency Form", id: "18" },
  { name: "Employment Form", id: "19" },
  { name: "Disciplinary Form", id: "20" },
];

function Layout() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [formList, setFormList] = useState(formListData);
  const [teamList, setTeamList] = useState(teamListData);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (!router.asPath.includes("/teams")) return;
    if (!router.query.teamName) router.push("/");
  }, [router]);

  const handleSearchForm = (value: string) => {
    // Filter fomr list by name using keyword.
    const filteredFormList = formListData.filter((form) =>
      form.name.toLowerCase().includes(value.toLowerCase())
    );
    setFormList(filteredFormList);
  };

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <FormslyNavbar
          opened={opened}
          setOpened={setOpened}
          teamList={teamList}
          formList={formList}
          handleSearchForm={handleSearchForm}
        />
      }
      // aside={
      //   <MediaQuery smallerThan="md" styles={{ display: "none" }}>
      //     <Aside
      //       p="md"
      //       hiddenBreakpoint="md"
      //       width={{ sm: 200, lg: 300 }}
      //       style={{ height: "100%" }}
      //     >
      //       <Text>Application sidebar</Text>
      //     </Aside>
      //   </MediaQuery>
      // }
      footer={<FormslyFooter />}
      header={
        // <Header height={{ base: 50, md: 70 }} p="md">
        //   <div
        //     style={{ display: "flex", alignItems: "center", height: "100%" }}
        //   >
        //     <MediaQuery largerThan="sm" styles={{ display: "none" }}>
        //       <Burger
        //         opened={opened}
        //         onClick={() => setOpened((o) => !o)}
        //         size="sm"
        //         color={theme.colors.gray[6]}
        //         mr="xl"
        //       />
        //     </MediaQuery>

        //     <Text>Application header</Text>
        //   </div>
        // </Header>
        <FormslyHeader opened={opened} setOpened={setOpened} />
      }
    >
      <Text>Resize app to see responsive navbar in action</Text>
    </AppShell>
  );
}

export default Layout;
