type SVGRProps = {
  title?: string;
  titleId?: string;
};
const SvgEdit = ({ title, titleId }: SVGRProps) => (
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
      d="M9 39h2.2l22.15-22.15-2.2-2.2L9 36.8V39Zm30.7-24.3-6.4-6.4 2.1-2.1c.567-.567 1.267-.85 2.1-.85.833 0 1.533.283 2.1.85l2.2 2.2c.567.566.85 1.266.85 2.1 0 .833-.283 1.533-.85 2.1l-2.1 2.1Zm-2.1 2.1L12.4 42H6v-6.4l25.2-25.2 6.4 6.4Zm-5.35-1.05-1.1-1.1 2.2 2.2-1.1-1.1Z"
      fill="#444746"
    />
  </svg>
);
export default SvgEdit;
