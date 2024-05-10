import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import nodeHtmlToImage from 'node-html-to-image';

chromium.setHeadlessMode = true
chromium.setGraphicsMode = false

export async function handler(event, _) {
  try {
    const { days = 0, textColor = 'white', shadow = 'none', pattern = 'tiger' } = event.queryStringParameters;

    const dropShadow = {
      none: `none`,
      small: `0px 0px 35px rgba(0, 0, 0, 0.36)`,
      medium: `0px 0px 25px rgba(0, 0, 0, 0.65)`,
      large: `0px 0px 25px rgba(0, 0, 0, 0.85)`,
    }

    const colors = {
      gold: `radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 30%, #8A6E2F 40%, transparent 80%),
      radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%, #5d4a1f 62.5%, #5d4a1f 100%)`,
    }

    const selectedColor = colors[textColor] || textColor;
    const selectedShadow = dropShadow[shadow];
    const selectedPattern = `${pattern}_pattern.png`;

    console.log(`https://ios-widgets.vercel.app/static/images/${selectedPattern}`);

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
                background: url("https://ios-widgets.vercel.app/static/images/${selectedPattern}"), ${selectedColor};
                background-repeat: no-repeat;
                background-size: cover;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                filter: drop-shadow(${selectedShadow});
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
        args: ['--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-sandbox',
          '--no-zygote',
          '--single-process'
        ],
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