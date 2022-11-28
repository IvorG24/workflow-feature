interface SVGRProps {
  title?: string;
  titleId?: string;
  color?: string;
}
const SvgCheck = ({ title, titleId, color = "#444746" }: SVGRProps) => (
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
      d="M18.9 35.7002L7.69995 24.5002L9.84995 22.3502L18.9 31.4002L38.0999 12.2002L40.25 14.3502L18.9 35.7002Z"
      fill={color}
    />
  </svg>
);
export default SvgCheck;
