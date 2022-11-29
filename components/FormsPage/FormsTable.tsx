// todo:fix tables on mobile
// todo: create unit test
import { Checkbox, Table, Text } from "@mantine/core";
import { Form } from "./FormsPage";
import styles from "./FormsPage.module.scss";
import FormsRow from "./FormsRow";

type Props = {
  colorScheme: "light" | "dark";
  forms: Form[];
};

const FormsTable = ({ colorScheme, forms }: Props) => {
  return (
    <Table mt="lg">
      <thead
        className={
          colorScheme === "dark" ? styles.darkColor : styles.lightColor
        }
      >
        <tr>
          <th>
            <Checkbox size="xs" label={<Text>Id</Text>} />
          </th>
          <th>Title</th>
          <th>Status</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody>
        {forms.map((form) => (
          <FormsRow key={form.id} form={form} />
        ))}
      </tbody>
    </Table>
  );
};

export default FormsTable;
