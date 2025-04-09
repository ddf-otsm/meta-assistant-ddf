#!/bin/bash

# Check if ANTHROPIC_API_KEY is set
if [ -z "${ANTHROPIC_API_KEY}" ]; then
  echo "Error: ANTHROPIC_API_KEY environment variable not set."
  echo "Please set it using: export ANTHROPIC_API_KEY=your-api-key"
  exit 1
fi

# Check if the chunks directory exists
CHUNKS_DIR="prompt_chunks"
if [ ! -d "$CHUNKS_DIR" ]; then
  echo "Error: Directory $CHUNKS_DIR not found."
  echo "Please run split_large_file.py first."
  exit 1
fi

# Count the number of chunks
NUM_CHUNKS=$(find "$CHUNKS_DIR" -name "chunk_*.txt" | wc -l)
echo "Found $NUM_CHUNKS chunks to process in $CHUNKS_DIR"

# Check for curl
if ! command -v curl &> /dev/null; then
  echo "Error: curl command not found. Please install curl to continue."
  exit 1
fi

# Create output directory
RESULTS_DIR="claude_results"
mkdir -p "$RESULTS_DIR"

# Function to process a chunk with Claude API
process_chunk() {
  CHUNK_FILE="$1"
  CHUNK_NUM="$2"
  RESULT_FILE="$RESULTS_DIR/result_$CHUNK_NUM.json"
  
  echo "Processing $CHUNK_FILE..."
  
  # Read chunk content
  CHUNK_CONTENT=$(cat "$CHUNK_FILE")
  
  # Call Claude API
  curl -s https://api.anthropic.com/v1/messages \
    -H "Content-Type: application/json" \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "{
      \"model\": \"claude-3-sonnet-20240229\",
      \"max_tokens\": 1000,
      \"temperature\": 0,
      \"system\": \"You are a helpful assistant analyzing a portion of code or text.\",
      \"messages\": [
        {
          \"role\": \"user\",
          \"content\": \"Please analyze this text content and provide insights:\\n\\n$CHUNK_CONTENT\\n\\nWhat are the key points or issues in this section?\"
        }
      ]
    }" > "$RESULT_FILE"
  
  # Extract the text from the response
  TEXT_RESPONSE=$(cat "$RESULT_FILE" | grep -o '"content":\[{.*' | sed 's/"content":\[{"type":"text","text":"\(.*\)"}\]/\1/')
  
  # Save just the text response to a readable file
  READABLE_FILE="$RESULTS_DIR/result_$CHUNK_NUM.txt"
  echo "CHUNK $CHUNK_NUM ANALYSIS:" > "$READABLE_FILE"
  echo "" >> "$READABLE_FILE"
  echo "$TEXT_RESPONSE" | sed 's/\\n/\n/g' | sed 's/\\"/"/g' >> "$READABLE_FILE"
  
  echo "Saved result to $READABLE_FILE"
  echo "Waiting 3 seconds before next request..."
  sleep 3
}

# Process each chunk
for i in $(seq 1 $NUM_CHUNKS); do
  CHUNK_FILE="$CHUNKS_DIR/chunk_$i.txt"
  if [ -f "$CHUNK_FILE" ]; then
    process_chunk "$CHUNK_FILE" "$i"
  else
    echo "Warning: Chunk file $CHUNK_FILE not found."
  fi
done

echo ""
echo "All chunks processed. Results saved to $RESULTS_DIR"
echo "To view a summary of all results, run:"
echo "cat $RESULTS_DIR/result_*.txt > all_results.txt" 