import { Container, Flex, Switch } from "@mantine/core";
import { useState } from "react";
import {
  DragDropContext,
  Draggable,
  DragUpdate,
  Droppable,
} from "react-beautiful-dnd";
import Item from "./Item";

export type ItemData = {
  id: string;
  question: string;
  response_type: string;
  required: boolean;
  tooltip: string;
};

type Props = {
  data: ItemData[];
  order: string[];
};

const ItemList = ({ data, order }: Props) => {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [orderArr, setOrderArr] = useState(order);
  const [itemData, setCardData] = useState(data);

  const handleOnDragEnd = (result: DragUpdate) => {
    if (!result.destination) return;
    const tempArr = itemData;
    const [tempItem] = tempArr.splice(result.source.index, 1);
    tempArr.splice(result.destination.index, 0, tempItem);
    setCardData(tempArr);
    const arrOfIds = tempArr.map((item) => item.id);
    setOrderArr(arrOfIds);
  };

  const handleDelete = (id: string) => {
    setCardData((data) => data.filter((item) => item.id !== id));
    setOrderArr((data) => data.filter((item_id) => item_id !== id));
  };

  console.log(orderArr);
  console.log(itemData);
  return (
    <Container p={0} fluid>
      <Flex justify="flex-end">
        <Switch
          label="Delete Mode"
          onLabel="ON"
          offLabel="OFF"
          size="sm"
          checked={isDeleteMode}
          onChange={() => setIsDeleteMode((value) => !value)}
        />
      </Flex>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="item">
          {(provided) => {
            return (
              <Container
                {...provided.droppableProps}
                ref={provided.innerRef}
                p={0}
                fluid
              >
                {itemData.map((item, idx) => {
                  return (
                    <Draggable key={item.id} draggableId={item.id} index={idx}>
                      {(provided) => (
                        <Container
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                          p={0}
                          fluid
                        >
                          <Item
                            onDelete={() => handleDelete(item.id)}
                            isDelete={isDeleteMode}
                            item={item}
                            provided={provided}
                          />
                        </Container>
                      )}
                    </Draggable>
                  );
                })}
              </Container>
            );
          }}
        </Droppable>
      </DragDropContext>
    </Container>
  );
};

export default ItemList;
