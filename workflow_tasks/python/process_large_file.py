import os
import sys
from pathlib import Path

# Check if required packages are installed
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_anthropic import ChatAnthropic
    from langchain.prompts import ChatPromptTemplate
    from langchain.chains import LLMChain
except ImportError:
    print("Required packages not found. Installing them...")
    os.system("pip install langchain langchain_anthropic anthropic tiktoken")
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_anthropic import ChatAnthropic
    from langchain.prompts import ChatPromptTemplate
    from langchain.chains import LLMChain

# File path
file_path = "/Users/luismartins/cursor_local_repos/meta-assistant-ddf/.tmp/current_prompt"

def process_file_with_langchain(file_path, chunk_size=4000, chunk_overlap=200):
    """Process a large file using LangChain's text splitter"""
    
    # Check if file exists
    if not Path(file_path).exists():
        print(f"Error: File not found at {file_path}")
        return
    
    # Load file content
    print(f"Loading file: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    
    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    
    # Split text into chunks
    chunks = text_splitter.split_text(text)
    print(f"Split text into {len(chunks)} chunks")
    
    # Configure the LLM
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        print("Please set your API key with: export ANTHROPIC_API_KEY='your-key'")
        return
    
    llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
    
    # Create prompt template
    prompt = ChatPromptTemplate.from_template(
        """You are a helpful assistant analyzing a portion of code or text.
        
        Please analyze this text content and provide insights:
        
        {text_chunk}
        
        What are the key points or issues in this section?"""
    )
    
    # Create chain
    chain = LLMChain(llm=llm, prompt=prompt)
    
    # Process each chunk with appropriate rate limiting
    print("\nProcessing chunks with Claude 3.7 Sonnet...\n")
    for i, chunk in enumerate(chunks):
        print(f"Processing chunk {i+1}/{len(chunks)}...")
        
        try:
            # Process the chunk
            result = chain.invoke({"text_chunk": chunk})
            
            # Save result to file
            output_file = f"chunk_analysis_{i+1}.txt"
            with open(output_file, 'w') as f:
                f.write(f"CHUNK {i+1} ANALYSIS:\n\n")
                f.write(result["text"])
            
            print(f"Saved analysis to {output_file}")
            
            # Add delay between requests to respect rate limits
            if i < len(chunks) - 1:
                import time
                print("Waiting 5 seconds before next request...")
                time.sleep(5)
                
        except Exception as e:
            print(f"Error processing chunk {i+1}: {str(e)}")
    
    print("\nAll chunks processed. Check the output files for analysis results.")

if __name__ == "__main__":
    # Get custom chunk size from command line if provided
    chunk_size = 4000
    if len(sys.argv) > 1:
        try:
            chunk_size = int(sys.argv[1])
        except ValueError:
            pass
    
    process_file_with_langchain(file_path, chunk_size=chunk_size)
    print("\nTo run with a different chunk size: python process_large_file.py <chunk_size>") 