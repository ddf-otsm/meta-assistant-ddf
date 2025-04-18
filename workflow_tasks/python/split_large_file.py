import os
import sys
from pathlib import Path

# File path
file_path = "/Users/luismartins/cursor_local_repos/meta-assistant-ddf/.tmp/current_prompt"

def split_file_into_chunks(file_path, chunk_size=8000, output_dir='chunks'):
    """Split a file into smaller chunks and save them as separate files"""
    
    # Check if file exists
    if not Path(file_path).exists():
        print(f"Error: File not found at {file_path}")
        return
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Read the file
    print(f"Loading file: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    
    # Split into paragraphs first
    paragraphs = text.split("\n\n")
    
    # Now combine paragraphs into chunks
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        # If adding this paragraph would exceed max size, save current chunk and start new one
        if len(current_chunk) + len(paragraph) + 2 > chunk_size:
            chunks.append(current_chunk)
            current_chunk = paragraph
        else:
            if current_chunk:
                current_chunk += "\n\n" + paragraph
            else:
                current_chunk = paragraph
    
    # Don't forget the last chunk
    if current_chunk:
        chunks.append(current_chunk)
    
    print(f"Split text into {len(chunks)} chunks")
    
    # Save each chunk to a file
    for i, chunk in enumerate(chunks):
        output_file = os.path.join(output_dir, f"chunk_{i+1}.txt")
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(chunk)
        print(f"Saved chunk {i+1}/{len(chunks)} to {output_file}")
    
    # Create a manifest file
    manifest_file = os.path.join(output_dir, "manifest.txt")
    with open(manifest_file, 'w', encoding='utf-8') as f:
        f.write(f"Original file: {file_path}\n")
        f.write(f"Number of chunks: {len(chunks)}\n")
        f.write(f"Chunk size limit: {chunk_size} characters\n\n")
        
        for i in range(len(chunks)):
            f.write(f"Chunk {i+1}: chunk_{i+1}.txt\n")
    
    print(f"\nAll chunks saved to directory: {output_dir}")
    print(f"Manifest file created: {manifest_file}")
    
    return os.path.abspath(output_dir)

if __name__ == "__main__":
    # Get custom chunk size from command line if provided
    chunk_size = 8000
    output_dir = 'chunks'
    
    if len(sys.argv) > 1:
        try:
            chunk_size = int(sys.argv[1])
        except ValueError:
            pass
    
    if len(sys.argv) > 2:
        output_dir = sys.argv[2]
    
    output_path = split_file_into_chunks(file_path, chunk_size=chunk_size, output_dir=output_dir)
    
    print(f"\nTo process chunks manually, run:\n")
    print(f"1. cd {output_path}")
    print(f"2. For each chunk file:")
    print(f"   cat chunk_X.txt | pbcopy  # Copy to clipboard")
    print(f"   Then paste into Cursor/Claude interface") 