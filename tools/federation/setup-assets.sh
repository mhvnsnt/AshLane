#!/bin/bash
# AshLane Asset Federation Setup Script
# Downloads all CC0/MIT open-source assets for AshLane.
# Run: bash tools/federation/setup-assets.sh
#
# Licenses verified 2026-10-05. Re-verify if packs update.

set -e
ASSET_DIR="assets/federated"
mkdir -p "$ASSET_DIR"/{characters,environments,props,animations,weapons}

echo "=== AshLane Federated Assets Setup ==="
echo "This downloads ~500MB of CC0/MIT assets."
echo ""

# --- Quaternius (CC0) ---
# NOTE: itch.io gates downloads behind a click. Manual step:
echo "MANUAL STEP 1: Quaternius packs (CC0)"
echo "  Visit and download the FREE Standard zips:"
echo "  - https://quaternius.itch.io/universal-base-characters"
echo "  - https://quaternius.itch.io/universal-animation-library"
echo "  - https://quaternius.itch.io/universal-animation-library-2"
echo "  - https://quaternius.itch.io/downtown-city-megakit (Downtown City MegaKit)"
echo "  - https://quaternius.itch.io/fantasy-props-megakit (Fantasy Props MegaKit)"
echo "  - https://quaternius.itch.io/lowpoly-medieval-weapons (Medieval Weapons)"
echo "  Unzip into:"
echo "    $ASSET_DIR/characters/     <- Universal Base Characters"
echo "    $ASSET_DIR/animations/     <- Universal Animation Library 1+2"
echo "    $ASSET_DIR/environments/   <- Downtown City MegaKit"
echo "    $ASSET_DIR/props/          <- Fantasy Props MegaKit"
echo "    $ASSET_DIR/weapons/        <- Medieval Weapons Pack"
echo ""

# --- Kenney (CC0, direct zip) ---
echo "Downloading Kenney packs (CC0, direct)..."
# Kenney city/urban packs - direct download URLs from kenney.nl
# (Update these URLs from https://kenney.nl/assets as needed)
KENNEY_BASE="https://kenney.nl/media/pages/assets"
# Example: curl -L -o "$ASSET_DIR/environments/kenney_city.zip" "$KENNEY_BASE/city-kit-urban.zip"
echo "  (Kenney URLs change; grab from https://kenney.nl/assets)"
echo ""

# --- FreeMotionPack1 (author grant, GitHub) ---
echo "Downloading FreeMotionPack1 (21 FBX clips)..."
git clone --depth 1 https://github.com/J-Beardmore/FreeMotionPack1.git "$ASSET_DIR/animations/FreeMotionPack1" 2>/dev/null || echo "  Already exists or failed"

# --- qtmesheditor CC0 clips ---
echo "Downloading qtmesheditor CC0 clips..."
git clone --depth 1 https://github.com/fernandotonon/qtmesheditor.git /tmp/qtmesheditor 2>/dev/null || true
if [ -d /tmp/qtmesheditor ]; then
  cp -r /tmp/qtmesheditor/motions "$ASSET_DIR/animations/qtmesheditor-cc0" 2>/dev/null || echo "  (check /tmp/qtmesheditor for clip locations)"
fi

echo ""
echo "=== Done ==="
echo "See docs/FEDERATION.md for license records and integration status."
