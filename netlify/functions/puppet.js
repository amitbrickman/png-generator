import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import nodeHtmlToImage from 'node-html-to-image';

chromium.setHeadlessMode = true
chromium.setGraphicsMode = false

export async function handler(event, context) {
  try {
    const { days = 0, textColor = 'white' } = event.queryStringParameters;

    const image = await nodeHtmlToImage({
      html: `
      <html>
        <style>
            @font-face {
              font-family: "San Francisco";
              src: url("https://applesocial.s3.amazonaws.com/assets/styles/fonts/sanfrancisco/sanfranciscodisplay-heavy-webfont.woff");
            }

            body {
                width: 1600px;
                height: 800px;
                font-size: 880px;
                line-height: 800px;
                font-family: "San Francisco";
                font-weight: 800;
                text-align: center;
            }

            div {
                background: url("https://ios-widgets.vercel.app/static/images/tiger_pattern.png"), ${textColor};
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

{/* <head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,900;1,9..40,900&display=swap" rel="stylesheet">
</head>

font-family: "DM Sans", sans-serif; */}