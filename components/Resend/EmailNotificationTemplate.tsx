type Props = {
  message: string;
  recipientName?: string;
  callbackLink?: string;
  callbackLinkLabel?: string;
};

const EmailNotificationTemplate = ({
  message,
  recipientName,
  callbackLink,
  callbackLinkLabel = "Click here",
}: Props) => (
  <div>
    <p>{`Hi${recipientName ? ` ${recipientName}` : ""},`}</p>
    <p>{message}</p>
    &nbsp;
    {callbackLink ? (
      <p>
        <a href={callbackLink}>{callbackLinkLabel}</a>
      </p>
    ) : null}
    &nbsp;
    <p>Thank you,</p>
    <p>Formsly Team</p>
  </div>
);

export default EmailNotificationTemplate;
