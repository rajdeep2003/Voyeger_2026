from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Voyager AI Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    MODEL_DIRECTORY: str = "trained_models"
    NODE_BACKEND_URL: str = "http://localhost:5000"
    OLLAMA_URL: str = "http://localhost:11434/api/chat"
    OLLAMA_MODEL: str = "gemma2:2b"

    class Config:
        env_file = ".env"

settings = Settings()