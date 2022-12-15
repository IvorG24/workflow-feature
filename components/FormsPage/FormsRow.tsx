import { FormTableRow } from "@/utils/types";
import { Badge, Checkbox } from "@mantine/core";

type Props = {
  form: FormTableRow;
};

const FormsRow = ({ form }: Props) => {
  return (
    <tr key={form.form_id}>
      <td>
        <Checkbox size="xs" label={form.form_id} />
      </td>
      <td>{form.form_name}</td>
      <td>
        <Badge
          radius="xs"
          color={form.form_status?.toLowerCase() === "active" ? "blue" : "gray"}
        >
          {form.form_status}
        </Badge>
      </td>
      <td>{new Date(`${form.form_created_at}`).toLocaleDateString()}</td>
    </tr>
  );
};

export default FormsRow;
