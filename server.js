// Import necessary packages
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

// Set up app and multer for image upload
const app = express();
const upload = multer({ dest: 'uploads/' });

// // Set up endpoint for file upload
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Read image file
    const img = fs.readFileSync(req.file.path);

    // Convert image to base64
    const imgBase64 = Buffer.from(img).toString('base64');

    // Set up request data for GPT-3
    const prompt = `Panel 1: ${req.body.prompt1}\nPanel 2: ${req.body.prompt2}\nPanel 3: ${req.body.prompt3}\nPanel 4: ${req.body.prompt4}\nPanel 5: ${req.body.prompt5}`;
    const engine = 'text-davinci-002';
    const temperature = 0.8;
    const maxTokens = 200;
    const data = {
      prompt: prompt,
      temperature: temperature,
      max_tokens: maxTokens,
      n: 1,
      stop: ['Panel']
    };
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GPT_API_KEY}`
    };

    // Make request to GPT-3 API
    const response = await axios.post(`https://api.openai.com/v1/engines/${engine}/completions`, data, { headers });

    // Get generated comic text from GPT-3 response
    const generatedText = response.data.choices[0].text.trim();

    // Set up request data for DALL-E
    const api_key = process.env.DALLE_API_KEY;
    const text = generatedText;
    const size = 512;
    const data2 = {
      text: text,
      size: size
    };
    const headers2 = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`
    };

    // Make request to DALL-E API
    const response2 = await axios.post('https://api.openai.com/v1/images/generations', data2, { headers: headers2 });

    // Get generated comic image from DALL-E response
    const generatedImage = response2.data.data;

    // Set up canvas for image manipulation
    const { createCanvas, loadImage, registerFont } = require('canvas');
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    // Load fonts and set up text styles
    registerFont('fonts/Roboto-Regular.ttf', { family: 'Roboto' });
    registerFont('fonts/Roboto-Bold.ttf', { family: 'Roboto Bold' });
    ctx.font = 'bold 48px Roboto Bold';
    ctx.fillStyle = '#000000';

    // Draw comic panels and speech bubbles
    const xPositions = [50, 400, 750, 50, 400];
    const yPositions = [100, 100, 100, 350, 350];
    const bubbleSizes = [50, 50, 50, 70, 70];
    const bubbleOffsets = [-20, -20, -20, -50, -50];
    for (let i = 0; i < 5; i++) {
      // Draw panel image

app.post('/generate-comic', async (req, res) => {
  const { text, image } = req.body;

  // Upload image to DALL-E API
  const imageURL = await uploadImage(image);

  // Generate comic with GPT-3
  const comic = await generateComic(text, imageURL);

  // Create speech bubble and effects on the comic
  const speechBubbleComic = await createSpeechBubble(comic);

  // Return the generated comic to the client
  res.status(200).send({ comic: speechBubbleComic });
});

// Helper function to upload image to DALL-E API
async function uploadImage(image) {
  try {
    const response = await axios.post(DALLE_API_URL, {
      image: image,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': DALLE_API_KEY,
      },
    });

    return response.data.output_url;
  } catch (error) {
    console.error(error);
    return '';
  }
}

// Helper function to generate comic with GPT-3
async function generateComic(text, imageURL) {
  try {
    const response = await axios.post(GPT_API_URL, {
      prompt: `Draw a comic where ${text} and the image is located at ${imageURL}`,
      max_tokens: 2048,
      temperature: 0.7,
      n: 1,
      stop: STOP_SEQUENCE,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GPT_API_KEY}`,
      },
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(error);
    return '';
  }
}

