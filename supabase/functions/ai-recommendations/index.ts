import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WatchlistItem {
  id: number;
  title: string;
  media_type: 'movie' | 'tv';
  genres?: string[];
  vote_average?: number;
}

interface RecommendationRequest {
  watchlist: WatchlistItem[];
  continueWatching?: WatchlistItem[];
  mood?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { watchlist, continueWatching, mood } = await req.json() as RecommendationRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    // Build context from user's watchlist and viewing history
    const watchlistTitles = watchlist?.map(item => 
      `${item.title} (${item.media_type})`
    ).join(', ') || 'None';

    const recentlyWatching = continueWatching?.map(item => 
      `${item.title} (${item.media_type})`
    ).join(', ') || 'None';

    const moodContext = mood ? `The user is in the mood for: ${mood}` : '';

    const systemPrompt = `You are a movie and TV show recommendation expert. Based on the user's watchlist and viewing history, suggest 5 personalized recommendations. 

Be specific and explain WHY each recommendation fits their taste. Consider:
- Similar genres and themes
- Directors and actors they might like
- Hidden gems they may have missed
- Mix of popular and lesser-known titles

Format your response as a JSON object with this structure:
{
  "recommendations": [
    {
      "title": "Movie/Show Title",
      "type": "movie" or "tv",
      "year": 2023,
      "reason": "Brief explanation why they'd love this",
      "matchScore": 85
    }
  ],
  "summary": "A brief personalized message about their taste"
}`;

    const userPrompt = `Based on my preferences, give me personalized recommendations:

My Watchlist: ${watchlistTitles}
Currently Watching: ${recentlyWatching}
${moodContext}

Give me 5 recommendations that match my taste. Be specific about why each fits my preferences.`;

    console.log("Calling Lovable AI for recommendations...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI recommendations");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    console.log("AI response received:", content?.substring(0, 200));

    // Parse the JSON response from AI
    let recommendations;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      recommendations = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a fallback structure
      recommendations = {
        recommendations: [],
        summary: content || "Unable to generate recommendations at this time.",
        raw: content
      };
    }

    return new Response(
      JSON.stringify(recommendations),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-recommendations:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        recommendations: [],
        summary: "Unable to generate recommendations. Please try again."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
