const express = require('express');
const path = require('path');

const { Configuration, OpenAIApi } = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;
const DALLE_API_KEY = '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';

// EJS Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/views'));

// OPENAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Generating Images
async function generateImage(prompt, res) => {
  // const { prompt } = req.body;
  try {
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: "256x256",
    });

    const imageUrl = response.data.data[0].url;

    // res.status(200).json({ success: true, data: imageUrl });
    return imageUrl;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res
      .status(400)
      .json({ success: false, error: "The image could not be generated" });
  }
};

app.get('/', function(req, res){
  return res.render('index.ejs', {"comic":""});
});

app.get('/generate', async(req, res)=>{
  const { prompt } = req.query.prompt;
  const image = await generateImage(prompt, res);
})