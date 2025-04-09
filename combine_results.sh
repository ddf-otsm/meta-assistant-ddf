#!/bin/bash

# Check if the results directory exists
RESULTS_DIR="claude_results"
if [ ! -d "$RESULTS_DIR" ]; then
  echo "Error: Results directory $RESULTS_DIR not found."
  echo "Please run process_chunks.sh first to generate results."
  exit 1
fi

# Create a summary file
SUMMARY_FILE="prompt_analysis_summary.md"

# Add header
echo "# Prompt Analysis Summary" > "$SUMMARY_FILE"
echo "Generated on $(date)" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# Count result files
NUM_RESULTS=$(find "$RESULTS_DIR" -name "result_*.txt" | wc -l)
echo "Found $NUM_RESULTS result files to combine"

# Add TOC
echo "## Table of Contents" >> "$SUMMARY_FILE"
for i in $(seq 1 $NUM_RESULTS); do
  echo "- [Chunk $i Analysis](#chunk-$i-analysis)" >> "$SUMMARY_FILE"
done
echo "" >> "$SUMMARY_FILE"

# Combine result files in order
for i in $(seq 1 $NUM_RESULTS); do
  RESULT_FILE="$RESULTS_DIR/result_$i.txt"
  if [ -f "$RESULT_FILE" ]; then
    echo "## Chunk $i Analysis" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
    tail -n +3 "$RESULT_FILE" >> "$SUMMARY_FILE"  # Skip the "CHUNK X ANALYSIS:" header
    echo "" >> "$SUMMARY_FILE"
    echo "---" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
    echo "Added content from $RESULT_FILE"
  else
    echo "Warning: Result file $RESULT_FILE not found."
  fi
done

echo ""
echo "All results combined into $SUMMARY_FILE"
echo "You can view the summary with:"
echo "  less $SUMMARY_FILE"
echo "  or open it in a Markdown viewer" 