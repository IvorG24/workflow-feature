import { Badge, Checkbox } from "@mantine/core";
import { Form } from "./FormsPage";

type Props = {
  form: Form;
};

const FormsRow = ({ form }: Props) => {
  return (
    <tr key={form.id}>
      <td>
        <Checkbox size="xs" label={form.id} />
      </td>
      <td>{form.title}</td>
      <td>
        <Badge
          radius="xs"
          color={form.status.toLowerCase() === "active" ? "blue" : "gray"}
        >
          {form.status}
        </Badge>
      </td>
      <td>{form.updated_at}</td>
    </tr>
  );
};

export default FormsRow;
