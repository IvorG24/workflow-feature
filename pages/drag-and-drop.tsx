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
import {
  DragDropContext,
  Draggable,
  DragUpdate,
  Droppable,
} from "react-beautiful-dnd";

type ItemData = {
  id: string;
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

function Item({ id, src, alt, text, badge, buttonMessage }: ItemData) {
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
  const handleOnDragEnd = (result: DragUpdate) => {
    // handles dragged to outside of draggable area
    if (!result.destination) return;
    // we use temp as staging for item
    const tempArr = cardData;
    const [tempItem] = tempArr.splice(result.source.index, 1);
    tempArr.splice(result.destination.index, 0, tempItem);
    setCardData(tempArr);
    // take order of id's in modified tempArr
    const arrOfIds = tempArr.map((item) => item.id);
    setOrderArr(arrOfIds);
    console.log(orderArr);
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
                            <Item {...item} />
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