// Helper function to create speech bubble and effects on the comic
async function createSpeechBubble(comic) {
  try {
    const speechBubbleComic = await Jimp.read(comic);
    const speechBubble = await Jimp.read('speech-bubble.png');

    // Calculate the size and position of the speech bubble based on the comic dimensions
    const width = speechBubbleComic.bitmap.width;
    const height = speechBubbleComic.bitmap.height;
    const speechBubbleWidth = width * 0.8;
    const speechBubbleHeight = speechBubbleWidth * 0.5;
    const speechBubbleX = width * 0.1;
    const speechBubbleY = height * 0.1;

    // Resize speech bubble to fit the calculated dimensions
    speechBubble.resize(speechBubbleWidth, speechBubbleHeight);

    // Paste speech bubble onto the comic
    speechBubbleComic.composite(speechBubble, speechBubbleX, speechBubbleY);

    // Apply speech bubble text and effects to the comic
    speechBubbleComic.print(
      font,
      speechBubbleX + speechBubbleWidth * 0.2,
      speechBubbleY + speechBubbleHeight * 0.15,
      {
        text: 'Hello World!',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      speechBubbleWidth * 0.6,
      speechBubbleHeight * 0.7
    );
    speechBubbleComic.scan(0, 0, speechBubbleComic.bitmap.width, speechBubbleComic.bitmap.height, speechBubbleFilter);

    // Convert Jimp image to base64 string
    return speechBubbleComic.getBase64Async(Jimp.MIME_PNG);
  } catch (error) {
    console.error(error);
    return '';
  }
}

// generate the comic panel
async function generateComic(text, bgImage, textStyle) {
  // get the response from the GPT-3 API
  const gptResponse = await axios.post(GPT3_API_ENDPOINT, {
    prompt: text,
    max_tokens: MAX_GPT3_TOKENS,
    temperature: GPT3_TEMPERATURE,
    n: 1,
    stream: false,
    stop: GPT3_STOP
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GPT3_API_KEY}`
    }
  });

  // extract the generated text from the GPT-3 response
  const generatedText = gptResponse.data.choices[0].text;

  // generate the image using the DALL-E API
  const imageURL = await generateImage(generatedText, bgImage);

  // create a canvas to draw the comic panel
  const canvas = createCanvas(COMIC_WIDTH, COMIC_HEIGHT);
  const context = canvas.getContext('2d');

  // draw the background image
  const bg = await loadImage(bgImage);
  context.drawImage(bg, 0, 0, COMIC_WIDTH, COMIC_HEIGHT);

  // draw the generated image
  const img = await loadImage(imageURL);
  context.drawImage(img, 0, 0, COMIC_WIDTH, COMIC_HEIGHT);

  // draw the speech bubble
  drawSpeechBubble(context, generatedText, textStyle);

  // add comic effects
  addComicEffects(context);

  // save the comic panel to a file
  const comicPath = `comic_${Date.now()}.png`;
  const buffer = canvas.toBuffer('image/png');
  await writeFileAsync(comicPath, buffer);

  // return the path to the saved comic panel
  return comicPath;
}

// function to generate a DALL-E image from text
async function generateImage(text, bgImage) {
  // convert the text to a DALL-E prompt
  const prompt = `Create an image of "${text}" on a ${COMIC_WIDTH}x${COMIC_HEIGHT} ${bgImage}`;

  // get the response from the DALL-E API
  const dalleResponse = await axios.post(DALLE_API_ENDPOINT, {
    prompt,
    size: COMIC_WIDTH,
    num_images: 1,
    response_format: 'url',
    api_key: DALLE_API_KEY
  });

  // return the URL of the generated image
  return dalleResponse.data.data[0].url;
}

        const gptResponse = await axios.post(gptUrl, requestData, { headers: headers });
        const prompt = gptResponse.data.choices[0].text;
        console.log('Prompt: ', prompt);

        // Generate image with DALL-E
        requestData = {
            "model": "image-alpha-001",
            "prompt": prompt,
            "size": "512x512",
            "response_format": "url"
        };

        const dalleResponse = await axios.post(dalleUrl, requestData, { headers: headers });
        const imageUrl = dalleResponse.data.data[0].url;
        console.log('Image URL: ', imageUrl);

        // Add speech bubble and effects to the image
        const image = await Jimp.read(imageUrl);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        const speechBubble = await Jimp.read('speech-bubble.png');
        const powEffect = await Jimp.read('pow-effect.png');
        const bamEffect = await Jimp.read('bam-effect.png');

        // Resize speech bubble and effects
        speechBubble.resize(image.bitmap.width() * 0.8, Jimp.AUTO);
        powEffect.resize(image.bitmap.width() * 0.4, Jimp.AUTO);
        bamEffect.resize(image.bitmap.width() * 0.4, Jimp.AUTO);

        // Add speech bubble and effects to the image
        const bubbleX = image.bitmap.width() * 0.05;
        const bubbleY = image.bitmap.height() * 0.6;
        const powX = image.bitmap.width() * 0.75;
        const powY = image.bitmap.height() * 0.1;
        const bamX = image.bitmap.width() * 0.6;
        const bamY = image.bitmap.height() * 0.75;
        
        image.composite(speechBubble, bubbleX, bubbleY);
        image.composite(powEffect, powX, powY);
        image.composite(bamEffect, bamX, bamY);

        // Add text to speech bubble
        const maxWidth = speechBubble.bitmap.width - 10;
        const textHeight = Jimp.measureTextHeight(font, prompt, maxWidth);
        const textY = bubbleY + (speechBubble.bitmap.height / 2) - (textHeight / 2);
        speechBubble.print(font, 10, textY, {
            text: prompt,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, maxWidth, textHeight);

        // Save the final image
        const outputName = `comic-${Date.now()}.png`;
        await image.writeAsync(outputName);

        // Send the final image back to the client
        res.sendFile(outputName, { root: __dirname });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

    // use DALL-E to generate the comic image
    const dalleResponse = await axios.post(dalleEndpoint, {
      text: comicText,
      api_key: dalleApiKey,
      prompt: dallePrompt,
      num_images: 1,
      size: "1024x1024",
    });

    const imageUrl = dalleResponse.data.data[0].url;

    // use canvas to draw the image and speech bubble
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      // draw speech bubble
      const speechBubble = new Image();
      speechBubble.src = "speech-bubble.png";
      speechBubble.onload = () => {
        const x = 50;
        const y = 550;
        ctx.drawImage(speechBubble, x, y);

        // write text in speech bubble
        const text = comicText;
        const lines = breakLines(ctx, text, 28, 400);

        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "black";
        lines.forEach((line, i) => {
          ctx.fillText(line, x + 60, y + 40 + i * 30);
        });

        // apply comic effect
        applyComicEffect(canvas)
          .then((dataUrl) => {
            // send the response back
            res.json({ image: dataUrl });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "Something went wrong" });
          });
      };
    };
    img.onerror = () => {
      res.status(500).json({ error: "Failed to load image" });
    };
    img.src = imageUrl;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

function breakLines(context, text, maxWidth, lineHeight) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
    var word = words[i];
    var width = context.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function applyComicEffect(canvas) {
  return new Promise((resolve, reject) => {
    const image = canvas.toDataURL();

    const comicEffect = gm(image).out("-posterize", "3").out("-gamma", "0.5");

    comicEffect.toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(`data:image/png;base64,${buffer.toString("base64")}`);
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

     
