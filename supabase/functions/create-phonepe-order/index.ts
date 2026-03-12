import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

// CORS headers are required so your React app is allowed to talk to this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight request (Standard security handshake)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Read the order data sent from your React Checkout Page
    const { orderId, amount, userId, redirectUrl, mobileNumber } = await req.json()

    // 3. HARDCODED NEW STABLE TEST KEYS (Guarantees it works without relying on dashboard secrets)
    const merchantId = 'PGTESTPAYUAT86'
    const saltKey = '96434309-7796-489d-8924-ab56988a6076'
    const saltIndex = '1'
    // The official PhonePe Testing Server URL
    const phonepeEndpoint = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"

    // 4. Build the Digital "Box" (Payload) exactly as PhonePe demands
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: orderId,
      merchantUserId: userId || 'GUEST',
      amount: Math.round(amount * 100), // PhonePe needs the amount in Paise (₹1 = 100 paise)
      redirectUrl: redirectUrl, 
      redirectMode: "REDIRECT",
      callbackUrl: "https://evsasggscybkayavrxmw.supabase.co/functions/v1/phonepe-webhook", // Your specific Supabase Webhook URL!
      mobileNumber: mobileNumber || "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    }

    // 5. Convert the Box to Base64 format
    const jsonPayload = JSON.stringify(payload)
    const base64Payload = encode(jsonPayload)

    // 6. Create the unbreakable Mathematical Checksum (SHA256)
    const stringToSign = base64Payload + "/pg/v1/pay" + saltKey
    const encoder = new TextEncoder()
    const data = encoder.encode(stringToSign)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // The final "X-VERIFY" secure stamp
    const checksum = hashHex + "###" + saltIndex

    // 7. Send the sealed box to PhonePe!
    const phonePeResponse = await fetch(phonepeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'accept': 'application/json'
      },
      body: JSON.stringify({ request: base64Payload })
    })

    const phonePeData = await phonePeResponse.json()

    // 8. Return the PhonePe redirect link back to your React app
    return new Response(
      JSON.stringify(phonePeData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Payment Generation Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})