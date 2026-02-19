"""
Hugging Face Spaces Entry Point
This file serves as the entry point for the Hugging Face Space deployment.
"""
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the FastAPI app from main.py
from main import app

# This will be used by Hugging Face Spaces
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))  # Hugging Face Spaces default port
    uvicorn.run(app, host="0.0.0.0", port=port)
