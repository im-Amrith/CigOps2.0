import httpx
import os
import json
import re
import random
from dotenv import load_dotenv
from groq import Groq
from services.rag import retrieve_relevant_passages
from services.craving import log_craving, get_craving_stats
from datetime import datetime
import requests
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API keys from environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")

# Path for chat history
USER_DATA_DIR = os.getenv("USER_DATA_DIR", "data/users")

# Knowledge base path
KNOWLEDGE_BASE_PATH = "data/knowledge_base"

# Knowledge base for nicotine recovery
nicotine_knowledge_base = [
    {
        "title": "Understanding Nicotine Cravings",
        "Author": "Dr. Sarah Johnson",
        "Published": "2022",
        "txt": "Nicotine cravings typically last 3-5 minutes. When a craving hits, try the 4 D's: Delay, Deep breathing, Drink water, and Do something else. Cravings are temporary and will pass. Remember that each time you resist a craving, you're strengthening your ability to quit permanently. Physical activity can help reduce cravings by releasing endorphins that improve mood and reduce stress."
    },
    {
        "title": "Coping with Stress Without Smoking",
        "Author": "Dr. Michael Chen",
        "Published": "2021",
        "txt": "Many people use smoking as a way to cope with stress, but there are healthier alternatives. Try progressive muscle relaxation, meditation, or deep breathing exercises. Regular physical activity can significantly reduce stress levels. Consider keeping a stress journal to identify triggers and develop healthier coping mechanisms. Remember that smoking actually increases stress in the long term by creating nicotine dependency."
    },
    {
        "title": "Social Situations and Smoking",
        "Author": "Dr. Emily Rodriguez",
        "Published": "2023",
        "txt": "Social situations can be challenging when quitting smoking. Prepare ahead by having a plan for handling offers of cigarettes. Practice saying 'No, thank you' firmly. Consider bringing a friend who doesn't smoke to social events. If you're at a party, position yourself away from smoking areas. Remember that most people will respect your decision to quit, and you might even inspire others to do the same."
    },
    {
        "title": "Managing Withdrawal Symptoms",
        "Author": "Dr. James Wilson",
        "Published": "2022",
        "txt": "Nicotine withdrawal symptoms typically peak within the first 3 days and subside within 2-3 weeks. Common symptoms include irritability, anxiety, difficulty concentrating, and increased appetite. Stay hydrated, get plenty of rest, and consider nicotine replacement therapy if symptoms are severe. Remember that these symptoms are temporary and a sign that your body is healing from nicotine addiction."
    },
    {
        "title": "Building a Support System",
        "Author": "Dr. Lisa Thompson",
        "Published": "2023",
        "txt": "Having a strong support system can double your chances of successfully quitting smoking. Tell friends, family, and coworkers about your quit attempt and ask for their support. Consider joining a support group or using a quit-smoking app to connect with others on the same journey. Professional support from counselors or healthcare providers can provide additional guidance and accountability."
    },
    {
        "title": "Rewarding Yourself for Progress",
        "Author": "Dr. Robert Kim",
        "Published": "2022",
        "txt": "Celebrating milestones in your quit journey can reinforce positive behavior. Set up a reward system for yourself, such as treating yourself to something special after each smoke-free week. Calculate how much money you're saving by not buying cigarettes and use some of that money for rewards. Remember that the greatest reward is improved health and freedom from addiction."
    },
    {
        "title": "Handling Relapse",
        "Author": "Dr. Patricia Martinez",
        "Published": "2021",
        "txt": "Relapse is common in the quitting process and doesn't mean failure. If you slip up, don't be too hard on yourself. Instead, analyze what triggered the relapse and develop strategies to handle similar situations in the future. Most successful quitters attempt to quit multiple times before succeeding permanently. View each attempt as a learning experience that brings you closer to your goal."
    },
    {
        "title": "Long-term Strategies for Staying Smoke-free",
        "Author": "Dr. David Lee",
        "Published": "2023",
        "txt": "After the initial withdrawal period, focus on building a new identity as a non-smoker. Avoid situations where you're likely to be tempted to smoke, especially in the first few months. Develop new routines and hobbies to replace smoking-related activities. Regular exercise can help maintain weight and reduce stress. Remember that the risk of relapse decreases significantly after 6 months of being smoke-free."
    }
]

