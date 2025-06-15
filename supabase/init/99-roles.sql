ALTER ROLE postgres WITH PASSWORD 'postgres';

ALTER ROLE anon SET search_path = public;
ALTER ROLE authenticated SET search_path = public;