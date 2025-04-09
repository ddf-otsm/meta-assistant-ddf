# Claude Large File Processing Tools

This repository contains tools to help process large files with Claude when hitting API rate limits or token limits.

## Overview

When working with large files in Cursor with Claude, you may encounter API rate limits or token limits. These tools help split large files into manageable chunks and process them sequentially.

## Available Scripts

### 1. `split_large_file.py`

Splits a large file into smaller chunks that Claude can handle.

```bash
python3 split_large_file.py [chunk_size] [output_directory]
```

- `chunk_size`: Maximum size of each chunk in characters (default: 8000)
- `output_directory`: Directory to save chunks (default: 'chunks')

### 2. `cursor_process.sh`

Interactive helper for processing chunks through Cursor's Claude interface.

```bash
./cursor_process.sh [start_chunk]
```

- `start_chunk`: Which chunk to start from (default: 1)

This script:
- Copies each chunk to your clipboard
- Guides you through pasting into Cursor's Claude interface
- Waits for your confirmation before proceeding to the next chunk

### 3. `process_with_claude.py`

Processes chunks directly using Anthropic's API.

```bash
python3 process_with_claude.py [chunk_size]
```

Requires:
- Anthropic API key set as ANTHROPIC_API_KEY environment variable

### 4. `process_chunks.sh`

Bash script that calls Claude API for each chunk.

```bash
./process_chunks.sh
```

Requires:
- Anthropic API key set as ANTHROPIC_API_KEY environment variable
- `curl` installed

### 5. `combine_results.sh`

Combines all processed chunks into a single summary file.

```bash
./combine_results.sh
```

## Quick Start

1. Split your large file:
   ```bash
   python3 split_large_file.py 4000 prompt_chunks
   ```

2. Process through Cursor's Claude interface:
   ```bash
   ./cursor_process.sh
   ```

3. OR process with API (requires API key):
   ```bash
   export ANTHROPIC_API_KEY=your_api_key
   ./process_chunks.sh
   ```

4. Combine results (if using API method):
   ```bash
   ./combine_results.sh
   ```

## Tips for Using with Cursor

1. For interactive processing, use `cursor_process.sh` for convenient clipboard copying
2. If you get disconnected, you can resume from any chunk by specifying the start chunk number
3. Keep chunks smaller than 4000 characters for best results with Claude
4. Allow at least 3-5 seconds between API requests to avoid rate limiting

## Example Workflow

```bash
# 1. Split the file
python3 split_large_file.py 4000 prompt_chunks

# 2. Process manually with Cursor
./cursor_process.sh

# OR process via API
export ANTHROPIC_API_KEY=your_api_key
./process_chunks.sh

# 3. Combine API results if needed
./combine_results.sh
```

## Troubleshooting

- If you hit rate limits, increase the delay between chunks
- If chunks are too large, reduce the chunk size parameter
- If clipboard copying fails, ensure you have pbcopy (macOS) or xclip (Linux) installed 