# Motivational tips and facts
MOTIVATIONAL_TIPS = [
    "Remember: Most cravings last only 3-5 minutes. You can get through this!",
    "Every craving you resist is a victory. Be proud of yourself!",
    "Try the 4 D's: Delay, Deep breathing, Drink water, Do something else.",
    "You are stronger than your cravings. Take a deep breath and focus on your goal.",
    "Reward yourself for every smoke-free day. You deserve it!",
    "Reach out to a friend or support group when you need encouragement.",
    "Visualize your life as a non-smoker: more energy, better health, more freedom.",
    "If you slip, don't give up. Every attempt brings you closer to success.",
    "Drinking water and going for a short walk can help reduce cravings.",
    "You're saving money and improving your health every day you stay smoke-free!"
]

EMPATHETIC_OPENERS = [
    "I'm here for you.",
    "You're not alone in this journey.",
    "I understand how tough this can be.",
    "Quitting is hard, but you're doing something amazing.",
    "Let's get through this together."
]

COPING_STRATEGIES = [
    "Try deep breathing: inhale for 4, hold for 4, exhale for 4.",
    "Distract yourself with a quick walk or a favorite activity.",
    "Chew gum or drink a glass of water to keep your mouth busy.",
    "Write down your reasons for quitting and read them when you have a craving.",
    "Call or text a friend for support right now."
]

CRISIS_KEYWORDS = ["hopeless", "suicidal", "give up", "end it", "can't go on", "kill myself", "emergency"]
CRISIS_RESPONSE = "It sounds like you're going through a really tough time. If you're in crisis or need immediate help, please call the National Suicide Prevention Lifeline at 1-800-273-8255 or your local emergency number. You are not alone."
MEDICAL_DISCLAIMER = "(Disclaimer: I am not a substitute for professional medical advice. For medical decisions, please consult a healthcare provider.)"

# Initialize the Groq client
try:
    if GROQ_API_KEY:
        client = Groq(
            api_key=GROQ_API_KEY,
        )
        MODEL_OK = True
        logger.info(f"Successfully initialized Groq client with model: {GROQ_MODEL}")
    else:
        logger.error("GROQ_API_KEY not found in environment variables")
        client = None
        MODEL_OK = False
except Exception as e:
    logger.error(f"Groq client initialization failed: {e}")
    client = None
    MODEL_OK = False

def search_knowledge_base(query, knowledge_base):
    """
    Simple keyword-based search to find relevant articles in the knowledge base.
    In a production system, this would be replaced with a more sophisticated search.
    """
    query = query.lower()
    
    # Define keywords for each article
    keywords = [
        ["craving", "urge", "desire", "want", "need", "temptation"],
        ["stress", "anxiety", "worry", "nervous", "tense", "pressure"],
        ["social", "party", "friend", "family", "colleague", "peer"],
        ["withdrawal", "symptom", "headache", "irritable", "anxious", "restless"],
        ["support", "help", "assist", "encourage", "motivate", "guide"],
        ["reward", "celebrate", "treat", "gift", "milestone", "achievement"],
        ["relapse", "slip", "fail", "mistake", "setback", "lapse"],
        ["long-term", "forever", "permanent", "future", "maintain", "sustain"]
    ]
    
    # Find the most relevant article based on keyword matches
    best_match_index = -1
    best_match_score = 0
    
    for i, article_keywords in enumerate(keywords):
        score = sum(1 for keyword in article_keywords if keyword in query)
        if score > best_match_score:
            best_match_score = score
            best_match_index = i
    
    # If no good match, return a default article (general support)
    if best_match_index == -1:
        return knowledge_base[0]
    
    return knowledge_base[best_match_index]

def craving_keywords():
    return [
        "craving", "urge", "desire", "want to smoke", "need a cigarette", "temptation", "nicotine hit",
        "can't resist", "really want to smoke", "smoke so bad", "need to vape", "need to smoke"
    ]

def detect_craving(message):
    msg = message.lower()
    return any(kw in msg for kw in craving_keywords())

def get_chat_history(user_id, limit=10):
    try:
        os.makedirs(USER_DATA_DIR, exist_ok=True)
        path = f"{USER_DATA_DIR}/{user_id}_chat.json"
        if os.path.exists(path):
            with open(path, "r") as f:
                history = json.load(f)
            return history[-limit:]
        else:
            return []
    except Exception as e:
        logger.error(f"Error loading chat history: {e}")
        return []

