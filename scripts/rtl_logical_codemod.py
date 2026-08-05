#!/usr/bin/env python3
"""Convert physical Tailwind margin/padding/text-align utilities to logical
ones in client .tsx files so they auto-flip under dir="rtl".

Safe by construction: in LTR (English) ms/me/ps/pe/text-start/text-end render
identically to ml/mr/pl/pr/text-left/text-right, so English is visually
unchanged; only Arabic (dir=rtl) flips, which is the intended behavior.

Only the margin/padding/text-align family is converted — the utilities that
almost never carry an intentional physical direction. Positioning (left-/
right-/inset), borders, and rounding are left alone (higher chance of a
deliberately-fixed side) for a later visual pass.
"""
import re, sys, glob, os

MAP = {"ml": "ms", "mr": "me", "pl": "ps", "pr": "pe"}

# boundary char before the utility: whitespace, quote, brace/paren, variant
# colon, or a hyphen (negative margin / variant separator). Re-emitted verbatim.
SPACING = re.compile(r"([\s\"'`{(\-:])(ml|mr|pl|pr)(-(?:\d|px|auto|\[))")
TEXTALN = re.compile(r"\btext-(left|right)\b")
TEXTMAP = {"left": "start", "right": "end"}

files = glob.glob("client/src/**/*.tsx", recursive=True)
changed = 0
total_sub = 0
for f in files:
    src = open(f).read()
    def sp(m):
        return m.group(1) + MAP[m.group(2)] + m.group(3)
    new, n1 = SPACING.subn(sp, src)
    new, n2 = TEXTALN.subn(lambda m: "text-" + TEXTMAP[m.group(1)], new)
    if n1 + n2:
        open(f, "w").write(new)
        changed += 1
        total_sub += n1 + n2
print(f"files changed: {changed}, substitutions: {total_sub}")
