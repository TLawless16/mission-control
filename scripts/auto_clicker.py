import time
import pyautogui
import cv2
import numpy as np
import os

# Configuration
# Place small screenshots of the buttons you want to click in a 'targets' folder
# For example: targets/run_command.png, targets/continue.png
TARGET_DIR = "targets"
CONFIDENCE_THRESHOLD = 0.8
CHECK_INTERVAL_SECONDS = 2

def get_target_images():
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)
        print(f"Created directory directly: {TARGET_DIR}. Please add button screenshots here.")
        return []
    
    images = []
    for filename in os.listdir(TARGET_DIR):
        if filename.endswith(".png") or filename.endswith(".jpg"):
            path = os.path.join(TARGET_DIR, filename)
            # Read image in grayscale for simple matching
            img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
            if img is not None:
                images.append({"name": filename, "img": img})
    return images

def find_and_click(targets):
    # Take screenshot
    screenshot = pyautogui.screenshot()
    screen_img = cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2GRAY)

    for target in targets:
        result = cv2.matchTemplate(screen_img, target["img"], cv2.TM_CCOEFF_NORMED)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

        if max_val >= CONFIDENCE_THRESHOLD:
            # Calculate center of the matched region
            h, w = target["img"].shape
            center_x = max_loc[0] + w // 2
            center_y = max_loc[1] + h // 2

            print(f"[{time.strftime('%H:%M:%S')}] Found {target['name']}! Clicking at ({center_x}, {center_y})")
            
            # Move and click
            pyautogui.moveTo(center_x, center_y, duration=0.2)
            pyautogui.click()
            
            # Wait a moment after clicking so we don't double click
            time.sleep(1)

def main():
    print("Starting Auto-Clicker...")
    print(f"Scanning every {CHECK_INTERVAL_SECONDS} seconds. Press Ctrl+C to stop.")
    
    while True:
        targets = get_target_images()
        if targets:
            find_and_click(targets)
        time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nAuto-Clicker stopped.")
