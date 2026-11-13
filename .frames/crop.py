"""Re-frames one cell of a render.ts contact sheet as a square, hip-centred SVG.

Usage: crop.py sheet.svg cell out.svg [line]
With `line`, draws the heel-to-hands line and marks the hip.
"""
import re
import sys
from pathlib import Path

src, cell, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
draw_line = len(sys.argv) > 4
groups = re.findall(r'<g transform="[^"]*">(.*?)</g>', Path(src).read_text(), re.S)
inner = groups[cell]
inner = re.sub(r'<text[^>]*>.*?</text>', '', inner)
lines = [tuple(map(float, m)) for m in re.findall(
    r'<line x1="([-\d.e]+)" y1="([-\d.e]+)" x2="([-\d.e]+)" y2="([-\d.e]+)" stroke="#000"', inner)]
hip = lines[0][:2]
GROUND = 588.5
size = 420
x0, y0 = hip[0] - 190, GROUND - size + 50
extra = ''
if draw_line:
    heel = lines[1][2:]
    hands = ((lines[8][2] + lines[10][2]) / 2, (lines[8][3] + lines[10][3]) / 2)
    dx, dy = hands[0] - heel[0], hands[1] - heel[1]
    extra = (
        f'<line x1="{heel[0] - dx * 0.1}" y1="{heel[1] - dy * 0.1}" x2="{hands[0] + dx * 0.1}" y2="{hands[1] + dy * 0.1}" '
        f'stroke="#e33" stroke-width="2" stroke-dasharray="6 5"/>'
        f'<circle cx="{hip[0]}" cy="{hip[1]}" r="5" fill="#e33"/>'
    )
Path(out).write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" width="840" height="840" viewBox="{x0} {y0} {size} {size}">'
    f'<rect x="{x0}" y="{y0}" width="{size}" height="{size}" fill="#fff"/>{inner}{extra}</svg>'
)
