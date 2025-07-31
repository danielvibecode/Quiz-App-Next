# Volleyball Quiz App - Deployment Guide

Diese Anleitung beschreibt die Schritte zum Deployment der Volleyball Quiz App auf Vercel als Multi-Tenant SaaS-Lösung.

## Voraussetzungen

- Ein Vercel-Konto (https://vercel.com)
- Ein Supabase-Projekt (https://supabase.com)
- Git-Repository mit dem Quellcode der App

## Schritt 1: Umgebungsvariablen einrichten

Erstelle eine `.env.local` Datei basierend auf der `.env.example` und fülle alle erforderlichen Variablen aus:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_PROJECT_ID=your_project_id_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.com

# Production URLs
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Cron Job Security (Optional)
CRON_SECRET=your_cron_secret_here
```

## Schritt 2: Supabase Types generieren

Vor dem Deployment solltest du sicherstellen, dass die Supabase-Typen aktuell sind:

```bash
npm run update-types
```

## Schritt 3: Lokalen Build testen

Teste den Build lokal, um sicherzustellen, dass alles funktioniert:

```bash
npm run build
```

## Schritt 4: Deployment auf Vercel

### Option 1: Vercel CLI

1. Installiere die Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login und Deployment:
   ```bash
   vercel login
   vercel
   ```

### Option 2: Vercel Dashboard

1. Gehe zu [Vercel](https://vercel.com) und logge dich ein
2. Klicke auf "New Project"
3. Importiere das Git-Repository
4. Konfiguriere die Umgebungsvariablen
5. Klicke auf "Deploy"

## Schritt 5: Domain-Konfiguration für Multi-Tenant

### Haupt-Domain einrichten

1. Gehe zu den Projekteinstellungen in Vercel
2. Wähle "Domains"
3. Füge deine Haupt-Domain hinzu (z.B. `volleyball-quiz.com`)

### Subdomains für Teams einrichten

Für jedes Team kannst du eine Subdomain einrichten:

1. Füge eine Subdomain hinzu (z.B. `team1.volleyball-quiz.com`)
2. Aktualisiere die `multi-tenant.ts` Datei mit den neuen Tenant-Informationen

## Schritt 6: Cron Jobs aktivieren

Vercel Cron Jobs sind standardmäßig deaktiviert. Um sie zu aktivieren:

1. Gehe zu den Projekteinstellungen
2. Wähle "Cron Jobs"
3. Aktiviere den Cron Job für `/api/cron/cleanup-sessions`

## Schritt 7: Monitoring und Logging

1. Aktiviere Vercel Analytics für Performance-Monitoring
2. Richte Vercel Logs ein für Fehlerüberwachung
3. Konfiguriere optional einen externen Logging-Service wie Sentry

## Fehlerbehebung

### Problem: Build schlägt fehl

- Überprüfe die Vercel-Logs für genaue Fehlermeldungen
- Stelle sicher, dass alle Umgebungsvariablen korrekt gesetzt sind
- Überprüfe, ob alle Abhängigkeiten installiert sind

### Problem: Supabase-Verbindung fehlgeschlagen

- Überprüfe die Supabase-Anmeldedaten
- Stelle sicher, dass die IP-Adresse nicht blockiert ist
- Überprüfe die Supabase-Datenbank-Regeln (RLS)

## Nächste Schritte

- CI/CD-Pipeline einrichten für automatische Deployments
- Monitoring-System für Multi-Tenant-Performance einrichten
- Backup-Strategie für Datenbank implementieren

## Ressourcen

- [Vercel Dokumentation](https://vercel.com/docs)
- [Next.js Dokumentation](https://nextjs.org/docs)
- [Supabase Dokumentation](https://supabase.com/docs)
