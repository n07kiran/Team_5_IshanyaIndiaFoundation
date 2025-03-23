import dotenv from "dotenv"
import twilio from "twilio";
dotenv.config()


const client = twilio(process.env.SID, process.env.TOKEN);

export const sendSMS = async (to,message) => {
  try {
    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:+91${to}`,
      body: message,
    });

    console.log(`✅ Message sent! SID: ${response.sid}`);
    return response.sid;
  } catch (error) {
    console.error("❌ Error sending message:", error.message);
    throw error;
  }
};


