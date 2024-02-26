import { Container, Flex, Title } from "@mantine/core";
import SLAItem from "./SLAItem";

type Props = {
  slaList: {
    title: string;
    description: string;
    href: string;
  }[];
};
const SLAListPage = ({ slaList }: Props) => {
  return (
    <Container p={0}>
      <Title order={2}>SLA</Title>

      <Flex mt="xl">
        {slaList.map((sla) => (
          <SLAItem
            key={sla.title}
            title={sla.title}
            description={sla.description}
            href={sla.href}
          />
        ))}
      </Flex>
    </Container>
  );
};

export default SLAListPage;
