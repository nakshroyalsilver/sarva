import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('MASTER_SERVICE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Get the raw body from PhonePe
    const body = await req.json()
    
    // 2. Decode the Base64 response
    const decodedString = atob(body.response)
    const responseData = JSON.parse(decodedString)
    
    console.log("Full PhonePe Response:", responseData)

    const orderIdNoDashes = responseData.data.merchantTransactionId
    const isSuccess = responseData.success && responseData.code === 'PAYMENT_SUCCESS'

    if (isSuccess) {
      console.log("Payment was successful for ID:", orderIdNoDashes)
      
      // Fetch orders to find the match
      const { data: allOrders, error: fetchError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'Pending Payment');

      if (fetchError) console.error("Fetch Error:", fetchError)

      const matchingOrder = allOrders?.find(o => o.id.replace(/-/g, '') === orderIdNoDashes);

      if (matchingOrder) {
        const { data, error: updateError } = await supabase
          .from('orders')
          .update({ status: 'Placed' })
          .eq('id', matchingOrder.id)
          .select();
          
        if (updateError) console.error("Update Error:", updateError)
        console.log("✅ Success! Updated order to Placed:", matchingOrder.id);
      } else {
        console.error("❌ No matching order found in database for:", orderIdNoDashes);
      }
    } else {
      console.warn("⚠️ Payment was NOT successful:", responseData.code)
    }

    return new Response(JSON.stringify({ status: 'received' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("💥 Webhook Crash Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})