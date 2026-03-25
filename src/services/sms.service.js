import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendSMS = async ({to, message}) => {
  const message = await client.messages.create({
    body: message,
    from: process.env.SMS_FROM,
    to
  });

  console.log(message.body);
}
