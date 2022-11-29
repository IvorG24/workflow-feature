// todo:fix tables on mobile
// todo: create unit test
import Table from "@/components/Table/Table";
import { Checkbox, Text } from "@mantine/core";
import { Form } from "./FormsPage";
import FormsRow from "./FormsRow";

type Props = {
  colorScheme: "light" | "dark";
  forms: Form[];
};

const FormsTable = ({ forms }: Props) => {
  return (
    <Table mt="lg">
      <thead>
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
