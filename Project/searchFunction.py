# This is the search functionality implmementation using open ai
import os
import openai

#checks to see if api key is in environment variables
if(os.path.exists('.env')):
    
else:
    raise Exception("No .env file found, Please read the README for instructions on how to set up the .env file")