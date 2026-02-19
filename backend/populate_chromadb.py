import json
from services.rag import add_documents

# Example: Load sample documents (replace with real CDC/WHO/PubMed docs)
docs = [
    {
        "id": "cdc1",
        "text": "Nicotine withdrawal symptoms typically peak within the first 3 days and subside within 2-3 weeks. Common symptoms include irritability, anxiety, difficulty concentrating, and increased appetite. Stay hydrated, get plenty of rest, and consider nicotine replacement therapy if symptoms are severe.",
        "source": "CDC Smoking Cessation Guidelines"
    },
    {
        "id": "who1",
        "text": "Cravings are temporary and will pass. Try the 4 D's: Delay, Deep breathing, Drink water, and Do something else. Each time you resist a craving, you're strengthening your ability to quit permanently.",
        "source": "WHO Quit Tobacco Resources"
    },
    {
        "id": "pubmed1",
        "text": "Behavioral therapies, such as cognitive-behavioral therapy and motivational interviewing, are effective for smoking cessation. Combining behavioral support with pharmacotherapy increases quit rates.",
        "source": "PubMed: Behavioral Interventions for Smoking Cessation"
    },
    {
        "id": "cdc2",
        "text": "If you slip, don't give up. Most successful quitters attempt to quit multiple times before succeeding permanently. Use each attempt as a learning experience.",
        "source": "CDC Smoking Cessation Guidelines"
    },
    {
        "id": "cdc3",
        "text": "The National Quitline (1-800-QUIT-NOW) provides free support and resources for people trying to quit smoking.",
        "source": "CDC Quitline"
    }
]

add_documents(docs)
print("ChromaDB populated with nicotine recovery knowledge base.") 