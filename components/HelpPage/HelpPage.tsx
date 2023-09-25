import { helpPageData } from "@/utils/help-page-data";
import {
  Accordion,
  Container,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";

const HelpPage = () => {
  return (
    <Container bg="white" h="100%" fluid>
      <Container py={64}>
        <Stack>
          <Title order={3}>Formsly Support</Title>

          <Accordion variant="separated">
            {helpPageData.map((item) => (
              <Accordion.Item key={item.id} value={item.id}>
                <Accordion.Control>
                  <Text fw="bold">{item.title}</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <TypographyStylesProvider>
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                  </TypographyStylesProvider>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Stack>
      </Container>
    </Container>
  );
};

export default HelpPage;
