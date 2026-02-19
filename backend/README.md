---
title: CigOps 2.0 Backend API
emoji: 🚭
colorFrom: blue
colorTo: green
sdk: docker
sdk_version: "3.11"
app_file: app.py
pinned: false
---

# CigOps 2.0 - Backend API

Backend API for the Nicotine Recovery AI Assistant. This API powers the AI-driven chat, voice conversation, and recovery tracking features.

## Features

- 🤖 AI-powered chat using Groq (Llama 3.3 70B)
- 🎙️ Voice chat with ElevenLabs TTS
- 📚 RAG-enhanced responses with ChromaDB
- 📊 User analytics and progress tracking
- 🎯 Personalized quit plans
- 🆘 Crisis support
- 📍 Resource locator

## API Endpoints

### Chat & Voice
- `POST /api/chat` - Text chat with AI
- `POST /api/voice_chat` - Voice chat conversation
- `POST /api/synthesize_audio` - Generate speech audio

### User Management
- `POST /api/user/register` - Register new user
- `GET /api/user/{user_id}` - Get user profile
- `PUT /api/user/{user_id}` - Update user profile

### Recovery Tracking
- `GET `/api/dashboard/{user_id}` - Get user dashboard data
- `POST /api/craving` - Log a craving incident
- `GET /api/craving/{user_id}` - Get craving history

### Plans & Resources
- `GET /api/plan/{user_id}` - Get quit plan
- `POST /api/plan` - Create/update quit plan
- `GET /api/resources` - Get nearby resources

### Knowledge Base
- `GET /api/knowledge` - Get knowledge base articles
- `POST /api/query` - Query knowledge base with RAG

## Configuration

Required environment variables:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id
```

## Tech Stack

- FastAPI - Web framework
- Groq AI - LLM inference
- ElevenLabs - Text-to-speech
- ChromaDB - Vector database for RAG
- LangChain - LLM orchestration

## Frontend

The frontend React application is available at: https://github.com/im-Amrith/CigOps2.0

## Author

**Amrith**
- GitHub: [@im-Amrith](https://github.com/im-Amrith)
- Hugging Face: [@im-amrith](https://huggingface.co/im-amrith)

## License

MIT License

## Disclaimer

This application provides support and information for nicotine cessation. It is not a substitute for professional medical advice.
