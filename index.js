import { Bot, InlineKeyboard } from "grammy";
import dotenv from "dotenv";
import messages from "./helpers/messages.js";
import getRandomSticker from "./helpers/getSticker.js";
import express from "express";
import webhook from "./helpers/webhook.js";

dotenv.config();

const { TELEGRAM_TOKEN, API_URL, PORT } = process.env;
const app = express();
app.use(express.json());

const bot = new Bot(TELEGRAM_TOKEN);
const userLanguages = {};

bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("Українська", "motivate_ukr")
    .text("English", "motivate_eng")
    .text("Español", "motivate_esp");

  await ctx.reply(messages.welcomeMessage, {
    reply_markup: keyboard,
  });
});

bot.on("callback_query:data", async (ctx) => {
  const userName = ctx.from.first_name;
  const callbackData = ctx.callbackQuery.data;

  if (callbackData.startsWith("motivate")) {
    const language = callbackData.split("_")[1];

    if (!messages.phrases[language]) {
      console.error(`Invalid language: ${language}`);
      await ctx.answerCallbackQuery({ text: "Invalid language selected!" });
      return;
    }
    userLanguages[ctx.from.id] = language;
    const greetingMessage = messages.greetings(userName, language);
    const keyboard = new InlineKeyboard().text(
      messages.motivateButtonName[language],
      `generate_${language}`
    );

    try {
      await ctx.reply(greetingMessage, { reply_markup: keyboard });
      await ctx.answerCallbackQuery();
    } catch (error) {
      console.error("Error sending greeting message", error);
    }
  }

  if (callbackData.startsWith("generate")) {
    const language = callbackData.split("_")[1];
    const randomSticker = getRandomSticker();
    if (randomSticker) {
      try {
        await ctx.replyWithSticker(randomSticker);
      } catch (error) {
        console.error("Error sending sticker", error);
        await ctx.reply("👋😊");
      }
    } else {
      await ctx.reply("👋😊");
    }

    const randomPhrase =
      messages.phrases[language][
        Math.floor(Math.random() * messages.phrases[language].length)
      ];

    if (!randomPhrase) {
      console.error("Random phrase is empty.");
      return;
    }

    const styledMessage = `${messages.fireworks}${randomPhrase}${messages.fireworks}`;
    const keyboard = new InlineKeyboard().text(
      messages.moreMotivateButtonName[language],
      `generate_${language}`
    );

    try {
      await ctx.reply(styledMessage, { reply_markup: keyboard });
      await ctx.answerCallbackQuery();
    } catch (error) {
      console.error("Error sending message", error);
    }
  }
});


bot.on("message", async (ctx) => {
  try {
    const language = userLanguages[ctx.from.id];
    const randomSticker = getRandomSticker();
    if (randomSticker) {
      try {
        await ctx.replyWithSticker(randomSticker);
      } catch (stickerError) {
        console.error("Error sending sticker", stickerError);
        await ctx.reply("👋😊");
      }
    } else {
      await ctx.reply("👋😊");
    }
    const keyboard = new InlineKeyboard()
      .text(messages.moreMotivateButtonName[language], `generate_${language}`)
      .row();

    await ctx.reply("   🤔   ", { reply_markup: keyboard });
  } catch (error) {
    console.error("Error processing message", error);
  }
});
app.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
  await webhook.handleWebhookRequest(req, res, bot);
});

app.listen(PORT, async () => {
  await webhook.setWebhook(bot, API_URL, TELEGRAM_TOKEN);
});
