# 🔧 Netlify Environment Variables Setup

## Required Environment Variables

Für ein funktionierendes Deployment müssen folgende Environment Variables in der Netlify Dashboard gesetzt werden:

### **1. Supabase Configuration**
```
NEXT_PUBLIC_SUPABASE_URL=https://sutswaikdcssfgzsvczk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dein_supabase_anon_key]
SUPABASE_SERVICE_ROLE_KEY=[dein_supabase_service_role_key]
SUPABASE_PROJECT_ID=sutswaikdcssfgzsvczk
```

### **2. NextAuth Configuration**
```
NEXTAUTH_SECRET=[generiere_einen_sicheren_secret]
NEXTAUTH_URL=https://[deine-netlify-url].netlify.app
```

### **3. Base URL Configuration**
```
NEXT_PUBLIC_BASE_URL=https://[deine-netlify-url].netlify.app
```

## 📋 Setup-Schritte in Netlify

1. **Gehe zu deiner Netlify Site**
2. **Site settings → Environment variables**
3. **Füge alle oben genannten Variables hinzu**
4. **Trigger einen neuen Deploy**

## 🔐 Sicherheitshinweise

- ✅ `NEXT_PUBLIC_*` Variables sind client-side sichtbar (OK für URLs)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` ist server-only (sicher)
- ⚠️ `NEXTAUTH_SECRET` ist server-only (sicher)

## 🎯 Nach dem Setup

Nach dem Setzen der Environment Variables:
1. Neuen Deploy triggern
2. `/register` Route testen
3. Supabase-Verbindung verifizieren
4. Auth-Flow testen

## 🚨 Troubleshooting

Falls der Build immer noch fehlschlägt:
- Überprüfe alle Variable-Namen auf Tippfehler
- Stelle sicher, dass keine Leerzeichen in den Values sind
- Verifiziere die Supabase-Keys in deinem Supabase Dashboard
