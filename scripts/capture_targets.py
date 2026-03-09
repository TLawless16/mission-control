import cv2
import numpy as np
import pyautogui
import os

def main():
    if not os.path.exists("targets"):
        os.makedirs("targets")
        print("Created targets directory.")

    print("Scanning screen for the blue Accept button...")
    screen = pyautogui.screenshot()
    img = cv2.cvtColor(np.array(screen), cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Standard blue color range in HSV
    lower_blue = np.array([100, 100, 50])
    upper_blue = np.array([130, 255, 255])
    mask = cv2.inRange(hsv, lower_blue, upper_blue)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    found = False
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        # The Accept button is a rectangle. Aspect ratio and size checks:
        if 70 < w < 180 and 20 < h < 50:
            # Crop it tightly
            button = img[y:y+h, x:x+w]
            # Convert to grayscale to match the auto_clicker template format
            gray_button = cv2.cvtColor(button, cv2.COLOR_BGR2GRAY)
            cv2.imwrite("targets/accept.png", gray_button)
            print(f"SUCCESS: Captured and cropped 'Accept' button ({w}x{h} px). Saved to targets/accept.png.")
            found = True
            break

    if not found:
        print("FAILED: Could not find a distinct blue button on the screen. Please ensure the 'Accept all' button is visible and try again.")

if __name__ == "__main__":
    main()
