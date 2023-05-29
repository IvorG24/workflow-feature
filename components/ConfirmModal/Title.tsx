import { Title as MantineTitle, TitleProps } from "@mantine/core";

const Title = ({ children, ...props }: TitleProps) => {
  return (
    <MantineTitle size="h3" {...props}>
      {children}
    </MantineTitle>
  );
};

export default Title;
