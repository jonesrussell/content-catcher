# Content Catcher

A web application that allows users to capture content from various sources and organize it into a single location.

## Features

- 🚀 Next.js 15 with App Router
- ⚡ TypeScript for type safety
- 🔐 Supabase Authentication
- 🔄 Real-time collaboration with YJS
- 🎨 Tailwind CSS for styling
- 📱 Responsive design
- 🌙 Dark mode support
- 🧪 Jest for testing
- 📝 ESLint and Prettier for code quality

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Real-time**: YJS
- **Testing**: Jest
- **Package Manager**: NPM

## Getting Started

### Prerequisites

- Node.js 18+
- Node package manager
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jonesrussell/content-catcher.git
cd content-catcher
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run typecheck` - Run TypeScript type checking

## License

This project is licensed under the MIT License - see the LICENSE file for details.