def save_chat_message(user_id, sender, text):
    try:
        os.makedirs(USER_DATA_DIR, exist_ok=True)
        path = f"{USER_DATA_DIR}/{user_id}_chat.json"
        msg = {
            "id": f"msg_{datetime.now().strftime('%Y%m%d%H%M%S%f')}",
            "sender": sender,
            "text": text,
            "timestamp": datetime.now().isoformat()
        }
        if os.path.exists(path):
            with open(path, "r") as f:
                history = json.load(f)
        else:
            history = []
        history.append(msg)
        with open(path, "w") as f:
            json.dump(history, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving chat message: {e}")

# Enhanced prompt template
prompt_template = """
You are a supportive, empathetic nicotine recovery coach. Your goal is to help people overcome cravings and stay smoke-free.

Context about the user:
- Current mood: %s
- Craving intensity (1-10): %s
- Days smoke-free: %s
- Previous quit attempts: %s
- Craving stats: %s

Recent chat history:
%s

Relevant information from our knowledge base:
###
%s
###

User message: %s

Respond in a warm, supportive, and conversational tone. Be empathetic and understanding. 
If the user is experiencing a strong craving, provide immediate distraction techniques and remind them that cravings are temporary.
If the user is feeling discouraged, offer encouragement and remind them of their progress.
If appropriate, include a single, relevant motivational tip from the provided list.
Suggest one actionable step the user can take right now. Ask a follow-up question to keep the conversation going.
Keep your response brief (1-2 sentences) and focused on helping the user overcome their current challenge.
"""

def augment_prompt(template, context, passages, question):
    if passages:
        knowledge = "\n".join([f"- {p['text']} (Source: {p['source']})" for p in passages])
    else:
        knowledge = random.choice(MOTIVATIONAL_TIPS)
    # Add a follow-up question for interactivity
    follow_up = "\n\nIs there a specific situation or trigger you'd like more help with?"
    return template % (
        knowledge,
        context.get("mood", "neutral"),
        context.get("cravings", 5),
        context.get("days_smoke_free", 0),
        context.get("streak", 0),
        question
    ) + follow_up

def generate_response(client, prompt):
    """Generate a response using the Groq model."""
    logger.info("Inside generate_response function.")
    try:
        logger.info("Attempting to call Groq chat completion.")
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=GROQ_MODEL,
            max_tokens=512,
            temperature=0.7,
        )
        logger.info("Groq chat completion call finished.")
        
        if chat_completion.choices and len(chat_completion.choices) > 0:
            response_text = chat_completion.choices[0].message.content
            logger.info("Successfully extracted response from Groq.")
            return response_text
        else:
            logger.error("The model failed to generate an answer or returned an unexpected format.")
            return "I'm having trouble generating a response right now. Please try again in a moment."
    except Exception as e:
        logger.error(f"Error during model generation: {str(e)}", exc_info=True)
        return "I'm experiencing some technical difficulties. Please try again in a moment."

# Main function to query Watsonx with RAG
async def query_watsonx(context, message):
    """
    Query the Watsonx AI model with RAG.
    
    Args:
        context (dict): The user context
        message (str): The user message
        
    Returns:
        str: The AI-generated response
    """
    try:
        # Check if model is initialized
        if not MODEL_OK:
            logger.error("Groq client is not initialized")
            return "I'm sorry, I'm having trouble connecting to my AI model right now. Please try again later."
        
        # Prepare the prompt with context and message
        prompt = prepare_prompt(context, message)
        
        # Get relevant knowledge base entries using RAG
        passages = retrieve_relevant_passages(message, k=3)
        
        # Add knowledge base entries to the prompt
        if passages:
            prompt += "\n\nRelevant information from our knowledge base:\n"
            for passage in passages:
                prompt += f"- {passage['text']} (Source: {passage['source']})\n"
        
        # Generate response using the Groq model
        response = generate_response(client, prompt)
        
        # Clean up the response
        cleaned_response = clean_response(response)
        
        # Log the interaction
        user_id = context.get("user_id", "user")
        save_chat_message(user_id, "user", message)
        save_chat_message(user_id, "assistant", cleaned_response)
        
        return cleaned_response
    except Exception as e:
        # Log the error
        logger.error(f"Error in query_watsonx: {str(e)}")
        return "I'm sorry, I encountered an error while processing your request. Please try again later."

