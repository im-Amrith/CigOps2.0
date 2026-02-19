# Nicotine Recovery AI Assistant

A modern, interactive AI assistant for nicotine recovery, built with FastAPI and React.

## Features

- **Interactive Voice Chat**: Talk to the AI assistant using natural language
- **Personalized Support**: Get tailored advice based on your quit journey
- **Craving Management**: Get immediate help when cravings hit
- **Knowledge Base**: Access evidence-based information about quitting smoking
- **Progress Tracking**: Monitor your smoke-free journey
- **Multiple Voice Types**: Different voice personalities for different situations

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Groq**: High-performance AI inference for natural language understanding
- **ElevenLabs**: High-quality text-to-speech for voice interactions
- **Pydantic**: Data validation and settings management

### Frontend
- **React**: UI library for building interactive interfaces
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next-generation frontend tooling

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- API keys for Groq and ElevenLabs

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nicotine-recovery.git
cd nicotine-recovery
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with your API keys:
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile

ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_default_voice_id_here
ELEVENLABS_COACH_VOICE_ID=your_coach_voice_id_here
ELEVENLABS_EMERGENCY_VOICE_ID=your_emergency_voice_id_here
ELEVENLABS_CALMING_VOICE_ID=your_calming_voice_id_here
```

4. Set up the frontend:
```bash
cd ../frontend
npm install
```

5. Start the development servers:
```bash
# In the backend directory
uvicorn main:app --reload

# In the frontend directory
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Chat and Voice
- `POST /api/query`: Text-based chat with the AI assistant
- `POST /api/voice/chat`: Voice-based chat with the AI assistant
- `POST /api/calm`: Get calming voice guidance

### User Management
- `POST /api/user`: Create or update user profile
- `GET /api/user/{user_id}`: Get user profile

### Craving Management
- `POST /api/craving`: Log a craving and get support
- `GET /api/craving/stats/{user_id}`: Get craving statistics

### Knowledge Base
- `GET /api/knowledge/{topic}`: Get information about a specific topic

### Dashboard
- `GET /api/dashboard/{user_id}`: Get user dashboard data

## Project Structure

```
nicotine-recovery/
├── backend/
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── models.py         # Data models
│   ├── main.py           # Application entry point
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
└── data/
    ├── knowledge_base/   # Knowledge base for RAG
    └── logs/             # Application logs
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Groq](https://groq.com/) for high-performance AI inference
- [ElevenLabs](https://elevenlabs.io/) for voice synthesis
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend library

