import * as React from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgGithub = ({ title, titleId }: SVGRProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="M24 4A20 20 0 0 0 4 24c0 8.84 5.74 16.34 13.68 19 1 .16 1.32-.46 1.32-1v-3.38c-5.54 1.2-6.72-2.68-6.72-2.68-.92-2.32-2.22-2.94-2.22-2.94-1.82-1.24.14-1.2.14-1.2 2 .14 3.06 2.06 3.06 2.06C15 36.9 17.94 36 19.08 35.52c.18-1.3.7-2.18 1.26-2.68-4.44-.5-9.1-2.22-9.1-9.84 0-2.22.76-4 2.06-5.42-.2-.5-.9-2.58.2-5.28 0 0 1.68-.54 5.5 2.04 1.58-.44 3.3-.66 5-.66 1.7 0 3.42.22 5 .66 3.82-2.58 5.5-2.04 5.5-2.04 1.1 2.7.4 4.78.2 5.28C36 19 36.76 20.78 36.76 23c0 7.64-4.68 9.32-9.14 9.82.72.62 1.38 1.84 1.38 3.7V42c0 .54.32 1.18 1.34 1C38.28 40.32 44 32.84 44 24A20 20 0 0 0 24 4Z"
      fill="#000"
    />
  </svg>
);
export default SvgGithub;
