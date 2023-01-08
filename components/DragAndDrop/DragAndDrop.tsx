import { Badge, Button, Card, Group, Image, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

type ItemData = {
  id: string;
  src: string;
  alt: string;
  text: string;
  badge: string;
  buttonMessage: string;
};

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

function ItemList({
  data,
  order,
}: {
  data: ItemData[];
  order: string[];
}): JSX.Element {
  const [winReady, setWinReady] = useState(false);
  const [orderArr, setOrderArr] = useState(order);
  const [cardData, setCardData] = useState(data);
  useEffect(() => {
    setWinReady(true);
  }, []);
  const handleOnDragEnd = (result: DropResult) => {
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
  };
  return (
    <>
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
    </>
  );
}

export default ItemList;
