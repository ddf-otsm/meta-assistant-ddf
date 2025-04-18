import os
import time
import sys
from pathlib import Path

# Try to import Anthropic's SDK
try:
    import anthropic
except ImportError:
    print("Anthropic SDK not found. Installing it...")
    os.system("pip install anthropic")
    import anthropic

# File path
file_path = "/Users/luismartins/cursor_local_repos/meta-assistant-ddf/.tmp/current_prompt"

def split_text(text, max_chunk_size=8000):
    """Split text into chunks no larger than max_chunk_size"""
    # Basic approach: split by paragraphs, then combine until max size
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        # If adding this paragraph would exceed max size, save current chunk and start new one
        if len(current_chunk) + len(paragraph) + 2 > max_chunk_size:
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
    
    return chunks

def process_with_claude(file_path, chunk_size=8000):
    """Process a file in chunks using Claude API directly"""
    
    # Check if file exists
    if not Path(file_path).exists():
        print(f"Error: File not found at {file_path}")
        return
    
    # Check for API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        print("Please set your API key with: export ANTHROPIC_API_KEY='your-key'")
        return
    
    # Initialize the client
    client = anthropic.Anthropic(api_key=api_key)
    
    # Read the file
    print(f"Loading file: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    
    # Split into chunks
    chunks = split_text(text, max_chunk_size=chunk_size)
    print(f"Split text into {len(chunks)} chunks")
    
    # Process each chunk
    print("\nProcessing chunks with Claude...\n")
    for i, chunk in enumerate(chunks):
        print(f"Processing chunk {i+1}/{len(chunks)}...")
        
        try:
            # Call Claude API
            message = client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                temperature=0,
                system="You are a helpful assistant analyzing a portion of code or text.",
                messages=[
                    {
                        "role": "user", 
                        "content": f"""Please analyze this text content and provide insights:
                        
{chunk}

What are the key points or issues in this section?"""
                    }
                ]
            )
            
            # Save response to file
            output_file = f"chunk_analysis_{i+1}.txt"
            with open(output_file, 'w') as f:
                f.write(f"CHUNK {i+1} ANALYSIS:\n\n")
                f.write(message.content[0].text)
            
            print(f"Saved analysis to {output_file}")
            
            # Add delay between requests to respect rate limits
            if i < len(chunks) - 1:
                print("Waiting 3 seconds before next request...")
                time.sleep(3)
                
        except Exception as e:
            print(f"Error processing chunk {i+1}: {str(e)}")
    
    print("\nAll chunks processed. Check the output files for analysis results.")

if __name__ == "__main__":
    # Get custom chunk size from command line if provided
    chunk_size = 8000
    if len(sys.argv) > 1:
        try:
            chunk_size = int(sys.argv[1])
        except ValueError:
            pass
    
    process_with_claude(file_path, chunk_size=chunk_size)
    print("\nTo run with a different chunk size: python process_with_claude.py <chunk_size>") 