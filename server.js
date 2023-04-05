
const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const FormData = require('form-data');
const path = require('path')

const app = express();
const PORT = process.env.PORT || 3000;
const DALLE_API_KEY = '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';

async function generateTextAndImage(text) {
  const url = 'https://api.openai.com/v1/images/generations';
  const data = new FormData();
  data.append('model', 'image-alpha-001');
  data.append('prompt', `Generate an image with the caption: ${text}`);
  data.append('api_key', DALLE_API_KEY);
  data.append('num_images', 1);
  data.append('size', '512x512');
  data.append('response_format', 'url');

  const config = {
	method: 'post',
	url,
	headers: {
	  ...data.getHeaders(),
	},
	data,
  };

  const response = await axios(config);
  return response.data.data[0].url;
}

async function generateC(text) {
  const url = 'https://api.openai.com/v1/engines/davinci/completions';
  const data = {
	prompt: `Generate a comic with speech bubbles: ${text}`,
	max_tokens: 60,
	n: 1,
	stop: '\n',
	temperature: 0.7,
  };
  const headers = {
	'Content-Type': 'application/json',
	Authorization: `Bearer ${DALLE_API_KEY}`,
  };

  const response = await axios.post(url, data, { headers });
  return response.data.choices[0].text;
}

//------------ EJS Configuration ------------//
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/views'));

app.get('/', function (req, res) => {
        return res.render('index.ejs', {"comic":""});
});
app.get('/generate', async (req, res) => {
	const { prompt } = req.query.prompt;
  	try {
		const imageUrl = await generateTextAndImage(prompt);
		const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
		const image = await sharp(imageBuffer.data).resize(400, 400).toBuffer();
		res.writeHead(200, { 'Content-Type': 'image/jpeg' });
		res.end(image, 'binary');
  	} catch (error) {
		console.log(error);
		res.sendStatus(500);
  	}
});

app.listen(PORT, () => {
  console.log(`Server running on 127.0.0.1:${PORT}`);
});
