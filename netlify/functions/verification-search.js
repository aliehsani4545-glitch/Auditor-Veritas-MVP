import { createClient } from '@supabase/supabase-js'
import CryptoJS from 'crypto-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { piiData, processorId } = event.queryStringParameters

    if (!piiData) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'piiData query parameter is required' })
      }
    }

    console.log('Searching for PII:', piiData.substring(0, 10) + '...')

    // Hash the PII data using SHA-256
    const piiHash = CryptoJS.SHA256(piiData.trim().toLowerCase()).toString(CryptoJS.enc.Hex)
    console.log('Generated hash:', piiHash)

    // Build query
    let query = supabase
      .from('audit_events')
      .select(`
        *,
        processors (company_name, email)
      `)
      .eq('pii_hash', piiHash)

    if (processorId) {
      query = query.eq('processor_id', processorId)
    }

    const { data: events, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Search error:', error)
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Search failed: ' + error.message })
      }
    }

    console.log('Found events:', events?.length || 0)

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        piiHash,
        matches: events || [],
        count: events ? events.length : 0
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