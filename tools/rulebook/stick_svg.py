"""The point sticks, drawn once for the guides: same size for every value, only the colour and the dots change."""
INK = "#23203f"
L, W = 150, 28
def _grid(us, vs):
    return [(u, v) for v in vs for u in us]
LOOK = {
    10000: ("#e85a52", "#b0302c", "#ffffff", 2.1, [(0.5, 0.5), (0.34, 0.5), (0.42, 0.5), (0.58, 0.5), (0.66, 0.5), (0.45, 0.3), (0.55, 0.3), (0.45, 0.7), (0.55, 0.7)]),
    5000: ("#f6c340", "#c98c14", "#d9331f", 2.4, [(0.46, 0.3), (0.54, 0.3), (0.5, 0.5), (0.46, 0.7), (0.54, 0.7)]),
    1000: ("#4a78e8", "#2447a5", "#ffffff", 3.2, [(0.5, 0.5)]),
    500: ("#2fae86", "#1c7a5c", "#ffffff", 1.9, _grid([0.4, 0.47, 0.54, 0.61], [0.32, 0.68])),
    100: ("#fffdf6", "#cfcbbf", INK, 1.9, _grid([0.4, 0.47, 0.54, 0.61], [0.32, 0.68])),
}
_count = [0]
def stick(value, scale=0.55):
    top, side, col, r, dots = LOOK[value]
    _count[0] += 1
    gid = f"stk{_count[0]}"
    circles = "".join(f'<circle cx="{1.5 + L*u:.1f}" cy="{1.5 + W*v:.1f}" r="{r}" fill="{col}"/>' for u, v in dots)
    w = 130 * scale
    return (f'<svg class="stick" viewBox="0 0 {L+3} {W+3}" width="{w:.0f}" height="{w*(W+3)/(L+3):.0f}"><defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset=".62" stop-color="{top}"/><stop offset="1" stop-color="{side}"/></linearGradient></defs>'
            f'<rect x="1.5" y="1.5" width="{L}" height="{W}" rx="{W/2.8:.1f}" fill="url(#{gid})" stroke="{INK}" stroke-width="3"/>'
            f'<rect x="7" y="5" width="{L-12}" height="2.6" rx="1.3" fill="#fff" opacity=".4"/>{circles}</svg>')
