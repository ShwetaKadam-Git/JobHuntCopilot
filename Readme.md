# JobHuntCopilot

AI-powered CV and cover letter analyzer that helps you optimize your job applications.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB)
![Flask](https://img.shields.io/badge/Flask-3.0-000000)

## Features

- **Chatbot-style Interface** - Clean, conversational UI for analyzing job applications
- **File Upload Support** - Upload CV and cover letter (PDF, DOC, DOCX)
- **Job URL Analysis** - Paste any job listing URL to compare against your application
- **AI-Powered Feedback** - Get match scores, CV analysis, cover letter suggestions, and job alignment insights
- **Groq AI Integration** - Uses Groq's fast LLM inference for analysis

## Architecture

This project consists of two parts:

1. **Next.js Frontend** - Modern chat UI for uploading files and displaying results
2. **Flask Backend** - Python API that parses documents, scrapes job postings, and calls Groq AI

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js UI    │────▶│  Flask Backend  │────▶│    Groq AI      │
│  (Port 3000)    │     │   (Port 5000)   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- Python 3.9 or later
- npm, yarn, or pnpm
- Groq API key ([Get one here](https://console.groq.com))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ShwetaKadam-Git/JobHuntCopilot.git
cd JobHuntCopilot
```

2. Install frontend dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Install Python dependencies:

```bash
pip install flask flask-cors pdfplumber python-docx requests beautifulsoup4 lxml groq
```

4. Set up environment variables:

```bash
# Create a .env file or export directly
export GROQ_API_KEY=your_groq_api_key_here

# Optional: Set Flask backend URL (defaults to http://127.0.0.1:5000)
export FLASK_BACKEND_URL=http://127.0.0.1:5000
```

### Running the Application

You need to run both the Flask backend and Next.js frontend:

**Terminal 1 - Start Flask Backend:**

```bash
python app/main.py
```

The Flask server will start on http://127.0.0.1:5000

**Terminal 2 - Start Next.js Frontend:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── analyze-cv/
│   │       └── route.ts      # Next.js API proxy to Flask backend
│   ├── main.py               # Flask backend with Groq AI integration
│   ├── globals.css           # Global styles with dark theme
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   └── job-hunt-chat.tsx     # Chat interface component
└── lib/
    └── utils.ts              # Utility functions
```

## API Reference

### POST `/api/analyze-cv`

Analyzes a CV and cover letter against a job posting.

**Request Body (FormData):**

| Field          | Type   | Description                       |
| -------------- | ------ | --------------------------------- |
| `cv`           | File   | CV document (PDF, DOCX)           |
| `cover_letter` | File   | Cover letter document (PDF, DOCX) |
| `url`          | String | URL of the job listing            |

**Response:**

```json
{
  "status": "success",
  "result": {
    "match_score": "78",
    "cv_analysis": {
      "missing_keywords": ["keyword1", "keyword2"],
      "skills_to_add": ["skill1", "skill2"],
      "experience_improvements": ["improvement1"],
      "ats_tips": ["tip1", "tip2"]
    },
    "cover_letter_analysis": {
      "issues": ["issue1"],
      "improvements": ["improvement1"],
      "rewritten_cover_letter": "Suggested rewrite..."
    },
    "job_alignment": {
      "strengths": ["strength1", "strength2"],
      "gaps": ["gap1"],
      "recommendations": ["recommendation1"]
    },
    "general_feedback": ["feedback1", "feedback2"]
  }
}
```

## Environment Variables

| Variable            | Required | Default                  | Description                      |
| ------------------- | -------- | ------------------------ | -------------------------------- |
| `GROQ_API_KEY`      | Yes      | -                        | Your Groq API key                |
| `FLASK_BACKEND_URL` | No       | http://127.0.0.1:5000    | URL of the Flask backend         |

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React

### Backend
- **Framework:** Flask
- **AI Provider:** Groq (qwen/qwen3-32b model)
- **Document Parsing:** pdfplumber, python-docx
- **Web Scraping:** BeautifulSoup4, requests

## Deployment

### Deploy Frontend on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShwetaKadam-Git/JobHuntCopilot)

Remember to set the `FLASK_BACKEND_URL` environment variable in Vercel to point to your deployed Flask backend.

### Deploy Flask Backend

You can deploy the Flask backend on:
- **Railway** - `railway up`
- **Render** - Create a new Web Service
- **AWS Lambda** - Using Zappa or Mangum
- **Google Cloud Run** - Containerize with Docker

Example Dockerfile for Flask:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/main.py .

EXPOSE 5000

CMD ["python", "main.py"]
```

### Build Frontend for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
# or
pnpm build
pnpm start
```

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
