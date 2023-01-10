import { Accordion, Button, Group, Paper, Text, Textarea } from "@mantine/core";

const RequestComment = () => {
  return (
    <Accordion variant="filled">
      <Accordion.Item value="comments">
        <Accordion.Control p="xs">
          <Text fz="sm" fw={500}>
            Show Comments
          </Text>
        </Accordion.Control>
        <Accordion.Panel p="0">
          <Paper px="xs" pb="xs">
            <Textarea
              placeholder="Type your comment here"
              variant="unstyled"
              // value={comment}
              // onChange={(e) => setComment(e.target.value)}
            />
            <Group position="right" mt="xs">
              <Button>Send</Button>
            </Group>
          </Paper>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default RequestComment;
