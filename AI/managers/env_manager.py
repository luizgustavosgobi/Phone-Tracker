import os

from dotenv import load_dotenv

load_dotenv()

def getEnv(name: str) -> str:
    return os.getenv(name)
