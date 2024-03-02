import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import nodeHtmlToImage from 'node-html-to-image';
// import font2base64 from 'node-font2base64';

const url = 'https://lite.cnn.com/'

chromium.setHeadlessMode = true
chromium.setGraphicsMode = false

export async function handler(event, context) {
  try {
    const { days = 0 } = event.queryStringParameters;

    const image = await nodeHtmlToImage({
      html: `
      <html>
          <style>
              body {
                  width: 1600px;
                  height: 800px;
                  font-size: 800px;
                  line-height: 800px;
                  font-weight: bold;
                  text-align: center;
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

    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({ blob }),
    // }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    }
  }
}