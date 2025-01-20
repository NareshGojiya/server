// functions/apiCall.js
const axios = require('axios')

const handler = async (event, context) => {
  // Fetch allowed origins from environment variable
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []
  
  const origin = event.headers.origin || ''
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*', // Allow specific or any origin
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (event.httpMethod === 'OPTIONS') {
    // Handle preflight request (CORS)
    return {
      statusCode: 204,
      headers, // Return CORS headers for preflight
    }
  }

  if (event.httpMethod === 'POST') {
    const { customer_username, customer_mobile, customer_email, customer_feedback } = JSON.parse(event.body)

    try {
      const response = await axios.post(
        'https://script.google.com/macros/s/AKfycbwhe55LrbISXTYYJI4V6PeSfXTTxxYUSSieERlw89DEFE7vdokhtR_T2pNrnwUrne70Fw/exec',
        {
          sheetData: [
            {
              firstName: customer_username,
              mobile: customer_mobile,
              email: customer_email,
              feedback: customer_feedback,
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      )

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data),
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message }),
      }
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  }
}

exports.handler = handler
