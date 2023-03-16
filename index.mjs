// For loading env during development only, use AWS Lambda to set up env vars
import * as dotenv from 'dotenv';
dotenv.config();

import https from "https";
import { Configuration, OpenAIApi } from "openai";

const bot_token = process.env.BOT_API_TOKEN
const openai_token = process.env.OPENAI_API_TOKEN

const configuration = new Configuration({
    apiKey: openai_token,
});

const openai = new OpenAIApi(configuration);

export const handler = async (event) => {

    let message = "penis";
    let body = JSON.parse(event.body)
    let chat_id = body.message.chat.id;

    // Respond to 50% of messages
    if (Math.random() < 0.5) {

        // 4 different choices
        const choice = Math.random() * 4;

        if (choice < 1) { // 25%
            // 1st Choice - 33-33-33 rubbish
            const third = Math.random() * 3;
            if (third < 1) {
                message = "penis";
            } else if (third < 2) {
                message = "you then ah";
            } else {
                const parrotMessage = body.message.text;

                if (parrotMessage) {
                    message = parrotMessage;
                } else {
                    message = "i drip pee on the floor"
                }

            }

        } else if (choice < 2) { // 25%
            // 2nd choice - stupid stuff
            if (body.message.from.first_name === "Dois") {
                message = `Hi ${body.message.from.first_name}, wow! You have a really big penis!`;
            } else if (body.message.from.first_name === "Brady") {
                message = `shut up la ${body.message.from.first_name}`;
            } else {
                message = `Hi ${body.message.from.first_name}, look at my pretty ears!`;
            }

        } else if (choice < 4) { // 50%

            // 3rd Choice - Chat GPT
            const bodyText = body.message.text;

            if (!bodyText) {
                bodyText = "Hello!";
            }

            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", "content": "You are a Singaporean male named 'Tan Ser Han', you are full of energy, long-winded, and willing to craft elaborate sentences that people might find funny." },
                    { role: "user", content: `Hi, my name is ${body.message.from.first_name} and this is what I have to say: ${bodyText}` }
                ],
                n: 1,
            });

            console.log("Chat GPT Response: ", response.data);
            message = response.data.choices[0].message.content;
        }

        message = encodeURIComponent(message);

        let url = `https://api.telegram.org/bot${bot_token}/sendMessage?chat_id=${chat_id}&parse_mode=HTML&text=${message}`;

        console.log("Event Body:", event.body);
        console.log("Choice:", choice);
        console.log("Url:", url);
        console.log("Message:", message);

        https.get(url, (res) => {

            console.log("Url Success Response:", res.statusCode);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Success - messages sent."
                }),
            };

        }).on("error", (err) => {
            console.error(err);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error",
                    error: err
                }),
            };
        })
    } else {

        console.log("Event Body:", event);
        console.log("Staying Silent.");

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Success - no message.",
            }),
        };

    }
};
