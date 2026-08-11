import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

async function generatePDF() {
  console.log('Reading README.md...');
  let mdContent = fs.readFileSync('Docs/README.md', 'utf-8');
  
  // Resolve local image paths using base64 embedding
  const imagePath = path.resolve('Docs/Diagram.png');
  const imageBase64 = fs.readFileSync(imagePath, 'base64');
  mdContent = mdContent.replace(/\.\/Diagram\.png/g, `data:image/png;base64,${imageBase64}`);
  
  console.log('Converting to HTML...');
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; padding: 40px; color: #333; }
          h1, h2, h3 { color: #111; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
          code { font-family: 'Consolas', monospace; font-size: 0.9em; }
          p code { background: #f6f8fa; padding: 2px 4px; border-radius: 4px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #dfe2e5; padding: 6px 13px; text-align: left; }
          th { background-color: #f6f8fa; font-weight: 600; }
          tr:nth-child(2n) { background-color: #f6f8fa; }
          img { max-width: 100%; height: auto; }
          blockquote { border-left: 4px solid #dfe2e5; color: #6a737d; padding-left: 16px; margin-left: 0; }
        </style>
      </head>
      <body>
        ${marked(mdContent)}
      </body>
    </html>
  `;
  
  console.log('Launching puppeteer...');
  const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log('Setting content...');
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  console.log('Generating PDF...');
  await page.pdf({ 
      path: 'Docs/README.pdf', 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  });
  
  await browser.close();
  console.log('PDF generated successfully at Docs/README.pdf');
}

generatePDF().catch(console.error);
