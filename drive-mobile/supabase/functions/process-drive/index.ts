import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { drive_id, telemetry_summary } = await req.json();

    if (!drive_id) {
      return new Response(JSON.stringify({ error: "Missing drive_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1. In a real system, we might query telemetry_points for this drive_id
    // But for this sprint, we assume the client passed `telemetry_summary` 
    // containing total g-force, standard deviation of speed etc.
    // Or we compute it centrally.

    // Let's assume we calculate it directly using the summary
    const avgG = telemetry_summary.avgG || 0.1;
    const stdDevSpeed = telemetry_summary.stdDevSpeed || 2;
    const avgVerticalG = telemetry_summary.avgVerticalG || 0.05;

    let smoothness = 100 - (avgG / 0.3) * 100;
    smoothness = Math.max(0, Math.min(100, smoothness));

    let comfort = 100 - (avgVerticalG / 0.15) * 100;
    comfort = Math.max(0, Math.min(100, comfort));

    let consistency = 100 - (stdDevSpeed / 5) * 50;
    consistency = Math.max(0, Math.min(100, consistency));

    const efficiency = (smoothness + consistency) / 2;
    const overall = (smoothness * 0.35) + (consistency * 0.25) + (comfort * 0.25) + (efficiency * 0.15);

    // 2. Update the drives table
    const { data: updatedDrive, error: updateError } = await supabaseClient
      .from('drives')
      .update({
        score_smoothness: Math.round(smoothness),
        score_consistency: Math.round(consistency),
        score_comfort: Math.round(comfort),
        score_efficiency: Math.round(efficiency),
        score_overall: Math.round(overall),
        status: 'completed'
      })
      .eq('id', drive_id)
      .select('user_id')
      .single();

    if (updateError) throw updateError;

    // 3. Trigger Gamification Engine & Rule-Based Coach
    if (updatedDrive?.user_id) {
      // Don't await them, fire and forget
      supabaseClient.functions.invoke('gamification-engine', {
        body: { drive_id, user_id: updatedDrive.user_id }
      }).catch(err => console.error("Gamification error:", err));

      supabaseClient.functions.invoke('rule-based-coach', {
        body: { drive_id, user_id: updatedDrive.user_id }
      }).catch(err => console.error("Coach error:", err));
    }

    return new Response(
      JSON.stringify({ 
        message: "Drive processed successfully",
        scores: { smoothness, consistency, comfort, efficiency, overall } 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
