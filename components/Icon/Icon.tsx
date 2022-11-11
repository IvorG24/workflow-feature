import Image from "next/image";

type Props = {
  src: string;
  width: number;
  height: number;
  className?: string;
  alt: string;
};

const Icon = ({ src, width, height, className, alt }: Props) => {
  return (
    <Image
      src={src}
      width={width}
      height={height}
      className={className}
      alt={alt}
    />
  );
};

export default Icon;
