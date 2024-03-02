import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import nodeHtmlToImage from 'node-html-to-image';

chromium.setHeadlessMode = true
chromium.setGraphicsMode = false

export async function handler(event, context) {
  try {
    const { days = 0 } = event.queryStringParameters;

    const image = await nodeHtmlToImage({
      html: `
      <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
          </head>
          <style>
              body {
                  width: 1600px;
                  height: 800px;
                  font-size: 900px;
                  line-height: 800px;
                  font-weight: 900;
                  text-align: center;
                  font-family: "DM Sans", sans-serif;
              }

              div {
                  background: url("https://ios-widgets.vercel.app/static/images/tiger_pattern.png"), linear-gradient(45deg, #fb7324, #f7b733);
                  background-repeat: no-repeat;
                  background-size: cover;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
              }
          </style>
          <body>
              <div>{{days}}</div>
          </body>
      </html>
      `,
      type: 'png',
      transparent: true,
      content: { days },
      puppeteer,
      puppeteerArgs: {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath('/var/task/node_modules/@sparticuz/chromium/bin')),
        headless: true,
      }
    })

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
      },
      body: image.toString("base64"),
      isBase64Encoded: true,
    };

  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    }
  }
}