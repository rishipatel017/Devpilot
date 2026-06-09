# DevPilot

A full-stack, AI-powered developer workspace web application built with Next.js, MongoDB, Redis, and the Google Gemini API. DevPilot provides 5 intelligent developer tools under one dashboard.

## 🚀 Features

- **Resume Analyzer** - Get AI-powered feedback on your resume with actionable improvement suggestions
- **GitHub Explainer** - Understand any GitHub repository with AI-generated architecture overviews
- **Bug Fixer** - Debug your code with AI-powered error analysis and solutions
- **Documentation Writer** - Generate professional documentation for your code automatically
- **SQL Helper** - Convert natural language to optimized SQL queries with explanations

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 16.2.7 (App Router) + TypeScript | SSR, routing, API routes |
| Styling | Tailwind CSS 4 + shadcn/ui | UI components |
| AI | Google Gemini API (`@google/generative-ai`) | AI-powered tools |
| Database | MongoDB (via Mongoose) | Users, sessions, history |
| Auth | NextAuth.js v4 | Authentication |
| Validation | Zod | Schema validation |

## 📁 Project Structure

```
devpilot/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── debug/
│   │   ├── docs/
│   │   ├── github/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── ai/
│   │   ├── auth/
│   │   └── history/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── providers.tsx
│   ├── response-card.tsx
│   ├── sidebar.tsx
│   └── tool-shell.tsx
├── lib/
│   ├── gemini.ts                # Gemini AI client
│   ├── github-api.ts            # GitHub API client
│   ├── mongodb.ts               # MongoDB connection
│   └── rate-limit.ts            # Rate limiting utilities
├── models/
│   ├── History.ts
│   ├── Session.ts
│   └── User.ts
├── public/                      # Static assets
├── types/                       # TypeScript type definitions
├── .env.local                   # Environment variables (not committed)
├── middleware.ts               # NextAuth middleware
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Redis (local or Upstash/Railway)
- Google Gemini API key

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# GitHub Token (Required for GitHub Explainer - Create at https://github.com/settings/tokens)
# Select 'repo' scope when creating the token
GITHUB_TOKEN=your_github_token_here

# MongoDB (Atlas / Railway / local)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/devpilot?retryWrites=true&w=majority

# Redis (Upstash / Railway / local)
REDIS_URL=redis://default:password@host:6379

# NextAuth
NEXTAUTH_SECRET=your_random_secret_32_chars
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Run MongoDB (Local)

```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 4. Run Redis (Local)

```bash
docker run -d -p 6379:6379 redis:alpine
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚢 Deployment

### Production Checklist

Before deploying to production, ensure you have:

- ✅ Removed all Next.js branding (completed)
- ✅ Configured proper SEO metadata (completed)
- ✅ Set up security headers in next.config.ts (completed)
- ✅ Added environment variable validation (completed)
- ✅ Created PWA manifest and icons (completed)
- ✅ Configured robots.txt and sitemap.xml (completed)
- ✅ Secured .env.local and added .env.example (completed)

### Render (Recommended)

1. Push your code to GitHub
2. Create a new Web Service in Render
3. Connect your GitHub repository
4. Add the following environment variables in Render dashboard:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `GITHUB_TOKEN` - Your GitHub personal access token (create at https://github.com/settings/tokens with 'repo' scope)
   - `MONGODB_URI` - Your MongoDB connection string
   - `REDIS_URL` - Your Redis connection URL
   - `NEXTAUTH_SECRET` - A random 32+ character string (generate with: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - Your Render app URL (e.g., https://your-app.onrender.com)
   - `NODE_ENV` - Set to `production`
5. Deploy

**Important**: The GitHub Explainer feature requires a `GITHUB_TOKEN` environment variable to work properly. Without it, you'll get "Failed to fetch repository content" errors due to GitHub API rate limits.

### Vercel (Frontend)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard (including GITHUB_TOKEN)
4. Deploy

### MongoDB Atlas (Database)

1. Create a free MongoDB Atlas account
2. Create a cluster
3. Get connection string and add to `MONGODB_URI`
4. Configure IP whitelist (0.0.0.0/0 for cloud deployment)

### Upstash (Redis)

1. Create a free Upstash account
2. Create a Redis database
3. Get connection URL and add to `REDIS_URL`

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Security Note**: Never commit `.env.local` or any file containing real API keys. The `.gitignore` file is configured to prevent this.

## 🔑 Key Implementation Details

- **Streaming Responses**: All AI responses use streaming for real-time output
- **Rate Limiting**: 10 requests per minute per user per tool via Redis
- **Response Caching**: Deterministic prompts cached for 1 hour (SHA-256 key)
- **History Tracking**: All AI interactions saved to MongoDB
- **Auth Guard**: Middleware protects all `/dashboard` routes
- **Mobile First**: Responsive design with collapsible sidebar

## 📝 API Routes

- `POST /api/ai/*` - AI-powered tools (various endpoints)
- `GET /api/history` - Fetch user history
- `POST /api/auth/*` - Authentication endpoints

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
