# Development Workflow

## Getting Started

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd VTHousing
   cp .env.example .env
   # Edit .env with your API keys
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend && pip install -r requirements.txt
   
   # Frontend
   cd ../frontend && npm install
   ```

3. **Development Mode**
   ```bash
   # Terminal 1 - Backend (from root directory)
   ./scripts/run_backend.sh
   
   # Terminal 2 - Frontend (from root directory)  
   ./scripts/run_frontend.sh
   ```

## Project Structure Benefits

✅ **Clean Separation**: Frontend and backend are clearly separated
✅ **Logical Grouping**: Related files are grouped together
✅ **Easy Navigation**: Intuitive directory names
✅ **Centralized Config**: Single .env file and documentation
✅ **Script Automation**: Easy-to-run scripts for development

## Development Tips

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173`
- API endpoints are prefixed with `/api/`
- Hot reload is enabled for both frontend and backend
- Environment variables are loaded from root `.env` file