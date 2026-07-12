import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { drive_id, user_id } = await req.json();

    if (!drive_id || !user_id) {
      return new Response(JSON.stringify({ error: "Missing drive_id or user_id" }), { status: 400, headers: corsHeaders });
    }

    // Fetch the current drive
    const { data: currentDrive, error: driveError } = await supabaseClient
      .from('drives')
      .select('score_smoothness, score_consistency, duration_s, distance_m, started_at, max_speed_kmh, telemetry_count')
      .eq('id', drive_id)
      .single();

    if (driveError || !currentDrive) throw driveError || new Error("Drive not found");

    // Fetch user's previous completed drives (up to 10 for baseline)
    const { data: pastDrives } = await supabaseClient
      .from('drives')
      .select('score_smoothness, score_consistency, max_speed_kmh')
      .eq('user_id', user_id)
      .eq('status', 'completed')
      .neq('id', drive_id)
      .order('started_at', { ascending: false })
      .limit(10);

    const insights = [];

    // Rule 1: High Smoothness compared to history
    if (pastDrives && pastDrives.length >= 3) {
      const avgSmoothness = pastDrives.reduce((sum, d) => sum + (d.score_smoothness || 0), 0) / pastDrives.length;
      if (currentDrive.score_smoothness && currentDrive.score_smoothness > avgSmoothness + 5) {
        insights.push({
          drive_id,
          user_id,
          rule_id: 'SMOOTH_IMPROVEMENT',
          metric_name: 'score_smoothness',
          message: `Harika! Bu sürüşün son ${pastDrives.length} sürüşüne göre çok daha akıcıydı.`,
          importance: 'success',
          confidence: 0.9
        });
      } else if (currentDrive.score_smoothness && currentDrive.score_smoothness < avgSmoothness - 10) {
        insights.push({
          drive_id,
          user_id,
          rule_id: 'SMOOTH_DECLINE',
          metric_name: 'score_smoothness',
          message: 'Bu sürüşte geçmiş ortalamana göre daha fazla dalgalanma kaydettik.',
          importance: 'warning',
          confidence: 0.9
        });
      }
    }

    // Rule 2: Night Drive Caution (Just an observation, no AI needed)
    const hour = new Date(currentDrive.started_at).getUTCHours();
    if (hour >= 0 && hour <= 5) {
      insights.push({
        drive_id,
        user_id,
        rule_id: 'NIGHT_DRIVE',
        metric_name: 'time_of_day',
        message: 'Gece sürüşleri dikkatin daha çabuk dağılmasına yol açabilir. Dinlenmeyi unutma.',
        importance: 'info',
        confidence: 1.0
      });
    }

    // Rule 3: High speed vs Telemetry density
    // If telemetry count is very low for distance, maybe GPS issue
    const gpsRate = currentDrive.telemetry_count / (currentDrive.distance_m || 1);
    if (gpsRate < 0.01 && currentDrive.distance_m > 1000) {
      insights.push({
        drive_id,
        user_id,
        rule_id: 'LOW_GPS_QUALITY',
        metric_name: 'telemetry_count',
        message: 'Sürüş sırasında GPS sinyalinde kopmalar yaşandı, istatistikler yaklaşık değerlerdir.',
        importance: 'warning',
        confidence: 0.95
      });
    }

    // Insert insights if any
    if (insights.length > 0) {
      const { error: insertError } = await supabaseClient.from('drive_insights').insert(insights);
      if (insertError) console.error("Error inserting insights:", insertError);
    }

    return new Response(JSON.stringify({ success: true, insights }), { headers: corsHeaders, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
});
