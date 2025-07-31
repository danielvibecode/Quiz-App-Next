# Supabase Types

Dieses Verzeichnis enthält automatisch generierte TypeScript-Typen für die Supabase-Datenbank.

## Typen aktualisieren

Die Typen werden automatisch aus der Supabase-Datenbank generiert. Um die Typen zu aktualisieren, führe einen der folgenden Befehle aus:

### Für Produktion (benötigt SUPABASE_PROJECT_ID in .env)

```bash
npm run update-types
```

### Für lokale Entwicklung (benötigt lokalen Supabase-Server)

```bash
npm run update-types:local
```

## Verwendung

Die Typen werden automatisch vom Supabase-Client verwendet. Du kannst sie auch direkt importieren:

```typescript
import { Database, Tables } from '@/types/database';

// Beispiel für eine Tabelle
type Situation = Tables<'situations'>;

// Beispiel für eine Einfügeoperation
type SituationInsert = Tables['situations']['Insert'];
```

## Tabellen

Die folgenden Tabellen sind in der Datenbank definiert:

- `situations`: Quiz-Situationen
- `teams`: Teams
- `user_answers`: Benutzerantworten
- `user_profiles`: Benutzerprofile

## Beziehungen

- `user_profiles` gehören zu `teams` (team_id)
- `situations` gehören zu `teams` (team_id)
- `situations` werden erstellt von `user_profiles` (created_by)
- `user_answers` gehören zu `user_profiles` (user_id)
- `user_answers` gehören zu `situations` (situation_id)
- `user_answers` gehören zu `teams` (team_id)
