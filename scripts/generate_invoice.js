const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const clientName = args[0] || "Acme Corp";
const amount = args[1] || "$1,500.00";
const description = args[2] || "SMB Automation Platform - Monthly Retainer";

async function generateInvoice() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Read brand colors from brain.md (simplified here for demonstration)
    const primaryColor = "#a855f7"; // Purple from DNA

    const htmlContent = `
    <html>
      <body style="font-family: 'Inter', sans-serif; padding: 40px; color: #333;">
        <div style="border-top: 8px solid ${primaryColor}; padding-top: 20px;">
          <h1 style="color: ${primaryColor};">INVOICE</h1>
          <p><strong>To:</strong> ${clientName}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <br/>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f3f4f6; text-align: left;">
              <th style="padding: 10px;">Description</th>
              <th style="padding: 10px;">Amount</th>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${description}</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${amount}</td>
            </tr>
          </table>
          <h3 style="text-align: right; margin-top: 20px;">Total Due: ${amount}</h3>
        </div>
      </body>
    </html>
  `;

    await page.setContent(htmlContent);

    const dir = path.join(__dirname, '../public/invoices');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `Invoice_${clientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const filepath = path.join(dir, filename);

    await page.pdf({ path: filepath, format: 'A4' });
    await browser.close();

    console.log(`Successfully generated PDF invoice: ${filepath}`);
}

generateInvoice().catch(console.error);
