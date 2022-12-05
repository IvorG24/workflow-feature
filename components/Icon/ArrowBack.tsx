type SVGRProps = {
  title?: string;
  titleId?: string;
};
const SvgArrowBack = ({ title, titleId }: SVGRProps) => (
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
      d="M20 44 0 24 20 4l2.8 2.85L5.65 24 22.8 41.15Z"
      fill="currentColor"
    />
  </svg>
);
export default SvgArrowBack;
