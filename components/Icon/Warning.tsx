type SVGRProps = {
  title?: string;
  titleId?: string;
};
const SvgWarning = ({ title, titleId }: SVGRProps) => (
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
      d="M2 42 24 4l22 38H2Zm5.2-3h33.6L24 10 7.2 39Zm17-2.85c.433 0 .792-.142 1.075-.425.283-.283.425-.642.425-1.075 0-.433-.142-.792-.425-1.075-.283-.283-.642-.425-1.075-.425-.433 0-.792.142-1.075.425-.283.283-.425.642-.425 1.075 0 .433.142.792.425 1.075.283.283.642.425 1.075.425Zm-1.5-5.55h3V19.4h-3v11.2Z"
      fill="currentColor"
    />
  </svg>
);
export default SvgWarning;
