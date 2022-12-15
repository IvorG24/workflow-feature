import * as React from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgMaximize = ({ title, titleId }: SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="maximize_svg__icon maximize_svg__icon-tabler maximize_svg__icon-tabler-arrows-maximize"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-labelledby={titleId}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M0 0h24v24H0z" stroke="none" />
    <path d="M16 4h4v4M14 10l6-6M8 20H4v-4M4 20l6-6M16 20h4v-4M14 14l6 6M8 4H4v4M4 4l6 6" />
  </svg>
);
export default SvgMaximize;
