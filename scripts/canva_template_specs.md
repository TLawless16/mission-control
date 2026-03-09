# Canva Template Specifications for Kate Monroe

To ensure the Social Media Engine produces high-quality outputs, we must set up a specific "Autofill Template" inside Canva before activating the Make.com scenario.

## Template Dimensions
* **Format:** LinkedIn / Instagram Portrait (1080 x 1350 px)
* **Background:** High-quality image of Kate or a clean Deep Purple (`#a855f7`) to Hot Pink (`#ec4899`) gradient.

## Required Dynamic Variables (Text Elements)
When building the template in Canva, use the Canva bulk-create/API variable syntax for these specific text boxes. The Make.com scenario will inject data exactly into these fields:

1. **`{headline}`**
   * **Font:** Inter or Montserrat (Extra Bold)
   * **Size:** ~80pt
   * **Color:** White (`#FFFFFF`)
   * **Placement:** Centered, Top Third of the graphic.
   * **Behavior:** Anchor to the center so text expands evenly.

2. **`{brand_color}`** (Optional if using shape layers via advanced API)
   * The Make.com blueprint passes `#a855f7` to ensure any dynamic shapes match the VetComm/GravityClaw DNA.

## Static Overlays (Do Not Change)
* **Bottom Left:** VetComm or GravityClaw Logo (White PNG).
* **Bottom Right:** Kate's signature or handle (`@TheKateMonroe`).
