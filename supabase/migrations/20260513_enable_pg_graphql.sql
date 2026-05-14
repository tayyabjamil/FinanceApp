-- Enable the pg_graphql extension so the /graphql/v1 endpoint is available.
-- This auto-generates a GraphQL schema from all public tables.
create extension if not exists pg_graphql with schema extensions;