def prepare_prompt(context, message):
    """
    Prepare the prompt for the Watsonx AI model.
    
    Args:
        context (dict): The user context
        message (str): The user message
        
    Returns:
        str: The prepared prompt
    """
    # Extract relevant context
    user_id = context.get("user_id", "user")
    days_smoke_free = context.get("days_smoke_free", 0)
    cravings = context.get("cravings", 5)
    triggers = context.get("triggers", [])
    goals = context.get("goals", [])
    medications = context.get("medications", [])
    quit_date = context.get("quit_date", None)
    last_smoke = context.get("last_smoke", None)
    quit_attempts = context.get("quit_attempts", 0)
    support_network = context.get("support_network", [])
    preferred_coping_strategies = context.get("preferred_coping_strategies", [])
    time_of_day = context.get("time_of_day", None)
    location = context.get("location", None)
    mood = context.get("mood", None)
    stress_level = context.get("stress_level", 5)
    sleep_hours = context.get("sleep_hours", None)
    exercise_minutes = context.get("exercise_minutes", None)
    water_intake = context.get("water_intake", None)
    caffeine_intake = context.get("caffeine_intake", None)
    alcohol_intake = context.get("alcohol_intake", None)
    
    # Build the prompt
    prompt = f"""You are a supportive AI assistant for nicotine recovery. Your goal is to help users quit smoking and stay smoke-free.

User Context:
- User ID: {user_id}
- Days smoke-free: {days_smoke_free}
- Current craving level (1-10): {cravings}
- Stress level (1-10): {stress_level}
"""

    # Add optional context if available
    if triggers:
        prompt += f"- Triggers: {', '.join(triggers)}\n"
    if goals:
        prompt += f"- Goals: {', '.join(goals)}\n"
    if medications:
        prompt += f"- Medications: {', '.join(medications)}\n"
    if quit_date:
        prompt += f"- Quit date: {quit_date}\n"
    if last_smoke:
        prompt += f"- Last smoke: {last_smoke}\n"
    if quit_attempts:
        prompt += f"- Previous quit attempts: {quit_attempts}\n"
    if support_network:
        prompt += f"- Support network: {', '.join(support_network)}\n"
    if preferred_coping_strategies:
        prompt += f"- Preferred coping strategies: {', '.join(preferred_coping_strategies)}\n"
    if time_of_day:
        prompt += f"- Time of day: {time_of_day}\n"
    if location:
        prompt += f"- Location: {location}\n"
    if mood:
        prompt += f"- Current mood: {mood}\n"
    if sleep_hours:
        prompt += f"- Sleep hours: {sleep_hours}\n"
    if exercise_minutes:
        prompt += f"- Exercise minutes: {exercise_minutes}\n"
    if water_intake:
        prompt += f"- Water intake (oz): {water_intake}\n"
    if caffeine_intake:
        prompt += f"- Caffeine intake (mg): {caffeine_intake}\n"
    if alcohol_intake:
        prompt += f"- Alcohol intake (drinks): {alcohol_intake}\n"
    
    # Add the user message
    prompt += f"\nUser message: {message}\n\n"
    
    # Add instructions for the AI
    prompt += """Please provide a helpful, supportive, and informative response. Your response should:
1. Be empathetic and understanding
2. Provide evidence-based information when relevant
3. Offer practical coping strategies
4. Be encouraging and motivational
5. Avoid judgment or criticism
6. Be concise and clear
7. Focus on the user's specific situation and needs

Your response:"""
    
    return prompt

def get_relevant_knowledge(message):
    """
    Get relevant knowledge base entries for the user message.
    
    Args:
        message (str): The user message
        
    Returns:
        list: A list of relevant knowledge base entries
    """
    try:
        # Create knowledge base directory if it doesn't exist
        os.makedirs(KNOWLEDGE_BASE_PATH, exist_ok=True)
        
        # Check if knowledge base exists
        if not os.path.exists(f"{KNOWLEDGE_BASE_PATH}/knowledge_base.json"):
            return []
        
        # Load knowledge base
        with open(f"{KNOWLEDGE_BASE_PATH}/knowledge_base.json", "r") as f:
            knowledge_base = json.load(f)
        
        # Find relevant entries
        relevant_entries = []
        message_lower = message.lower()
        
        for entry in knowledge_base:
            # Check if any keyword matches
            if any(keyword.lower() in message_lower for keyword in entry.get("keywords", [])):
                relevant_entries.append(entry.get("content", ""))
        
        return relevant_entries
    except Exception as e:
        # Log the error
        logger.error(f"Error getting relevant knowledge: {str(e)}")
        return []

