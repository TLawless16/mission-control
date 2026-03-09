import 'dotenv/config';

async function testWebhook() {
    const webhookUrl = process.env.MAKE_CONTENT_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error("❌ ERROR: MAKE_CONTENT_WEBHOOK_URL is not set in your .env file.");
        console.error("Please add it first: MAKE_CONTENT_WEBHOOK_URL=\"https://hook.us1.make.com/...\"");
        process.exit(1);
    }

    console.log(`📡 Sending test payload to Make.com Webhook: ${webhookUrl}...`);

    const mockItem = {
        id: "test-12345",
        title: "Test Post from Mission Control",
        body: "This is a test post automatically generated to verify the Make.com webhook integration is working flawlessly.",
        platform: "linkedin", // Change this to "wordpress" to test the WordPress route
        content_type: "post",
        status: "scheduled"
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'content_status_updated',
                new_status: 'scheduled',
                content_item: mockItem
            })
        });

        if (response.ok) {
            console.log("✅ SUCCESS! Payload accepted by Make.com.");
            console.log("👉 Go check your Make.com scenario to see if it ran correctly!");
        } else {
            console.log(`⚠️ WARNING: Make.com returned status ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log(`Response body: ${text}`);
        }
    } catch (e) {
        console.error("❌ FAILED to connect to Make.com. Error:", e);
    }
}

testWebhook();
