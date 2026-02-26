# DTR Tracker - OJT Time Management System

A comprehensive Daily Time Record (DTR) tracking system for On-the-Job Training (OJT) hours management. Built with Next.js, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure login and registration system
- **Time Tracking**: Clock in/out functionality with automatic hour calculation
- **Progress Monitoring**: Visual progress tracking against OJT requirements
- **Dashboard**: Comprehensive overview of time records and statistics
- **User Portal**: Personalized dashboard for each user
- **Database Storage**: All data securely stored in Supabase

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Custom components with Lucide icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dtr-tracker-project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
- Run the SQL script in `database-schema.sql` in your Supabase SQL editor
- This will create the necessary tables and set up Row Level Security (RLS)

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses two main tables:

### Users Table
- `id`: UUID (Primary Key)
- `email`: User email (unique)
- `full_name`: User's full name
- `password_hash`: Hashed password
- `ojt_hours_required`: Required OJT hours
- `ojt_hours_completed`: Completed OJT hours
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### DTR Records Table
- `id`: UUID (Primary Key)
- `user_id`: Foreign key to users table
- `date`: Date of the time record
- `time_in`: Clock in time
- `time_out`: Clock out time (nullable)
- `total_hours`: Auto-calculated hours
- `description`: Work description
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

## Pages

- **Home** (`/`): Landing page with app overview
- **Login** (`/login`): User authentication
- **Register** (`/register`): New user registration
- **Users** (`/users`): User portal with overview and quick actions
- **Dashboard** (`/dashboard`): Main DTR tracking interface

## Usage

1. **Registration**: New users create an account with their email, password, full name, and required OJT hours
2. **Login**: Existing users log in with their credentials
3. **User Portal**: View personal statistics and navigate to the dashboard
4. **Dashboard**: 
   - Clock in/out for daily time tracking
   - View recent DTR records
   - Monitor OJT progress
   - Add descriptions to work sessions

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure password hashing
- Session-based authentication

## Development

### Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts
│   ├── lib/            # Utility functions and configurations
│   └── globals.css     # Global styles
├── components/
│   └── ui/             # Base UI components
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

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
