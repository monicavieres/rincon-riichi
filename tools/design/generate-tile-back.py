"""Rincón tile back: same frame as the FluffyStuff composite tiles (96x128).
Idea: 'rincón' = corner. Four gold quarter-circles fill the corners and frame a
cream compass star (the four winds) on a carmine back."""
import sys

OUT = sys.argv[1]

svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128" role="img" aria-label="Reverso de ficha Rincón Riichi">
  <defs>
    <linearGradient id="back" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#ef5f93"/>
      <stop offset="1" stop-color="#cf3a72"/>
    </linearGradient>
    <clipPath id="face"><rect x="10" y="7" width="76" height="105" rx="7"/></clipPath>
    <filter id="shadow" x="-18%" y="-18%" width="136%" height="146%">
      <feDropShadow dx="0" dy="3" stdDeviation="1.4" flood-color="#4b3a2d" flood-opacity=".28"/>
    </filter>
  </defs>
  <!-- cream body layer showing under the coloured back, like a real two-layer tile -->
  <rect x="10" y="7" width="76" height="113" rx="7" fill="#f3e6cf" stroke="#171513" stroke-width="3.4"/>
  <path d="M17 112h62l-6 8H23z" fill="#c9b48f" opacity=".7"/>
  <rect x="10" y="7" width="76" height="105" rx="7" fill="url(#back)" filter="url(#shadow)"/>
  <g clip-path="url(#face)">
    <!-- corners: the rincón -->
    <g fill="#f6c143" stroke="#171513" stroke-width="2">
      <circle cx="10" cy="7" r="17"/>
      <circle cx="86" cy="7" r="17"/>
      <circle cx="10" cy="112" r="17"/>
      <circle cx="86" cy="112" r="17"/>
    </g>
    <g fill="none" stroke="#fff3d6" stroke-width="1.6" opacity=".9">
      <circle cx="10" cy="7" r="11"/>
      <circle cx="86" cy="7" r="11"/>
      <circle cx="10" cy="112" r="11"/>
      <circle cx="86" cy="112" r="11"/>
    </g>
    <!-- soft dot lattice on the back -->
    <g fill="#ffffff" opacity=".18">
      <circle cx="30" cy="34" r="1.6"/><circle cx="48" cy="26" r="1.6"/><circle cx="66" cy="34" r="1.6"/>
      <circle cx="30" cy="85" r="1.6"/><circle cx="48" cy="93" r="1.6"/><circle cx="66" cy="85" r="1.6"/>
      <circle cx="22" cy="59.5" r="1.6"/><circle cx="74" cy="59.5" r="1.6"/>
    </g>
    <!-- compass star: the four winds -->
    <g transform="translate(48 59.5)">
      <circle r="21" fill="#7b4fe0" stroke="#171513" stroke-width="2"/>
      <path d="M0-19 L5-5 L19 0 L5 5 L0 19 L-5 5 L-19 0 L-5-5Z" fill="#fff8ea" stroke="#171513" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M0-19 L5-5 L0 0Z M19 0 L5 5 L0 0Z M0 19 L-5 5 L0 0Z M-19 0 L-5-5 L0 0Z" fill="#e8d9bd"/>
      <circle r="3.4" fill="#22a565" stroke="#171513" stroke-width="1.4"/>
    </g>
  </g>
  <rect x="10" y="7" width="76" height="105" rx="7" fill="none" stroke="#171513" stroke-width="3.4"/>
  <path d="M15 12h66" stroke="#ffffff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
</svg>
'''
open(OUT, 'w').write(svg)
