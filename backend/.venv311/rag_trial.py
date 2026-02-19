# %%
cloud_apikey = "V3FMgZvrTtXG2TbpBwn6pfyhHV_M--Qf4dvnkspX74QE"

# %%
credentials = { 
    "url"    : "https://eu-de.ml.cloud.ibm.com", 
    "apikey" : cloud_apikey
}
# %%
article_01 = \
"Tomatoes are one of the most popular plants for vegetable gardens.  Tip for success: If you select " \
"varieties that are resistant to disease and pests, growing tomatoes can be quite easy.  For "        \
"experienced gardeners looking for a challenge, there are endless heirloom and specialty varieties "  \
"to cultivate.  Tomato plants come in a range of sizes.  There are varieties that stay very small, "  \
"less than 12 inches, and grow well in a pot or hanging basket on a balcony or patio.  Some grow "    \
"into bushes that are a few feet high and wide, and can be grown is larger containers.  Other "       \
"varieties grow into huge bushes that are several feet wide and high in a planter or garden bed.  "   \
"Still other varieties grow as long vines, six feet or more, and love to climb trellises.  Tomato "   \
"plants do best in full sun.  You need to water tomatoes deeply and often.  Using mulch prevents "    \
"soil-borne disease from splashing up onto the fruit when you water.  Pruning suckers and even "      \
"pinching the tips will encourage the plant to put all its energy into producing fruit."

# %%
article_02 = \
"Cucumbers are fun to grow for beginning gardeners and advanced gardeners alike.  There are two "     \
"types of cucumbers: slicing and pickling.  Pickling cucumbers are smaller than slicing cucumbers.  " \
"Cucumber plants come in two types: vining cucumbers, which are more common, and bush cucumbers.  "   \
"Vining cucumbers, which can grow to more than 5 feet tall, grow fast, yield lots of fruit, and you " \
"can train them up a trellis.  Growing cucumbers up a trellis or fence can maximize garden space, "   \
"keep fruit clean, and make it easier to harvest the fruit.  Tropical plants, cucumbers are very "    \
"sensitive to frost or cold weather. Cucumbers prefer full sun for 6 to 8 hours per day.  Cucumbers " \
"need constant watering.  Cucumbers can grow quickly and ripen in just 6 weeks.  Harvest cucumbers "  \
"every day or two because the more you harvest, the more the plant will produce.  If any cucumber "   \
"is left on the vine to fully mature, the plant will stop producing more cucumbers.  You can extend " \
"the harvest season by planting cucumbers in batches, 2 weeks apart."

# %%
knowledge_base = [ 
    { 
        "title"     : "Growing tomatoes", 
        "Author"    : "A. Rossi",
        "Published" : "2010",
        "txt"       : article_01 
    }, 
    {
        "title"     : "Cucumbers for beginners",
        "Author"    : "B. Melnyk",
        "Published" : "2018",
        "txt"       : article_02 
    }
]

# %%
import re

def search( query_in, knowledge_base_in ):
    if re.match( r".*tomato.*", query_in, re.IGNORECASE ):
        return 0
    elif re.match( r".*cucumber.*", query_in, re.IGNORECASE ):
        return 1
    return -1




# %%
index = search( "How tall do tomatoes grow?", knowledge_base )

if index >= 0:
    print( "Index: " + str( index ) + "\nArticle: \"" + knowledge_base[index]["title"] + "\"" )
else:
    print( "No matching content was found" )




# %%
prompt_template = """
Article:
###
%s
###

Answer the following question using only information from the article. 
Answer in a complete sentence, with proper capitalization and punctuation. 
If there is no good answer in the article, say "I don't know".

Question: %s
Answer: 
"""

def augment( template_in, context_in, query_in ):
    return template_in % ( context_in,  query_in )




# %%
query = "How tall do cucumber plants grow?"

article_txt = knowledge_base[1]["txt"]

augmented_prompt = augment( prompt_template, article_txt, query )

print( augmented_prompt )



# %%
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams



# Get project ID from .env
project_id = "7d8a65fc-ee1e-4a15-abf5-34973a82b2d0"


# Initialize model
model_id = "google/flan-t5-xxl"

gen_parms = {
    GenParams.DECODING_METHOD: "greedy",
    GenParams.MIN_NEW_TOKENS: 1,
    GenParams.MAX_NEW_TOKENS: 50
}

model = ModelInference(
    model_id=model_id,
    credentials=credentials,
    params=gen_parms,
    project_id=project_id
)




# %%
import json

def generate( model_in, augmented_prompt_in ):
    
    generated_response = model_in.generate( augmented_prompt_in )

    if ( "results" in generated_response ) \
       and ( len( generated_response["results"] ) > 0 ) \
       and ( "generated_text" in generated_response["results"][0] ):
        return generated_response["results"][0]["generated_text"]
    else:
        print( "The model failed to generate an answer" )
        print( "\nDebug info:\n" + json.dumps( generated_response, indent=3 ) )
        return ""


# %%
output = generate( model, augmented_prompt )
print( output )

# %%
def searchAndAnswer( knowledge_base_in, model ):
    
    question = input( "Type your question:\n")
    if not re.match( r"\S+", question ):
        print( "No question")
        return
        
    # Retrieve the relevant content
    top_matching_index = search( question, knowledge_base_in )
    if top_matching_index < 0:
        print( "No good answer was found in the knowledge base" )
        return;
    asset = knowledge_base_in[top_matching_index]
    asset_txt = asset["txt"]
    
    # Augment a prompt with context
    augmented_prompt = augment( prompt_template, asset_txt, question )
    
    # Generate output
    output = generate( model, augmented_prompt )
    if not re.match( r"\S+", output ):
        print( "The model failed to generate an answer")
    print( "\nAnswer:\n" + output )
    print( "\nSource: \"" + asset["title"] + "\", " + asset["Author"] + " (" + asset["Published"] + ")"  )



# %%
searchAndAnswer( knowledge_base, model )


# %%
