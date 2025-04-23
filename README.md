# Content Forge

A modern web application built with Next.js, TypeScript, and Supabase for content management and collaboration.

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
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/content-forge-5.git
cd content-forge-5
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:3000`

## Development

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run test` - Run tests
- `bun run typecheck` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.