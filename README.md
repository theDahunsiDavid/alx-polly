# ALX Polling App

A modern, feature-rich polling application built with Next.js 15, TypeScript, and Tailwind CSS. Create polls, gather opinions, and make data-driven decisions with an intuitive interface.

## Features

- **User Authentication**: Secure login and registration system
- **Poll Creation**: Easy-to-use interface for creating polls with multiple options
- **Poll Management**: View, edit, and manage your created polls
- **Voting System**: Participate in polls with real-time updates
- **Results Visualization**: Beautiful charts and analytics for poll results
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui components
- **Icons**: Lucide React
- **State Management**: React hooks

## Project Structure

```
app/
├── (auth)/                 # Authentication routes (grouped)
│   ├── login/             # Login page
│   └── register/          # Registration page
├── (dashboard)/           # Dashboard routes (grouped)
│   └── dashboard/         # Main dashboard page
├── polls/                 # Poll-related routes
│   ├── create/            # Create new poll page
│   ├── [id]/              # Individual poll view page
│   └── page.tsx           # Polls listing page
├── components/            # Reusable components
│   ├── ui/                # Shadcn UI components
│   │   ├── button.tsx     # Button component
│   │   ├── card.tsx       # Card components
│   │   └── input.tsx      # Input component
│   ├── forms/             # Form components
│   │   ├── login-form.tsx # Login form
│   │   ├── register-form.tsx # Registration form
│   │   ├── create-poll-form.tsx # Poll creation form
│   │   └── poll-vote-form.tsx # Poll voting form
│   ├── navigation.tsx     # Navigation component
│   ├── header.tsx         # Header component
│   └── poll-results.tsx   # Poll results display
├── lib/                   # Utility functions
│   └── utils.ts           # Common utility functions
├── types/                 # TypeScript type definitions
│   └── index.ts           # App-wide types
├── hooks/                 # Custom React hooks
├── globals.css            # Global styles
├── layout.tsx             # Root layout
└── page.tsx               # Home page
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alx-polly
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Components

### Authentication
- Login and registration forms with validation
- Secure authentication flow
- User session management

### Poll Management
- Create polls with multiple options
- Set expiration dates and voting rules
- Allow single or multiple votes per user

### Voting System
- Interactive voting interface
- Real-time results updates
- Beautiful progress bars and charts

### Dashboard
- Overview of user's polls
- Quick statistics and metrics
- Recent activity tracking

## Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] Poll sharing and embedding
- [ ] Mobile app development
- [ ] API endpoints for external integrations
- [ ] Advanced poll types (ranked choice, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
