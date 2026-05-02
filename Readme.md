# JobHuntCopilot

AI-powered CV and cover letter analyzer that helps you optimize your job applications.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC)

## Features

- **Chatbot-style Interface** - Clean, conversational UI for analyzing job applications
- **File Upload Support** - Upload CV and cover letter (PDF, DOC, DOCX, TXT)
- **Job URL Analysis** - Paste any job listing URL to compare against your application
- **AI-Powered Feedback** - Get match scores, strengths, improvements, and suggestions

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ShwetaKadam-Git/JobHuntCopilot.git
cd JobHuntCopilot
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── analyze-cv/
│   │       └── route.ts      # API endpoint for CV analysis
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

| Field         | Type   | Description                    |
| ------------- | ------ | ------------------------------ |
| `cv`          | File   | CV document (PDF, DOC, DOCX, TXT) |
| `coverLetter` | File   | Cover letter document          |
| `jobUrl`      | String | URL of the job listing         |

**Response:**

```json
{
  "matchScore": 78,
  "summary": "Analysis summary...",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}
```

## Customization

### Connecting to Your AI Backend

The current implementation returns mock data. To connect to a real AI service, modify `/app/api/analyze-cv/route.ts`:

```typescript
// Replace the mock analysis with your AI service call
const analysisResult = await yourAIService.analyze({
  cv: cvText,
  coverLetter: coverLetterText,
  jobUrl: jobUrl,
});
```

### Theming

The app uses CSS custom properties for theming. Modify `/app/globals.css` to customize colors:

```css
:root {
  --background: oklch(0.13 0.005 285);
  --primary: oklch(0.7 0.15 200);
  /* ... other tokens */
}
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **UI Components:** Custom components with Radix UI primitives

## Deployment

### Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShwetaKadam-Git/JobHuntCopilot)

### Manual Deployment

Build for production:

```bash
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
