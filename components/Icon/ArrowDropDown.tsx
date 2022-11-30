type SVGRProps = {
  title?: string;
  titleId?: string;
};
const SvgArrowDropDown = ({ title, titleId }: SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    height="1em"
    width="1em"
    role="img"
    aria-labelledby={titleId}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="m24 30-10-9.95h20Z" fill="currentColor" />
  </svg>
);
export default SvgArrowDropDown;
