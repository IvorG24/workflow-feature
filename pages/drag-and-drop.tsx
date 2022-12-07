import ItemList from "@/components/DragAndDrop/DragAndDrop";
import { Container } from "@mantine/core";

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

function DragAndDropPage(): JSX.Element {
  return (
    <Container>
      <ItemList data={mockData} order={savedOrder} />
    </Container>
  );
}

export default DragAndDropPage;
