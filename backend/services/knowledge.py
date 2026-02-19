import os
import json
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional

load_dotenv()

# Path to knowledge base directory
KNOWLEDGE_BASE_DIR = os.getenv("KNOWLEDGE_BASE_DIR", "data/knowledge")

# Mock knowledge base data
mock_knowledge_base = [
    {
        "id": "1",
        "title": "Understanding Nicotine Cravings",
        "author": "Dr. Sarah Johnson",
        "published": "2022",
        "content": "Nicotine cravings typically last 3-5 minutes. When a craving hits, try the 4 D's: Delay, Deep breathing, Drink water, and Do something else. Cravings are temporary and will pass. Remember that each time you resist a craving, you're strengthening your ability to quit permanently. Physical activity can help reduce cravings by releasing endorphins that improve mood and reduce stress."
    },
    {
        "id": "2",
        "title": "Coping with Stress Without Smoking",
        "author": "Dr. Michael Chen",
        "published": "2021",
        "content": "Many people use smoking as a way to cope with stress, but there are healthier alternatives. Try progressive muscle relaxation, meditation, or deep breathing exercises. Regular physical activity can significantly reduce stress levels. Consider keeping a stress journal to identify triggers and develop healthier coping mechanisms. Remember that smoking actually increases stress in the long term by creating nicotine dependency."
    },
    {
        "id": "3",
        "title": "Social Situations and Smoking",
        "author": "Dr. Emily Rodriguez",
        "published": "2023",
        "content": "Social situations can be challenging when quitting smoking. Prepare ahead by having a plan for handling offers of cigarettes. Practice saying 'No, thank you' firmly. Consider bringing a friend who doesn't smoke to social events. If you're at a party, position yourself away from smoking areas. Remember that most people will respect your decision to quit, and you might even inspire others to do the same."
    },
    {
        "id": "4",
        "title": "Managing Withdrawal Symptoms",
        "author": "Dr. James Wilson",
        "published": "2022",
        "content": "Nicotine withdrawal symptoms typically peak within the first 3 days and subside within 2-3 weeks. Common symptoms include irritability, anxiety, difficulty concentrating, and increased appetite. Stay hydrated, get plenty of rest, and consider nicotine replacement therapy if symptoms are severe. Remember that these symptoms are temporary and a sign that your body is healing from nicotine addiction."
    },
    {
        "id": "5",
        "title": "Building a Support System",
        "author": "Dr. Lisa Thompson",
        "published": "2023",
        "content": "Having a strong support system can double your chances of successfully quitting smoking. Tell friends, family, and coworkers about your quit attempt and ask for their support. Consider joining a support group or using a quit-smoking app to connect with others on the same journey. Professional support from counselors or healthcare providers can provide additional guidance and accountability."
    }
]

async def get_knowledge_base() -> List[Dict[str, Any]]:
    """
    Get the knowledge base for nicotine recovery.
    
    Returns:
        List[Dict[str, Any]]: The knowledge base articles
    """
    # For testing purposes, return mock data
    if os.getenv("USE_MOCK_RESPONSES", "true").lower() == "true":
        return mock_knowledge_base
    
    # In a real implementation, this would fetch data from a database or external API
    # For now, we'll just return the mock data
    return mock_knowledge_base

async def get_article(article_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific knowledge base article.
    
    Args:
        article_id (str): The article ID
        
    Returns:
        Optional[Dict[str, Any]]: The article, or None if not found
    """
    # For testing purposes, return mock data
    if os.getenv("USE_MOCK_RESPONSES", "true").lower() == "true":
        for article in mock_knowledge_base:
            if article["id"] == article_id:
                return article
        return None
    
    # In a real implementation, this would fetch data from a database or external API
    # For now, we'll just return the mock data
    for article in mock_knowledge_base:
        if article["id"] == article_id:
            return article
    return None

def create_default_knowledge_base():
    """
    Create default knowledge base.
    
    Returns:
        list: The default knowledge base articles
    """
    # Create default knowledge base data
    kb_data = [
        {
            "id": "nicotine-withdrawal",
            "title": "Understanding Nicotine Withdrawal",
            "category": "Withdrawal",
            "content": "Nicotine withdrawal occurs when you stop using tobacco products. Symptoms typically begin within a few hours of your last cigarette and peak within 2-3 days. Common symptoms include irritability, anxiety, difficulty concentrating, increased appetite, and strong cravings for nicotine. These symptoms usually improve within 2-4 weeks, though some people may experience them for longer. Understanding these symptoms can help you prepare for and manage them effectively during your quit journey.",
            "tags": ["withdrawal", "symptoms", "nicotine"]
        },
        {
            "id": "coping-strategies",
            "title": "Effective Coping Strategies for Cravings",
            "category": "Coping",
            "content": "When a craving hits, it's important to have strategies ready to help you resist. Deep breathing exercises can help calm your mind and body. Physical activity, even a short walk, can reduce stress and distract you from cravings. Drinking water or herbal tea can help satisfy the oral fixation. Calling a support person can provide encouragement and accountability. Using nicotine replacement therapy as prescribed can help manage withdrawal symptoms. Remember that most cravings only last 3-5 minutes, so having a plan to get through those minutes is crucial.",
            "tags": ["cravings", "coping", "strategies"]
        },
        {
            "id": "health-benefits",
            "title": "Health Benefits of Quitting Smoking",
            "category": "Health",
            "content": "The health benefits of quitting smoking begin almost immediately. Within 20 minutes, your heart rate and blood pressure drop. Within 12 hours, carbon monoxide levels normalize. Within 2-12 weeks, circulation improves and lung function increases. Within 1-9 months, coughing and shortness of breath decrease. Within 1 year, your risk of heart disease is half that of a smoker. Within 5-15 years, your risk of stroke is reduced to that of a non-smoker. Within 10 years, your risk of lung cancer is half that of a smoker. Within 15 years, your risk of heart disease is similar to that of a non-smoker. These improvements can significantly enhance your quality of life and longevity.",
            "tags": ["health", "benefits", "quitting"]
        },
        {
            "id": "relapse-prevention",
            "title": "Preventing Relapse After Quitting",
            "category": "Prevention",
            "content": "Relapse is common in the quit journey, but it doesn't mean failure. It's important to identify your triggers and develop strategies to avoid or manage them. Common triggers include stress, social situations, alcohol, and certain places or activities. Having a strong support system can help you stay accountable. Setting up rewards for reaching milestones can provide motivation. If you do relapse, don't give up - use it as a learning experience to strengthen your quit plan. Remember that most successful quitters attempt to quit multiple times before succeeding permanently.",
            "tags": ["relapse", "prevention", "triggers"]
        },
        {
            "id": "nicotine-replacement",
            "title": "Understanding Nicotine Replacement Therapy",
            "category": "Treatment",
            "content": "Nicotine replacement therapy (NRT) can double your chances of quitting successfully. NRT provides nicotine without the harmful chemicals in tobacco, helping to reduce withdrawal symptoms and cravings. Common forms include patches, gum, lozenges, inhalers, and nasal sprays. Patches provide a steady dose of nicotine throughout the day, while other forms allow for more flexible dosing. It's important to use NRT as directed and for the recommended duration. Combining different forms of NRT may be more effective than using a single form. Consult with a healthcare provider to determine the best NRT option for you.",
            "tags": ["NRT", "treatment", "nicotine"]
        }
    ]
    
    return kb_data 