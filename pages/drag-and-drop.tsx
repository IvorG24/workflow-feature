import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Image,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

type ItemData = {
  src: string;
  alt: string;
  text: string;
  badge: string;
  buttonMessage: string;
};

const mockData = [
  {
    id: "a",
    src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
    alt: "test",
    text: "Norway Fjord Adventures",
    badge: "On Sale",
    buttonMessage: "Book a classic tour now",
  },
  {
    id: "b",
    src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
    alt: "test",
    text: "Norway Fjord Adventures",
    badge: "On Sale",
    buttonMessage: "Book a classic tour now",
  },
  {
    id: "c",
    src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
    alt: "test",
    text: "Norway Fjord Adventures",
    badge: "On Sale",
    buttonMessage: "Book a classic tour now",
  },
  {
    id: "d",
    src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
    alt: "test",
    text: "Norway Fjord Adventures",
    badge: "On Sale",
    buttonMessage: "Book a classic tour now",
  },
  {
    id: "e",
    src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
    alt: "test",
    text: "Norway Fjord Adventures",
    badge: "On Sale",
    buttonMessage: "Book a classic tour now",
  },
];

const savedOrder = ["a", "b", "c", "d", "e"];

function Item({ data }) {
  const { id, src, alt, text, badge, buttonMessage } = data;
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Card.Section>
        <Image src={src} height={160} alt={alt} />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>
          id:{id} - {text}
        </Text>
        <Badge color="pink" variant="light">
          {badge}
        </Badge>
      </Group>

      <Button variant="light" color="blue" fullWidth mt="md" radius="md">
        {buttonMessage}
      </Button>
    </Card>
  );
}

function DragAndDropPage(): JSX.Element {
  const [winReady, setWinReady] = useState(false);
  const [orderArr, setOrderArr] = useState(savedOrder);
  const [cardData, setCardData] = useState(mockData);
  useEffect(() => {
    setWinReady(true);
  }, []);
  const handleOnDragEnd = (item) => {
    // handles dragged to outside of draggable area
    if (!item.destination) return;
    // we use temp as staging for item
    const tempArr = cardData;
    const [tempItem] = tempArr.splice(item.source.index, 1);
    cardData.splice(item.destination.index, 0, tempItem);
    console.log(cardData);
  };
  return (
    <Container>
      <p>Hi</p>
      {winReady && (
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="items">
            {(provided) => {
              return (
                <ol {...provided.droppableProps} ref={provided.innerRef}>
                  {cardData.map((item, idx) => {
                    return (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={idx}
                      >
                        {(provided) => (
                          <li
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            <Item data={item} />
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                </ol>
              );
            }}
          </Droppable>
        </DragDropContext>
      )}
    </Container>
  );
}

export default DragAndDropPage;
