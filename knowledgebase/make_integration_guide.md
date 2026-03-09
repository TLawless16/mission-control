# Make.com Integration Guide for Mission Control

Since Make.com frequently updates its user interface, here is the most accurate, step-by-step guide to connecting your Mission Control **Content Pipeline** to Make.com so that "Scheduled" or "Published" posts are automatically posted to LinkedIn or WordPress.

---

## 🛑 Step 1: Create the Webhook Listener

1. Log into Make.com and create a **New Scenario** using the streamlined sidebar menu (updated in the late 2025/2026 UI refresh).
2. Click the large purple **(+)** in the center of the canvas to add the first module.
3. Search for **"Webhooks"** and click on it.
4. Select the trigger called **"Custom webhook"**.
5. Click **Add** under the Webhook dropdown to create a new webhook. Name it "Mission Control Content Hook" and click **Save**.
6. Make.com will generate a unique Webhook URL (e.g., `https://hook.us1.make.com/...`). 
7. **Copy address to clipboard** and click **OK**.
8. Go to your local environment, open the `.env` file in the root of the Mission Control folder, and paste that URL:
   `MAKE_CONTENT_WEBHOOK_URL="https://hook.us1.make.com/..."`

---

## 📡 Step 2: Determine Data Structure (Crucial!)

Before you do anything else in Make:
1. Make sure your Make webhook is actively listening (click "Run once" in the bottom left if it isn't).
2. Open your terminal in VS Code and run: `npx tsx scripts/test_make_webhook.ts`
3. Go back to Make.com. You should see a green bubble `1` pop up above the Webhook module. You successfully caught the data! **This step is critical because now Make knows exactly what your data looks like.**

The data structure it just learned looks like this:
- `event` = "content_status_updated"
- `new_status` = "scheduled" 
- `content_item` -> `title`, `body`, `platform`

---

## 🚦 Step 3: Add a Router

1. In the new Make.com UI, you can add a router by clicking the **(+) Add another module** button, searching for **"Flow Control"**, and selecting **"Router"**. Alternatively, you can right-click on the canvas to add a router.
2. Connect the Router to your Webhook module. 
3. Click the Router so it spawns two empty circles (routes).

---

## 👔 Step 4: Setup the LinkedIn Route (Path 1)

1. Click on the top empty circle connected to the Router.
2. Search for **"LinkedIn"** and select it.
3. Choose the action **"Create an Organization Post"** or **"Create a Post"** (depending on if you post to a company page or personal profile).
4. Connect your LinkedIn account by clicking **Add**.
5. In the module settings, map the fields:
   - *Text content*: Click into this field, and a menu will pop up showing the data from your Webhook. Click `content_item` -> `body`.
   - Click **OK**.
6. **Set up the Filter:** Click the dotted line (the wrench icon) *between* the Router and the LinkedIn module. 
   - Label: "Is LinkedIn"
   - Condition: Click `content_item` -> `platform`. 
   - Operator: Select "Equal to"
   - Value: Type exactly `linkedin`

---

## 📝 Step 5: Setup the WordPress Route (Path 2)

1. Click on the bottom empty circle connected to the Router.
2. Search for **"WordPress"** and select it.
3. Choose the action **"Create a Post"**.
4. Connect your WordPress site (you may need the WP Application Password we are going to generate in the next task).
5. In the module settings, map the fields:
   - *Title*: Map to `content_item` -> `title`.
   - *Content*: Map to `content_item` -> `body`.
   - *Status*: Type exactly `publish` (or `draft` if you prefer).
   - Click **OK**.
6. **Set up the Filter:** Click the dotted line *between* the Router and the WordPress module. 
   - Label: "Is WordPress"
   - Condition: Click `content_item` -> `platform`. 
   - Operator: Select "Equal to"
   - Value: Type exactly `wordpress`

---

## 🚀 Step 6: Turn it On!

1. In the bottom left corner, toggle the **"ON"** switch.
2. You are done! Now, whenever you or Jarvis moves an item to "Scheduled" or "Published" in Mission Control, Make.com will perfectly route the AI-written content completely hands-free.
