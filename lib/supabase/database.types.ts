export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          place_id: string | null;
          name: string;
          category: string;
          tags: string[];
          emoji: string;
          area: string | null;
          city: string | null;
          country: string | null;
          address: string | null;
          description: string | null;
          source_lists: string[];
          match_confidence: number | null;
          primary_type: string | null;
          place_types: string[];
          price_level: number | null;
          price_level_source: string | null;
          price_per_person_usd: number | null;
          latitude: number;
          longitude: number;
          google_maps_url: string | null;
          opening_hours: Json | null;
          hours_updated_at: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          place_id?: string | null;
          name: string;
          category?: string;
          tags?: string[];
          emoji?: string;
          area?: string | null;
          city?: string | null;
          country?: string | null;
          address?: string | null;
          description?: string | null;
          source_lists?: string[];
          match_confidence?: number | null;
          primary_type?: string | null;
          place_types?: string[];
          price_level?: number | null;
          price_level_source?: string | null;
          price_per_person_usd?: number | null;
          latitude: number;
          longitude: number;
          google_maps_url?: string | null;
          opening_hours?: Json | null;
          hours_updated_at?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["restaurants"]["Insert"]>;
        Relationships: [];
      };
      restaurant_recommendations: {
        Row: {
          id: string;
          restaurant_name: string;
          location: string;
          message: string;
          submitter_name: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_name: string;
          location: string;
          message: string;
          submitter_name?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          restaurant_name?: string;
          location?: string;
          message?: string;
          submitter_name?: string | null;
          status?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
