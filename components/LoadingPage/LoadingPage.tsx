import { Container, Loader } from "@mantine/core";
import styles from "./LoadingPage.module.scss";

const LoadingPage = () => {
  return (
    <Container fluid className={styles.container}>
      <Loader />
    </Container>
  );
};

export default LoadingPage;
