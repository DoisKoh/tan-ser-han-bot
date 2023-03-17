// For loading env during development only, use AWS Lambda to set up env vars
import * as dotenv from 'dotenv';
dotenv.config();

// import https from "https";
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
    let first_name = body.message.from.first_name;
    let persona = ["gangster", "long-winded professor", "dumb blonde"][Math.floor(Math.random() * 3)];

    let sendMessage = false;

    if (body.message && body.message.text && body.message.entities && body.message.entities.length > 0) {

        let foundMention = false;
        let _entity = body.message.entities.find((e) => {
            if (e.type == "mention" && body.message.text.slice(e.offset, e.length) === "@SerHanBot") {
                foundMention = true;
                return true;
            } else {
                return false;
            }
        });

        if (foundMention) {
            sendMessage = true;

            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are a Singaporean male named 'Tan Ser Han', you speak like a ${persona}. You are speaking to ${first_name}.`
                    },
                    {
                        role: "user",
                        content: body.message.text
                    }
                ],
                n: 1,
            });

            console.log("persona", persona);
            console.log("Elicited Chat GPT Response: ", response.data);
            message = response.data.choices[0].message.content;
        }
    }

    // Respond to 50% of messages if no mentions are found
    if (!sendMessage && Math.random() < 0.5) {

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
            if (first_name === "Dois") {
                message = `Hi ${body.message.from.first_name}, wow! You have a really big penis!`;
            } else if (first_name === "Brady") {
                message = `shut up la ${body.message.from.first_name}`;
            } else {
                message = `Hi ${first_name}, look at my pretty ears!`;
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
                    {
                        role: "system",
                        content: `You are a Singaporean male named 'Tan Ser Han', you are long-winded and stupid. You are speaking to ${first_name}.`
                    },
                    {
                        role: "user",
                        content: body.message.text
                    }
                ],
                n: 1,
            });

            console.log("persona", persona);
            console.log("Chat GPT Response: ", response.data);
            message = response.data.choices[0].message.content;
        }

        sendMessage = true;

        console.log("Choice:", choice);
    }

    if (sendMessage) {
        message = encodeURIComponent(message);

        let url = `https://api.telegram.org/bot${bot_token}/sendMessage?chat_id=${chat_id}&parse_mode=HTML&text=${message}`;

        console.log("Event Body:", body);
        console.log("Url:", url);
        console.log("Message:", message);

        try {
            // fetch is available with Node.js 18
            const res = await fetch(url);

            console.log("Telegram API Status Code:", res.status);

            let json = await res.json();
            console.log("Telegram API Data:", json);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Success - messages sent."
                }),
            };
        }
        catch (err) {

            console.error(err);

            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error",
                    error: err
                }),
            };
        }
    } else {
        console.log("Event Body:", body);
        console.log("Staying Silent.");

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Success - no message.",
            }),
        };
    }
};

let response = await handler({
    "body": "{\"update_id\":67720322,\"message\":{\"message_id\":1031,\"from\":{\"id\":100653600,\"is_bot\":false,\"first_name\":\"Dois\",\"last_name\":\"Koh\",\"username\":\"DoisKoh\",\"language_code\":\"en\"},\"chat\":{\"id\":100653600,\"first_name\":\"Dois\",\"last_name\":\"Koh\",\"username\":\"DoisKoh\",\"type\":\"private\"},\"date\":1678648499,\"text\":\"Test Message For Ser Han Bot\"}}"
});

console.log(response)