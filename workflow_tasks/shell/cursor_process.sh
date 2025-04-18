#!/bin/bash

# Cursor process script for breaking large files into manageable chunks
# for Claude to process through the Cursor interface

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if macOS pbcopy is available
if ! command -v pbcopy &> /dev/null && ! command -v xclip &> /dev/null; then
  echo -e "${RED}Error: Neither pbcopy (macOS) nor xclip (Linux) found.${NC}"
  echo "Please install one of these clipboard utilities to continue."
  exit 1
fi

# Define clipboard function depending on OS
copy_to_clipboard() {
  if command -v pbcopy &> /dev/null; then
    pbcopy
  else
    xclip -selection clipboard
  fi
}

# Check if chunks directory exists
CHUNKS_DIR="prompt_chunks"
if [ ! -d "$CHUNKS_DIR" ]; then
  echo -e "${RED}Error: Directory $CHUNKS_DIR not found.${NC}"
  echo "Please run split_large_file.py first to generate chunks."
  exit 1
fi

# Count chunks
NUM_CHUNKS=$(find "$CHUNKS_DIR" -name "chunk_*.txt" | wc -l)
echo -e "${GREEN}Found $NUM_CHUNKS chunks in $CHUNKS_DIR${NC}"

# Process command line arguments
START_CHUNK=1
if [ "$1" ]; then
  START_CHUNK=$1
fi

if [ $START_CHUNK -gt $NUM_CHUNKS ]; then
  echo -e "${RED}Error: Start chunk number ($START_CHUNK) exceeds total chunks ($NUM_CHUNKS).${NC}"
  exit 1
fi

echo -e "${CYAN}Cursor-Claude Processing Assistant${NC}"
echo -e "${YELLOW}This script will help you process large files chunk by chunk with Claude in Cursor.${NC}"
echo ""
echo -e "Starting from chunk $START_CHUNK of $NUM_CHUNKS"
echo ""
echo -e "${CYAN}Instructions:${NC}"
echo "1. For each chunk, this script will copy its content to your clipboard"
echo "2. Paste the chunk into Cursor's Claude chat interface"
echo "3. After Claude processes each chunk, press any key to continue to the next chunk"
echo ""
echo -e "${YELLOW}Press any key to begin...${NC}"
read -n 1 -s

# Process each chunk
for i in $(seq $START_CHUNK $NUM_CHUNKS); do
  CHUNK_FILE="$CHUNKS_DIR/chunk_$i.txt"
  if [ -f "$CHUNK_FILE" ]; then
    echo ""
    echo -e "${GREEN}=== Processing Chunk $i/$NUM_CHUNKS ===${NC}"
    echo ""
    
    # Display chunk info
    CHUNK_SIZE=$(wc -c < "$CHUNK_FILE")
    CHUNK_LINES=$(wc -l < "$CHUNK_FILE")
    echo -e "${CYAN}Chunk size:${NC} $CHUNK_SIZE characters, $CHUNK_LINES lines"
    
    # Show snippet
    echo -e "${CYAN}Snippet:${NC}"
    head -n 3 "$CHUNK_FILE"
    echo "..."
    
    # Copy to clipboard
    cat "$CHUNK_FILE" | copy_to_clipboard
    echo ""
    echo -e "${GREEN}Chunk $i copied to clipboard!${NC}"
    echo -e "${YELLOW}Paste it into Cursor's Claude chat interface now.${NC}"
    
    if [ $i -lt $NUM_CHUNKS ]; then
      echo ""
      echo -e "${YELLOW}After Claude processes this chunk, press any key to continue to the next chunk...${NC}"
      read -n 1 -s
    fi
  else
    echo -e "${RED}Warning: Chunk file $CHUNK_FILE not found.${NC}"
  fi
done

echo ""
echo -e "${GREEN}All chunks processed!${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "1. Review Claude's responses in Cursor"
echo "2. You can resume from a specific chunk by running: ./cursor_process.sh [chunk_number]"
echo "" 