import * as React from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgDownload = ({ title, titleId }: SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="download_svg__icon download_svg__icon-tabler download_svg__icon-tabler-download"
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
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12" />
  </svg>
);
export default SvgDownload;
