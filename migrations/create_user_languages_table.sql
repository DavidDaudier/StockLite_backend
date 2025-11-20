-- Migration: Create user_languages table
-- Date: 2025-11-17
-- Description: Table pour stocker la préférence de langue de chaque utilisateur

CREATE TABLE IF NOT EXISTS user_languages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  language_code VARCHAR(10) NOT NULL DEFAULT 'fr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key vers la table users
  CONSTRAINT fk_user_language_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  -- Validation: seulement les langues supportées
  CONSTRAINT chk_language_code
    CHECK (language_code IN ('fr', 'en', 'ht', 'es'))
);

-- Index sur user_id pour recherche rapide
CREATE INDEX idx_user_languages_user_id ON user_languages(user_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_user_languages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_languages_updated_at
  BEFORE UPDATE ON user_languages
  FOR EACH ROW
  EXECUTE FUNCTION update_user_languages_updated_at();

-- Insérer une langue par défaut pour tous les utilisateurs existants (optionnel)
INSERT INTO user_languages (user_id, language_code)
SELECT id, 'fr'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_languages);

-- Commentaires pour documentation
COMMENT ON TABLE user_languages IS 'Stocke la préférence de langue pour chaque utilisateur';
COMMENT ON COLUMN user_languages.user_id IS 'ID de l''utilisateur (unique)';
COMMENT ON COLUMN user_languages.language_code IS 'Code de la langue préférée (fr, en, ht, es)';
COMMENT ON COLUMN user_languages.created_at IS 'Date de création de la préférence';
COMMENT ON COLUMN user_languages.updated_at IS 'Date de dernière modification';
