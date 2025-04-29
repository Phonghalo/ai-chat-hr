# Environment Variables

This document lists all the environment variables required for the Next.js Supabase Chat application to function properly.

## Required Environment Variables

### Supabase Configuration

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | The public URL of your Supabase instance. Used in both client and server. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anonymous key for your Supabase instance. Used for unauthenticated requests. |
| `SUPABASE_SERVICE_ROLE_KEY` | The service role key for your Supabase instance. Used for server-side operations with elevated privileges. |
| `SUPABASE_JWT_SECRET` | The JWT secret used to verify Supabase authentication tokens. |
| `SUPABASE_ANON_KEY` | Another reference to the anonymous key (can be the same as NEXT_PUBLIC_SUPABASE_ANON_KEY). |

### Database Configuration

| Variable | Description |
|----------|-------------|
| `POSTGRES_URL` | The connection URL for your PostgreSQL database. |
| `POSTGRES_PRISMA_URL` | The connection URL for Prisma to connect to your PostgreSQL database. |
| `POSTGRES_URL_NON_POOLING` | The non-pooling connection URL for your PostgreSQL database. |
| `POSTGRES_HOST` | The hostname of your PostgreSQL database. |
| `POSTGRES_DATABASE` | The name of your PostgreSQL database. |
| `POSTGRES_USER` | The username for your PostgreSQL database. |
| `POSTGRES_PASSWORD` | The password for your PostgreSQL database. |

## How to Set Up Environment Variables

### Local Development

1. Create a `.env.local` file in the root of your project
2. Add the required environment variables to this file

Example `.env.local` file:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_ANON_KEY=your-anon-key
POSTGRES_URL=postgres://postgres:password@localhost:5432/database
POSTGRES_PRISMA_URL=postgres://postgres:password@localhost:5432/database?pgbouncer=true&connection_limit=1
POSTGRES_URL_NON_POOLING=postgres://postgres:password@localhost:5432/database
POSTGRES_HOST=localhost
POSTGRES_DATABASE=database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
\`\`\`

### Production Deployment

When deploying to Vercel, add these environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add each required environment variable

## Notes

- The `NEXT_PUBLIC_` prefix indicates that the variable is exposed to the browser. Be careful not to expose sensitive information with this prefix.
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges, so it should only be used server-side and never exposed to the client.
- For local development with Supabase, you can find these values in your Supabase project dashboard under Project Settings > API.
