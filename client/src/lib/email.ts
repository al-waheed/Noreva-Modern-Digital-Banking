import emailjs from "@emailjs/browser";

interface TransferEmailParams {
  toEmail: string;
  toName: string;
  amount: number;
  senderName: string;
  reference: string;
  description: string;
}

export const sendTransferEmail = async ({
  toEmail,
  toName,
  amount,
  senderName,
  reference,
  description,
}: TransferEmailParams) => {
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      to_email: toEmail,
      to_name: toName,
      amount: amount.toLocaleString("en-NG"),
      sender_name: senderName,
      reference,
      description,
    },
    {
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    },
  );
};
