import { Container, Flex, Title } from "@mantine/core";
import ReportItem from "./ReportItem";

type Props = {
  reportList: {
    title: string;
    description: string;
    href: string;
  }[];
};
const ReportListPage = ({ reportList }: Props) => {
  return (
    <Container p={0}>
      <Title order={2}>Report Metrics</Title>

      <Flex mt="xl">
        {reportList.map((report) => (
          <ReportItem
            key={report.title}
            title={report.title}
            description={report.description}
            href={report.href}
          />
        ))}
      </Flex>
    </Container>
  );
};

export default ReportListPage;
