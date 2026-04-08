#!/bin/bash

# Configuration
BASE_DIR="/Users/gryffindor/Desktop/antigra_conversation/bmad-vbl"
REPO_API_DIR="${BASE_DIR}/vlm-api-readonly"
REPO_GUI_DIR="${BASE_DIR}/vlm-gui-readonly"
REPOMIX_OUTPUT_DIR="${BASE_DIR}/vlm-testing/repomix-outputs"
LOG_DIR="${BASE_DIR}/vlm-testing/_bmad-output/logs"

# Ensure log and output directories exist
mkdir -p "$LOG_DIR"
mkdir -p "$REPOMIX_OUTPUT_DIR"
LOG_FILE="${LOG_DIR}/sync-$(date +%Y%m%d).log"

echo "-----------------------------------" >> "$LOG_FILE"
echo "[$(date)] Starting Sync & Analyze Pipeline..." >> "$LOG_FILE"

sync_repo() {
    local dir=$1
    local name=$2
    local output_file=$3
    
    echo "[$(date)] Updating $name..." >> "$LOG_FILE"
    if [ -d "$dir" ]; then
        cd "$dir" || return
        # Hard reset to origin to ensure we match remotes exactly (readonly mode)
        git fetch --all >> "$LOG_FILE" 2>&1
        BRANCH=$(git rev-parse --abbrev-ref HEAD)
        git reset --hard "origin/$BRANCH" >> "$LOG_FILE" 2>&1
        echo "[$(date)] $name updated successfully." >> "$LOG_FILE"
        
        # Run Repomix analysis
        echo "[$(date)] Running Repomix for $name..." >> "$LOG_FILE"
        npx --yes repomix . --output "$output_file" --style xml >> "$LOG_FILE" 2>&1
        echo "[$(date)] Repomix analysis for $name complete." >> "$LOG_FILE"
    else
        echo "[ERROR] Directory $dir not found!" >> "$LOG_FILE"
    fi
}

sync_repo "$REPO_API_DIR" "VLM API" "${REPOMIX_OUTPUT_DIR}/vlm-api-packed.xml"
sync_repo "$REPO_GUI_DIR" "VLM GUI" "${REPOMIX_OUTPUT_DIR}/vlm-gui-packed.xml"

echo "[$(date)] Pipeline Complete." >> "$LOG_FILE"
echo "-----------------------------------" >> "$LOG_FILE"
