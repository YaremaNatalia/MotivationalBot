const setWebhook = async (bot, API_URL, TELEGRAM_TOKEN) => {
  const webhookURL = `${API_URL}/webhook/${TELEGRAM_TOKEN}`;
  await bot.api.setWebhook(webhookURL);
  console.log(`Webhook is set at: ${webhookURL}`);
};

const handleWebhookRequest = async (req, res, bot) => {
  try {
    await bot.init();
    await bot.handleUpdate(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling webhook request:", error);
    res.status(500).send("Error");
  }
};

export default { setWebhook, handleWebhookRequest };
