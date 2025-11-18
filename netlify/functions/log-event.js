import { createClient } from '@supabase/supabase-js'
import CryptoJS from 'crypto-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key'
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  console.log('Log Event received:', event.body)

  try {
    const apiKey = event.headers['x-api-key']
    if (!apiKey) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'API key required' })
      }
    }

    // ✅ KORRIGERAD: Hasha API-nyckeln innan validering
    const apiKeyHash = CryptoJS.SHA256(apiKey).toString(CryptoJS.enc.Hex)
    
    // Validate API key med hash
    const { data: processor, error: processorError } = await supabase
      .from('processors')
      .select('*')
      .eq('api_key_hash', apiKeyHash) // ✅ Jämför med hash, inte klartext
      .single()

    if (processorError || !processor) {
      console.log('Invalid API key')
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid API key' })
      }
    }

    const { eventType, piiHash } = JSON.parse(event.body)

    if (!eventType || !piiHash) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields: eventType, piiHash' })
      }
    }

    // Validate SHA-256 format
    if (!/^[a-f0-9]{64}$/i.test(piiHash)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid PII hash format. Must be SHA-256 hex string.' })
      }
    }

    // Insert audit event
    const { data: eventData, error: eventError } = await supabase
      .from('audit_events')
      .insert([
        {
          processor_id: processor.id,
          event_type: eventType,
          pii_hash: piiHash,
          signature: 'signature-' + Date.now()
        }
      ])
      .select()
      .single()

    if (eventError) {
      console.error('Database error:', eventError)
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed to log event: ' + eventError.message })
      }
    }

    // Update processor's last activity
    await supabase
      .from('processors')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', processor.id)

    console.log('Event logged successfully:', eventData.id)

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        status: 'success',
        eventId: eventData.id,
        timestamp: eventData.created_at
      })
    }

  } catch (error) {
    console.error('Server error:', error)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error: ' + error.message })
    }
  }
}