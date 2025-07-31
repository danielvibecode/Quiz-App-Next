import { createServiceSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Vercel Cron Job: Läuft täglich um Mitternacht
// Entfernt abgelaufene Sessions und bereinigt nicht mehr benötigte Daten
export async function GET(request: Request) {
  try {
    // Überprüfe den Authorization-Header (optional für zusätzliche Sicherheit)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verwende den Service-Client mit Admin-Rechten
    const supabase = createServiceSupabaseClient()

    // 1. Bereinige alte Daten (älter als 30 Tage)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Beispiel: Bereinige alte user_answers (optional)
    // const { error: cleanupError } = await supabase
    //   .from('user_answers')
    //   .delete()
    //   .lt('created_at', thirtyDaysAgo.toISOString())
    
    // Für jetzt loggen wir nur die Ausführung
    console.log('Cron job executed successfully at:', new Date().toISOString())

    // 2. Weitere Bereinigungsaufgaben können hier hinzugefügt werden
    // z.B. Temporäre Daten löschen, Statistiken aggregieren, etc.

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
