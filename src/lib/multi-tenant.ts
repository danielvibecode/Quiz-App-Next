import { headers } from 'next/headers'

/**
 * Multi-Tenant Konfiguration für die Volleyball-Quiz-App
 * Ermöglicht die Verwendung von benutzerdefinierten Domains und Subdomains für verschiedene Teams
 */

// Typen für die Multi-Tenant-Konfiguration
export type Tenant = {
  id: string
  name: string
  domain?: string
  subdomain?: string
  teamId: string
  customTheme?: {
    primaryColor: string
    secondaryColor: string
    logo?: string
  }
}

// Cache für Tenant-Informationen
let tenantsCache: Tenant[] | null = null

/**
 * Holt alle verfügbaren Tenants aus der Datenbank oder dem Cache
 */
export async function getAllTenants(): Promise<Tenant[]> {
  // Im Produktionsbetrieb würden wir die Tenants aus der Datenbank laden
  // Für jetzt verwenden wir eine statische Liste
  if (tenantsCache) return tenantsCache

  // Beispiel-Tenants (später aus der Datenbank laden)
  const tenants: Tenant[] = [
    {
      id: 'default',
      name: 'Volleyball Quiz App',
      subdomain: 'app',
      teamId: 'default',
      customTheme: {
        primaryColor: '#4f46e5',
        secondaryColor: '#818cf8'
      }
    }
    // Weitere Tenants würden hier hinzugefügt werden
  ]

  tenantsCache = tenants
  return tenants
}

/**
 * Ermittelt den aktuellen Tenant basierend auf der Domain/Subdomain
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  try {
    const headersList = headers()
    const host = headersList.get('host') || ''
    
    // Entferne Port-Nummer für lokale Entwicklung
    const hostname = host.split(':')[0]
    
    const tenants = await getAllTenants()
    
    // Prüfe auf exakte Domain-Übereinstimmung
    const domainTenant = tenants.find(t => t.domain === hostname)
    if (domainTenant) return domainTenant
    
    // Prüfe auf Subdomain
    const parts = hostname?.split('.') || []
    if (parts.length > 1) {
      const subdomain = parts[0]
      const subdomainTenant = tenants.find(t => t.subdomain === subdomain)
      if (subdomainTenant) return subdomainTenant
    }
    
    // Fallback auf Standard-Tenant
    return tenants.find(t => t.id === 'default') || null
  } catch (error) {
    console.error('Error determining current tenant:', error)
    return null
  }
}

/**
 * Generiert die URL für einen bestimmten Tenant
 */
export function getTenantUrl(tenant: Tenant): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  if (tenant.domain) {
    return `https://${tenant.domain}`
  }
  
  if (tenant.subdomain) {
    // Für lokale Entwicklung
    if (baseUrl.includes('localhost')) {
      return baseUrl
    }
    
    // Für Produktion mit Subdomain
    const baseDomain = baseUrl.replace(/^https?:\/\//, '').split('.').slice(-2).join('.')
    return `https://${tenant.subdomain}.${baseDomain}`
  }
  
  return baseUrl
}

/**
 * Middleware-Hilfsfunktion zur Überprüfung des Tenants
 */
export async function validateTenantAccess(teamId: string | null): Promise<boolean> {
  if (!teamId) return false
  
  const currentTenant = await getCurrentTenant()
  if (!currentTenant) return false
  
  // Prüfe, ob das Team zum aktuellen Tenant gehört
  return currentTenant.teamId === teamId || currentTenant.id === 'default'
}
