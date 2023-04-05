const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const formData = require('form-data');
const fs = require('fs');
//const Canvas = require('canvas');
//const { loadImage } = require('canvas');
//const { createCanvas } = require('canvas')
const path = require('path');
const sharp = require('sharp');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

const GPT_API_KEY = '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';
const DALLE_API_KEY = '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';

//------------ EJS Configuration ------------//
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/views'));

//------------ Bodyparser Configuration ------------//
app.use(express.urlencoded({extended: false}))

//------------ Routes ------------//
// app.use('/', require('./routes/index'));
app.get('/', function (req, res, next) {
	return res.render('index.ejs', {"comic":""});
});



//generate text and image
function generateTextAndImage(prompt, model, api_key){
    return axios.post('https://api.openai.com/v1/engines/davinci-codex/completions',
            {prompt,
                max_tokens: 150,
                temperature: 0.7,
                n: 1,
                stop: '###'},
                {headers:{Authorization: `Bearer ${GPT_API_KEY}`}})
    .then(function(gptResponse) {
        const text = gptResponse.data.choices[0].text.trim();

        return axios.post('https://api.openai.com/v1/images/generations',
                {model: 'image-alpha-001',
                api_key: DALLE_API_KEY,
                prompt: text,
                size:"512x512",
                response_format:'url',
            })
        .then(function(dalleResponse) {
            const imageUrl = dalleResponse.data.data[0].url;
            return axios.get(imageUrl, {responseType: "arraybuffer"})
            .then(function(imageData) {
                return sharp(imageData.data)
                    .composite([{input: 'speech-bubble.png', gravity: 'southeast'}])
                    .toBuffer()
                    .then(function(image) {
                        return { text, image };
                    })
            })
        })
    });
}

function generateC(text){
    const api_key = DALLE_API_KEY;
    const url = 'https://api.openai.com/v2/images/generations';

    const data = {
        'model':'image-alpha-001',
        'prompt':`Generate a comic with speech bubbles: ${text}`,
        'num_images':1,
        'size':'256x256',
        'response_format':'url',
        'extra_text': ['Speech bubble 1', 'Speech bubble 2']
    }

    const headers = {
        'Content-Type':'application/json',
        'Authorization':`Bearer ${api_key}`
    }
    return axios.post(url, data, { headers })
    .then(function(response) {
        const image = response.data.data[0].url;
        const speechBubbles = response.data.data[0].extra_text;
        return { image, speechBubbles };
    });
}


app.get('/generate', function(req, res, next){
	const { prompt } = req.query.prompt;
	const { c, extra } = generateC(prompt);
	return res.render('index.ejs', {"comic":c});
});


app.listen(PORT, () => {
    console.log(`Server running on 127.0.0.1:${PORT}`);
});
