import { createClient } from '@supabase/supabase-js'
import CryptoJS from 'crypto-js'

// --- KORRIGERAD PLACERING: Funktioner som används måste definieras först ---
function getMonthlyLimit(plan) {
  const limits = {
    starter: 10000,
    growth: 100000,
    enterprise: 1000000
  }
  return limits[plan] || limits.starter
}
// --------------------------------------------------------------------------

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
        'Access-Control-Allow-Headers': 'Content-Type'
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

  try {
    const { companyName, email, plan = 'starter' } = JSON.parse(event.body)

    if (!companyName || !email) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Company name and email required' })
      }
    }

    console.log('Creating processor:', companyName, email)

    // Generate API key
    const apiKey = `av_${Date.now()}_${Math.random().toString(36).substring(2)}`
    
    // Hasha API-nyckeln innan lagring
    const apiKeyHash = CryptoJS.SHA256(apiKey).toString(CryptoJS.enc.Hex)
    
    // Insert processor med HASHAD API key
    const { data: processor, error } = await supabase
      .from('processors')
      .insert([
        {
          company_name: companyName,
          email: email,
          api_key_hash: apiKeyHash, // ✅ Lagrar hash, inte klartext
          plan: plan,
          monthly_limit: getMonthlyLimit(plan), // ✅ Anropet är nu korrekt
          last_activity: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      
      // If processor already exists, return existing one
      if (error.code === '23505') {
        const { data: existingProcessor } = await supabase
          .from('processors')
          .select('*')
          .eq('email', email)
          .single()
          
        if (existingProcessor) {
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
              processorId: existingProcessor.id,
              apiKey: 'API_KEY_ALREADY_EXISTS_PLEASE_USE_EXISTING', // ✅ Säker
              companyName: existingProcessor.company_name,
              plan: existingProcessor.plan,
              message: 'Processor already exists. Please use your existing API key or contact support.'
            })
          }
        }
      }
      
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed to create processor: ' + error.message })
      }
    }

    console.log('Processor created:', processor.id)

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        processorId: processor.id,
        apiKey: apiKey, // ✅ Returnerar klartext ENDAST här för användaren
        companyName: processor.company_name,
        plan: processor.plan,
        message: '✅ Save this API key securely - it will not be shown again'
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