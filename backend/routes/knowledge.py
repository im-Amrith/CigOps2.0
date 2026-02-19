from fastapi import APIRouter, HTTPException
from services import knowledge

router = APIRouter()

@router.get("/knowledge")
async def get_knowledge_base():
    """
    Get the knowledge base for nicotine recovery.
    
    Returns:
        dict: The knowledge base content
    """
    try:
        # Get knowledge base
        knowledge_base = await knowledge.get_knowledge_base()
        
        return knowledge_base
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting knowledge base: {str(e)}")

@router.get("/knowledge/{article_id}")
async def get_article(article_id: str):
    """
    Get a specific knowledge base article.
    
    Args:
        article_id (str): The article ID
        
    Returns:
        dict: The article
    """
    try:
        article = await knowledge.get_article(article_id)
        if article:
            return article
        else:
            raise HTTPException(status_code=404, detail=f"Article not found: {article_id}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting article: {str(e)}") 