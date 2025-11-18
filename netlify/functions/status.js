import { createClient } from '@supabase/supabase-js'

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
    const { procId } = event.queryStringParameters

    if (!procId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'procId parameter is required' })
      }
    }

    // Get processor info
    const { data: processor, error: processorError } = await supabase
      .from('processors')
      .select('*')
      .eq('id', procId)
      .single()

    if (processorError || !processor) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Processor not found' })
      }
    }

    // Check last activity (if no activity in 48h, status is RED)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const lastActivity = new Date(processor.last_activity)
    const status = lastActivity > fortyEightHoursAgo ? 'GREEN' : 'RED'

    // Get recent activity count (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { count, error: countError } = await supabase
      .from('audit_events')
      .select('*', { count: 'exact', head: true })
      .eq('processor_id', procId)
      .gte('created_at', twentyFourHoursAgo)

    if (countError) {
      console.error('Count error:', countError)
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        processorId: processor.id,
        status,
        lastActivity: processor.last_activity,
        activity24h: count || 0,
        companyName: processor.company_name,
        plan: processor.plan
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