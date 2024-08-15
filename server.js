const express = require('express');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core to specify custom Chromium path
const { executablePath } = require('puppeteer'); // This will provide the path to the Chromium installed by Puppeteer
require('dotenv').config();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));  // Serve static files from the "public" directory

app.post('/extract-cookies', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const browser = await puppeteer.launch({ 
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
              ],
              executablePath:
                process.env.NODE_ENV === "production"
                  ? process.env.PUPPETEER_EXECUTABLE_PATH
                  : puppeteer.executablePath(),
        });

        const page = await browser.newPage();
        await page.goto('https://www.linkedin.com/login');
        await page.type('#username', email);
        await page.type('#password', password);
        await page.click('button[aria-label="Sign in"]');
        await page.waitForNavigation();

        const cookies = await page.cookies();
        await browser.close();

        res.json({ cookies });

    } catch (error) {
        console.error('Error extracting cookies:', error);
        res.status(500).json({ error: 'Failed to extract cookies' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
