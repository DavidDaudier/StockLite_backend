-- Solution pour corriger les permissions PostgreSQL
-- Exécutez ces commandes dans DBeaver ou psql en tant que superuser (postgres)

-- Option 1: Accorder toutes les permissions sur le schéma public à l'utilisateur stocklite
GRANT ALL PRIVILEGES ON SCHEMA public TO stocklite;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stocklite;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stocklite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO stocklite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO stocklite;

-- Option 2: Rendre l'utilisateur stocklite propriétaire de la base de données
-- (Cette option donne plus de contrôle)
ALTER DATABASE stocklite_db OWNER TO stocklite;

-- Option 3: Si PostgreSQL 15+, vous devrez peut-être aussi exécuter:
GRANT CREATE ON SCHEMA public TO stocklite;

-- Vérifier les permissions après exécution:
\l stocklite_db
\dn+ public
