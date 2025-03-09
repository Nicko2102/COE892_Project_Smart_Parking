import os
import sys

import tkinter as tk
from tkinter import ttk
import sv_ttk
import pywinstyles
import darkdetect


root = tk.Tk(screenName="Book a Parking Spot", baseName="Booking")
w = 1080
h = 720
offx = 320
offy = 100
root.geometry(f"{w}x{h}+{offx}+{offy}")

btn = ttk.Button(root, text="HI")
btn.pack()





sv_ttk.set_theme(darkdetect.theme())
sv_ttk.set_theme("light")

def apply_theme_to_titlebar(root):
    version = sys.getwindowsversion()

    if version.major == 10 and version.build >= 22000:
        # Set the title bar color to the background color on Windows 11 for better appearance
        pywinstyles.change_header_color(root, "#1c1c1c" if sv_ttk.get_theme() == "dark" else "#fafafa")

# Example usage (replace `root` with the reference to your main/Toplevel window)
apply_theme_to_titlebar(root)
root.mainloop()
