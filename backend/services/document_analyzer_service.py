import os
import json
import re
import logging
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Get API keys from environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")

# Initialize the Groq client for document analysis
try:
    if GROQ_API_KEY:
        client_analyzer = Groq(
            api_key=GROQ_API_KEY,
        )
        MODEL_ANALYZER_OK = True
        logger.info(f"Successfully initialized Groq analyzer client with model: {GROQ_MODEL}")
    else:
        logger.error("GROQ_API_KEY not found in environment variables")
        client_analyzer = None
        MODEL_ANALYZER_OK = False
except Exception as e:
    logger.error(f"Groq analyzer client initialization failed: {e}")
    client_analyzer = None
    MODEL_ANALYZER_OK = False

# Helper function to generate response
def generate_response(client_instance, prompt):
    """Generate a response using the Groq client."""
    logger.info("Inside document_analyzer_service generate_response function.")
    try:
        logger.info("Attempting to call Groq chat completion.")
        chat_completion = client_instance.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=GROQ_MODEL,
            max_tokens=7000,
            temperature=0.3,
        )
        logger.info("Groq chat completion call finished.")
        
        if chat_completion.choices and len(chat_completion.choices) > 0:
            response_text = chat_completion.choices[0].message.content
            logger.info("Successfully extracted response from Groq analyzer.")
            return response_text
        else:
            logger.error("The analyzer model failed to generate an answer or returned an unexpected format.")
            return "Error: AI model failed to generate analysis. Please check backend logs."
    except Exception as e:
        logger.error(f"Error during analyzer model generation: {str(e)}", exc_info=True)
        return f"Error: Analyzer model generation failed: {str(e)}"

# Helper function to clean response
def clean_response(response):
    """
    Clean up the response from the Groq AI model.
    """
    response = response.strip()
    response = response.replace("```", "")
    response = response.replace("<p>", "").replace("</p>", "")
    response = response.replace("<br>", "\n").replace("<br/>", "\n")
    while "\n\n\n" in response:
        response = response.replace("\n\n\n", "\n\n")
    return response

async def analyze_document_with_watsonx(document_text: str):
    """
    Analyzes medical document text using the Groq AI model for analysis.
    Instructs the model to extract summary, key values, keywords, and highlighted points.
    """
    if not MODEL_ANALYZER_OK:
        logger.error("Groq analyzer client is not initialized for document analysis.")
        return {
            "summary": "Analysis failed: AI model not available.",
            "importantValues": [],
            "keywords": [],
            "highlightedPoints": []
        }

    prompt = f"""
You are a highly accurate medical document analysis AI. Your task is to read the following medical document and extract specific information. Provide the output in a structured JSON format.

Document Text:

{document_text}


Analyze the document and provide the following:
1.  **A concise summary** of the report (e.g., type of report, main findings).
2.  **Important medical values** mentioned, especially related to specific conditions (like vitamin deficiencies, blood work, etc.). List them as a list of objects with 'label', 'value', and 'unit' (if available).
3.  **Key medical keywords** or terms from the document.
4.  **Important points or conclusions** highlighted as a list of bullet points.

**VERY IMPORTANT:** Your response MUST contain ONLY the JSON object with the EXACT keys: "summary", "importantValues", "keywords", and "highlightedPoints". Do not include any other text, markdown formatting (like ```json`), or explanations before or after the JSON. The output should start with '{' and end with '}'.

JSON Output:"""

    logger.info(f"Sending document analysis prompt to Groq analyzer. Text length: {len(document_text)}")
    logger.debug(f"Analysis Prompt: {prompt[:500]}...") # Log start of prompt

    try:
        # Use the dedicated analyzer client
        raw_response = generate_response(client_analyzer, prompt)
        logger.info("Received raw response from Groq analyzer.")
        logger.info(f"Raw Analyzer Response: {raw_response[:500]}...") # Detailed logging
        logger.debug("Full Raw Analyzer Response: %s", raw_response) # Full raw response for debugging

        analysis_result = None

        # Attempt to find and parse the first occurrence of a JSON object
        json_match = re.search(r'\{\s*"summary":.*?\}', raw_response, re.DOTALL)

        if json_match:
            json_string = json_match.group(0)
            # Clean up potential markdown code block wrapping
            json_string = json_string.replace('```json', '').replace('```', '').strip()

            # Attempt to fix common truncation issues - heuristics
            # Try to close potentially open lists or objects at the end
            if not json_string.endswith('}'):
                 logger.warning("JSON string does not end with }. Attempting to auto-close.")
                 # Simple heuristic: if it ends with part of a list/object, try to close it
                 if json_string.endswith('[') or json_string.endswith(',') or json_string.endswith('\n'):
                      json_string += ']}' # Assume it was cutting off a list in an object
                 elif json_string.endswith('{'):
                      json_string += '}' # Assume it was cutting off an object
                 logger.warning(f"Attempted to auto-close. New JSON string end: {json_string[-20:]}")

            # Final clean up of trailing commas/syntax issues before load
            json_string = re.sub(r',\s*\}', '}', json_string)
            json_string = re.sub(r',\s*\]', ']', json_string)
            json_string = json_string.rstrip(',')

            try:
                analysis_result = json.loads(json_string)
                logger.info("Successfully parsed the (potentially cleaned) JSON analysis result.")
                
                # --- Add logic to handle potential key mismatch ---
                if analysis_result and "medical_values" in analysis_result and "importantValues" not in analysis_result:
                    analysis_result["importantValues"] = analysis_result.pop("medical_values")
                    logger.warning("Renamed 'medical_values' key to 'importantValues'.")
                # ------------------------------------------------

            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse the (potentially cleaned) JSON from analyzer: {e}")
                analysis_result = None # Ensure analysis_result is None on failure

        # Final check on the structure before returning
        if analysis_result and all(key in analysis_result for key in ["summary", "importantValues", "keywords", "highlightedPoints"]):
            logger.info("Final analysis result from analyzer has required keys. Returning parsed result.")
            return analysis_result
        else:
            logger.error("Final analysis result from analyzer is missing required keys or no valid/expected JSON was parsed.")
            # Fallback: Return a more informative message if parsing fails
            fallback_summary = "Analysis failed: Could not extract structured response from AI model.\n"
            if raw_response:
                 fallback_summary += f"Attempted to parse analyzer response but encountered errors. Raw response starts with: {raw_response[:300]}...\nFull raw response logged at debug level."
            return {
                "summary": fallback_summary,
                "importantValues": [],
                "keywords": [],
                "highlightedPoints": ["Please check backend logs for the full raw AI response and parsing errors in document_analyzer_service.py."]
            }

    except Exception as e:
        logger.error(f"Error during document analysis with Groq analyzer: {str(e)}", exc_info=True)
        return {
            "summary": f"An error occurred during analysis: {str(e)}",
            "importantValues": [],
            "keywords": [],
            "highlightedPoints": ["Analysis could not be completed."]
        } 