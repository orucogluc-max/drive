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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { drive_id, user_id } = await req.json();

    if (!drive_id || !user_id) {
      return new Response(JSON.stringify({ error: "Missing drive_id or user_id" }), { status: 400, headers: corsHeaders });
    }

    // Fetch the drive and user stats
    const { data: drive } = await supabaseClient.from('drives').select('*').eq('id', drive_id).single();
    const { data: profile } = await supabaseClient.from('profiles').select('total_drives, total_distance_m').eq('id', user_id).single();
    const { data: allBadges } = await supabaseClient.from('badges').select('*');
    const { data: userBadges } = await supabaseClient.from('user_badges').select('badge_id').eq('user_id', user_id);

    if (!drive || !profile || !allBadges) {
       return new Response(JSON.stringify({ error: "Data fetch failed" }), { status: 500, headers: corsHeaders });
    }

    const earnedBadgeIds = new Set(userBadges?.map(b => b.badge_id) || []);
    const newlyEarned = [];

    // Helper
    const award = async (badgeName: string) => {
      const b = allBadges.find(x => x.name === badgeName);
      if (b && !earnedBadgeIds.has(b.id)) {
        await supabaseClient.from('user_badges').insert({ user_id, badge_id: b.id, drive_id });
        
        // Notify the user
        await supabaseClient.from('notifications').insert({
          recipient_id: user_id,
          type: 'badge_earned',
          entity_id: b.id,
          message: `You earned a new badge: ${badgeName}!`,
        });

        newlyEarned.push(badgeName);
        earnedBadgeIds.add(b.id);
      }
    };

    // 1. First Drive
    if (profile.total_drives === 1) {
      await award('First Drive');
    }

    // 2. 100KM Club
    if (profile.total_distance_m >= 100000) {
      await award('100KM Club');
    }

    // 3. Night Rider
    const hour = new Date(drive.started_at).getUTCHours(); 
    // Roughly 0-5 AM UTC (depends on local, but simple for now)
    if (hour >= 0 && hour <= 5) {
      await award('Night Rider');
    }

    // 4. Community Pillar (Event participant)
    if (drive.event_id) {
      const { count: eventDrivesCount } = await supabaseClient
        .from('drives')
        .select('*', { count: 'exact' })
        .eq('user_id', user_id)
        .not('event_id', 'is', null);
      
      if (eventDrivesCount && eventDrivesCount >= 3) {
        await award('Community Pillar');
      }
    }

    // 5. Consistent Driver
    if (drive.score_consistency && drive.score_consistency >= 90) {
      const { data: consistentDrives } = await supabaseClient
        .from('drives')
        .select('id')
        .eq('user_id', user_id)
        .gte('score_consistency', 90)
        .limit(3);
        
      if (consistentDrives && consistentDrives.length >= 3) {
        await award('Consistent Driver');
      }
    }

    return new Response(JSON.stringify({ success: true, newlyEarned }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