def clean_response(response):
    """
    Clean up the response from the Watsonx AI model.
    
    Args:
        response (str): The raw response from the model
        
    Returns:
        str: The cleaned response
    """
    # Remove any leading/trailing whitespace
    response = response.strip()
    
    # Remove any markdown code blocks
    response = response.replace("```", "")
    
    # Remove any HTML tags
    response = response.replace("<p>", "").replace("</p>", "")
    response = response.replace("<br>", "\n").replace("<br/>", "\n")
    
    # Remove any multiple newlines
    while "\n\n\n" in response:
        response = response.replace("\n\n\n", "\n\n")
    
    return response

def update_knowledge_base(entry):
    """
    Update the knowledge base with a new entry.
    
    Args:
        entry (dict): The new knowledge base entry
        
    Returns:
        bool: True if the update was successful, False otherwise
    """
    try:
        # Create knowledge base directory if it doesn't exist
        os.makedirs(KNOWLEDGE_BASE_PATH, exist_ok=True)
        
        # Check if knowledge base exists
        if os.path.exists(f"{KNOWLEDGE_BASE_PATH}/knowledge_base.json"):
            # Load knowledge base
            with open(f"{KNOWLEDGE_BASE_PATH}/knowledge_base.json", "r") as f:
                knowledge_base = json.load(f)
        else:
            # Create new knowledge base
            knowledge_base = []
        
        # Add new entry
        knowledge_base.append(entry)
        
        # Save knowledge base
        with open(f"{KNOWLEDGE_BASE_PATH}/knowledge_base.json", "w") as f:
            json.dump(knowledge_base, f, indent=2)
        
        return True
    except Exception as e:
        # Log the error
        logger.error(f"Error updating knowledge base: {str(e)}")
        return False

async def query_watsonx_voice(context: dict, message: str, conversation_history: list):
    """
    Query the Watsonx AI model for voice chat, incorporating conversation history.
    
    Args:
        context (dict): The user context
        message (str): The user message
        conversation_history (list): List of previous messages for context
        
    Returns:
        str: The AI-generated text response
    """
    logger.info("Starting query_watsonx_voice function.")
    try:
        if not MODEL_OK:
            logger.error("Groq client is not initialized in query_watsonx_voice.")
            return "I'm sorry, I'm having trouble connecting to my AI model right now. Please try again later."
        
        # Prepare the prompt with context, message, and history
        logger.info("Preparing voice chat prompt.")
        prompt = prepare_voice_chat_prompt(context, message, conversation_history)
        logger.info(f"Prompt prepared. Length: {len(prompt)}")
        # logger.debug(f"Prepared prompt: {prompt}") # Use debug for full prompt if needed
        
        # Get relevant knowledge base entries using RAG (optional for brevity in voice chat?)
        # For now, let's skip explicit RAG lookup in voice chat for faster responses
        # If needed, we can add retrieve_relevant_passages here.
        
        # Generate response using the Groq model
        logger.info("Generating response with Groq model.")
        response = generate_response(client, prompt)
        logger.info("Response generation complete.")
        
        # Clean up the response
        logger.info("Cleaning up response.")
        cleaned_response = clean_response(response)
        logger.info(f"Response cleaned. Cleaned response: {cleaned_response[:100]}...")
        
        # In voice chat, we don't save individual turns like text chat,
        # history is managed by the frontend and passed in.
        
        logger.info("query_watsonx_voice function finished successfully.")
        return cleaned_response
    except Exception as e:
        logger.error(f"Error in query_watsonx_voice: {str(e)}", exc_info=True) # Log traceback
        return "I'm sorry, I encountered an error while processing your request. Please try again later."

