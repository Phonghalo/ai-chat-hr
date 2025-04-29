# Installation Guide for Next.js Supabase Chat Application

This guide will walk you through the steps to set up and run the Next.js Supabase Chat application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) (v8 or newer) or [yarn](https://yarnpkg.com/) (v1.22 or newer) or [pnpm](https://pnpm.io/) (v7 or newer)
- [Git](https://git-scm.com/)

## Step 1: Clone the Repository

\`\`\`bash
git clone <repository-url>
cd next-supabase-chat
\`\`\`

Replace `<repository-url>` with the URL of your Git repository.

## Step 2: Install Dependencies

Using npm:
\`\`\`bash
npm install
\`\`\`

Using yarn:
\`\`\`bash
yarn
\`\`\`

Using pnpm:
\`\`\`bash
pnpm install
\`\`\`

## Step 3: Set Up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com/) if you don't have one already.
2. Create a new Supabase project.
3. Once your project is created, go to the project dashboard.
4. Navigate to "Settings" > "API" to find your API keys and URL.
5. Copy the following values:
   - API URL
   - anon/public key
   - service_role key (keep this secure)
   - JWT Secret (found in Settings > API > JWT Settings)

## Step 4: Set Up Database Tables

1. In your Supabase project, go to the "SQL Editor" section.
2. Create the required tables by running the following SQL:

\`\`\`sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create files table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users NOT NULL,
  filename TEXT NOT NULL,
  file_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own files" ON public.files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = user_id);
\`\`\`

3. Set up authentication providers:
   - Go to "Authentication" > "Providers"
   - Enable Google authentication (or any other provider you want to use)
   - Add your OAuth credentials (Client ID and Secret)
   - Set the redirect URL to `http://localhost:3000/auth/callback` for local development

## Step 5: Configure Environment Variables

1. Create a `.env.local` file in the root of your project
2. Add the following environment variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
POSTGRES_URL=<your-postgres-url>
POSTGRES_PRISMA_URL=<your-postgres-prisma-url>
POSTGRES_URL_NON_POOLING=<your-postgres-url-non-pooling>
POSTGRES_HOST=<your-postgres-host>
POSTGRES_DATABASE=<your-postgres-database>
POSTGRES_USER=<your-postgres-user>
POSTGRES_PASSWORD=<your-postgres-password>
\`\`\`

Replace the placeholders with your actual values from Supabase.

## Step 6: Run the Development Server

Using npm:
\`\`\`bash
npm run dev
\`\`\`

Using yarn:
\`\`\`bash
yarn dev
\`\`\`

Using pnpm:
\`\`\`bash
pnpm dev
\`\`\`

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Step 7: Set Up Google OAuth (Optional)

If you want to use Google authentication:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth 2.0 Client ID
5. Add the following authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://your-production-domain.com/auth/callback` (for production)
6. Copy the Client ID and Client Secret
7. Add these credentials to your Supabase project under "Authentication" > "Providers" > "Google"

## Troubleshooting

- **Authentication Issues**: Make sure your redirect URLs are correctly set up in both Supabase and your OAuth provider.
- **Database Connection Issues**: Verify that your database connection strings are correct.
- **API Errors**: Check that your Supabase API keys are correctly set in your environment variables.

## Deployment

To deploy your application to production:

1. Push your code to a Git repository
2. Set up a new project on Vercel, Netlify, or your preferred hosting provider
3. Connect your Git repository
4. Set up the environment variables in your hosting provider's dashboard
5. Deploy the application

For Vercel deployment, you can use the following command:
\`\`\`bash
vercel
\`\`\`

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
