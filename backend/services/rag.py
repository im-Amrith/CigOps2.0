import os
import json
import logging
from dotenv import load_dotenv
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Path for knowledge base
KNOWLEDGE_BASE_PATH = os.getenv("KNOWLEDGE_BASE_PATH", "data/knowledge_base")

# Add the parent directory to sys.path to find the virtual environment
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

# Load the knowledge base from a local JSON file
def load_knowledge_base():
    knowledge_base_path = f"{KNOWLEDGE_BASE_PATH}/knowledge_base.json"
    if os.path.exists(knowledge_base_path):
        with open(knowledge_base_path, "r") as f:
            return json.load(f)
    else:
        logger.warning(f"Knowledge base file not found at {knowledge_base_path}")
        return []

# Load the knowledge base once on startup
knowledge_base = load_knowledge_base()

def retrieve_relevant_passages(query, k=3):
    """
    Retrieve relevant passages from the knowledge base using keyword matching.
    
    Args:
        query (str): The user query
        k (int): The number of passages to retrieve
        
    Returns:
        list: A list of relevant passages
    """
    try:
        query_lower = query.lower()
        relevant_passages = []
        
        # Simple keyword matching: find passages that contain words from the query
        query_words = set(query_lower.split())
        
        # Sort passages by the number of matching keywords in descending order
        scored_passages = []
        for entry in knowledge_base:
            content = entry.get("content", "").lower()
            source = entry.get("source", "Unknown")
            # Count matching keywords, excluding common words
            matching_keywords = query_words.intersection(set(content.split()))
            score = len(matching_keywords)
            if score > 0:
                scored_passages.append({"text": entry.get("content", ""), "source": source, "score": score})
                
        # Sort by score and take the top k
        scored_passages.sort(key=lambda x: x["score"], reverse=True)
        
        # Format the results
        for passage in scored_passages[:k]:
            relevant_passages.append({
                "text": passage["text"],
                "source": passage["source"]
            })
        
        return relevant_passages
    except Exception as e:
        logger.error(f"Error retrieving passages: {e}")
        return []

def update_knowledge_base_file(new_entry):
    """
    Add a new entry to the local knowledge base JSON file.
    
    Args:
        new_entry (dict): The new knowledge base entry (e.g., {"content": "...", "source": "..."})
        
    Returns:
        bool: True if the update was successful, False otherwise
    """
    try:
        global knowledge_base
        
        # Create knowledge base directory if it doesn't exist
        os.makedirs(KNOWLEDGE_BASE_PATH, exist_ok=True)
        
        # Add new entry to the in-memory knowledge base
        knowledge_base.append(new_entry)
        
        # Save the updated knowledge base to the JSON file
        knowledge_base_path = f"{KNOWLEDGE_BASE_PATH}/knowledge_base.json"
        with open(knowledge_base_path, "w") as f:
            json.dump(knowledge_base, f, indent=2)
        
        logger.info(f"Added new entry to knowledge base file")
        return True
    except Exception as e:
        logger.error(f"Error updating knowledge base file: {e}")
        return False 