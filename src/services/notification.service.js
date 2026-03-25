import { sendMail } from "./email.service";
import { sendSMS} from "./sms.service";


export const sendNotification = async (reminder) =>{
    const {client, channel, message, subject} = reminder

    if (channel === "Email") {
        await sendMail({
            to: client.email,
            subject,
            body: message
        })
    }

    if (channel === "SMS") {
        await sendSMS({
            to: client.phone,
            message
        })
    }
}