def prepare_voice_chat_prompt(context, message, conversation_history):
    """
    Prepares the prompt for the conversational AI voice chat.
    Formats conversation history for the model.
    """
    # Format conversation history
    history_text = ""
    if conversation_history:
        for entry in conversation_history:
            # Ensure we only include valid entries with role and content
            if 'role' in entry and 'content' in entry:
                 history_text += f"{entry['role'].capitalize()}: {entry['content']}\n"

    # Get relevant knowledge (can be simplified or enhanced later)
    relevant_knowledge = get_relevant_knowledge(message)
    
    # Format relevant knowledge - join the list items into a single string
    knowledge_text = ""
    if relevant_knowledge:
        knowledge_text = "\n".join(relevant_knowledge)
    else:
        knowledge_text = "No specific knowledge found."

    # Basic user context details for the prompt
    user_context_text = f"Current mood: {context.get('mood', 'not specified')}\n" \
                       f"Craving intensity (1-10): {context.get('cravings', 'not specified')}\n" \
                       f"Days smoke-free: {context.get('days_smoke_free', 'not specified')}\n" \
                       f"Previous quit attempts: {context.get('previous_attempts', 'not specified')}"
    
    # Include craving stats if available in context
    if 'craving_stats' in context and context['craving_stats']:
        stats = context['craving_stats']
        user_context_text += f"\nCraving stats: Total logged: {stats.get('total', 0)}, Avg intensity: {stats.get('average_intensity', 'N/A')}, Last 24h: {stats.get('last_24h', 0)}"

    # Construct the final prompt
    prompt = f"""
You are a highly interactive, supportive, and empathetic nicotine recovery coach. Your primary goal is to engage the user in a helpful conversation to overcome cravings and stay smoke-free. Make the conversation feel natural and encouraging.

Context about the user:
{user_context_text}

Recent chat history:
{history_text}

Relevant information from our knowledge base:
###
{knowledge_text}
###

User message: {message}

Based on the user's message, their context, and the recent chat history, generate ONLY the assistant's direct response. Do NOT include any introductory phrases, meta-commentary, or instructions to yourself. Keep the response concise, natural, and focused on the user. Respond in a warm, supportive, and conversational tone.

- Be empathetic and validate their feelings.
- Directly address their current situation, especially if they mention a craving or challenge.
- If appropriate, briefly offer a relevant piece of information from the knowledge base in a natural, conversational way.
- If necessary, suggest ONE concrete, actionable coping strategy they can try right now.
- Ask ONE open-ended, relevant follow-up question to encourage further interaction and show you are listening.
- Keep your response very short and concise, ideally 1-3 sentences maximum unless the user asks for more information. Ensure the response flows well for spoken language.
- Avoid repeating the user's message or explicitly stating that you are using the history or context.
- Do not include any markdown or special formatting.
- Do not use emojis.
- Do not end the conversation mid-sentence.

Assistant Response:"""

    logger.info(f"Prepared voice chat prompt: {prompt[:500]}...") # Log start of prompt
    return prompt
    
async def chat_with_document_watsonx(document_text: str, question: str, chat_history: list = [], analysis_context: str = ""):
    """
    Answers questions about a medical document using the Watsonx AI model.
    Includes document content, chat history, and analysis context in the prompt.
    """
    if not MODEL_OK:
        logger.error("Groq client is not initialized for chat.")
        return "I'm sorry, I'm having trouble connecting to my AI model right now. Please try again later."

    # Format chat history for the prompt
    history_text = "\n".join([f"{msg['sender'].capitalize()}: {msg['text']}" for msg in chat_history])

    prompt = f"""
You are a helpful AI assistant that answers questions about the provided medical document. Use only the information from the document and the provided analysis context to answer.

Document Text:

{document_text}

{analysis_context}

Chat History:
{history_text}

User Question: {question}


Based on the document text, the provided analysis context, and chat history, answer the user's question. If the answer is not in the document or the analysis context, state that you cannot find the information.

Assistant Response:"""

    logger.info(f"Sending chat prompt to Watsonx. Document text length: {len(document_text)}, Question: {question}, Analysis context length: {len(analysis_context)}")
    logger.debug(f"Chat Prompt: {prompt[:500]}...") # Log start of prompt

    try:
        raw_response = generate_response(client, prompt)
        logger.info("Received raw response from Groq for chat.")
        logger.debug(f"Raw Chat Response: {raw_response[:500]}...")

        # Basic cleaning of the response
        cleaned_response = clean_response(raw_response) # Reuse existing clean_response

        return cleaned_response

    except Exception as e:
        logger.error(f"Error during document chat with Watsonx: {str(e)}", exc_info=True)
        return "I'm sorry, I encountered an error while processing your request. Please try again later."
