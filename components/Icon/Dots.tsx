type SVGRProps = {
  title?: string;
  titleId?: string;
};
const SvgDots = ({ title, titleId }: SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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
    <circle cx={5} cy={12} r={1} />
    <circle cx={12} cy={12} r={1} />
    <circle cx={19} cy={12} r={1} />
  </svg>
);
export default SvgDots;
