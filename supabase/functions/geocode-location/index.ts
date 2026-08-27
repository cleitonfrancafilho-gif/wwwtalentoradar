import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const googleMapsApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    const authHeader = req.headers.get("Authorization") ?? "";

    if (!supabaseUrl || !supabaseAnonKey || !lovableApiKey || !googleMapsApiKey) {
      return json({ error: "missing_env" }, 500);
    }
    if (!authHeader.toLowerCase().startsWith("bearer ")) return json({ error: "unauthorized" }, 401);

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return json({ error: "unauthorized" }, 401);

    const payload = await req.json();
    const country = typeof payload.country === "string" ? payload.country.trim().slice(0, 100) : "";
    const state = typeof payload.state === "string" ? payload.state.trim().slice(0, 100) : "";
    const city = typeof payload.city === "string" ? payload.city.trim().slice(0, 100) : "";
    if (!country || !city) return json({ error: "country_and_city_required" }, 400);

    const address = [city, state, country].filter(Boolean).join(", ");
    const response = await fetch(
      `https://connector-gateway.lovable.dev/google_maps/maps/api/geocode/json?address=${encodeURIComponent(address)}`,
      {
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "X-Connection-Api-Key": googleMapsApiKey,
        },
      },
    );

    if (!response.ok) {
      const details = await response.text();
      console.error(`Google Maps geocoding failed [${response.status}]: ${details}`);
      return json({ error: "geocoding_failed", status: response.status, details }, response.status);
    }

    const result = await response.json();
    if (result.status !== "OK" || !result.results?.[0]?.geometry?.location) {
      return json({ error: "location_not_found", details: result.status }, 422);
    }

    const location = result.results[0].geometry.location;
    return json({
      latitude: Number(location.lat),
      longitude: Number(location.lng),
      formattedAddress: result.results[0].formatted_address,
    });
  } catch (error) {
    console.error("geocode-location failed", error);
    return json({ error: error instanceof Error ? error.message : "unknown_error" }, 500);
  }
});