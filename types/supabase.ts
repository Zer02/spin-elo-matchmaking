// types/supabase.ts
// Manually maintained types — or replace with `supabase gen types typescript`

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:           string
          username:     string
          display_name: string | null
          avatar_url:   string | null
          created_at:   string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      leagues: {
        Row: {
          id:          string
          owner_id:    string
          name:        string
          slug:        string
          description: string | null
          is_public:   boolean
          season:      number
          created_at:  string
        }
        Insert: Omit<Database['public']['Tables']['leagues']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leagues']['Row']>
      }
      league_members: {
        Row: {
          id:            string
          league_id:     string
          profile_id:    string
          rating:        number
          uncertainty:   number
          season_wins:   number
          season_losses: number
          career_wins:   number
          career_losses: number
          joined_at:     string
        }
        Insert: Omit<Database['public']['Tables']['league_members']['Row'], 'id' | 'joined_at'>
        Update: Partial<Database['public']['Tables']['league_members']['Row']>
      }
      matches: {
        Row: {
          id:               string
          league_id:        string
          season:           number
          challenger_id:    string
          opponent_id:      string
          winner_id:        string | null
          challenger_score: number | null
          opponent_score:   number | null
          status:           'pending' | 'accepted' | 'completed' | 'declined' | 'disputed'
          quality:          number | null
          challenger_delta: number | null
          opponent_delta:   number | null
          notes:            string | null
          created_at:       string
          completed_at:     string | null
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['matches']['Row']>
      }
      elo_history: {
        Row: {
          id:          string
          league_id:   string
          profile_id:  string
          season:      number
          rating:      number
          match_id:    string | null
          recorded_at: string
        }
        Insert: Omit<Database['public']['Tables']['elo_history']['Row'], 'id' | 'recorded_at'>
        Update: Partial<Database['public']['Tables']['elo_history']['Row']>
      }
    }
    Views: {
      leaderboard: {
        Row: {
          league_id:       string
          profile_id:      string
          username:        string
          display_name:    string | null
          avatar_url:      string | null
          rating:          number
          uncertainty:     number
          season_wins:     number
          season_losses:   number
          career_wins:     number
          career_losses:   number
          league_name:     string
          league_slug:     string
          current_season:  number
        }
      }
    }
  }
}
