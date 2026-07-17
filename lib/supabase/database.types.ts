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
          business_status: string;
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
          business_status?: string;
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
      website_error_feedback: {
        Row: {
          id: string;
          page_url: string;
          message: string;
          submitter_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_url: string;
          message: string;
          submitter_name?: string | null;
          created_at?: string;
        };
        Update: {
          page_url?: string;
          message?: string;
          submitter_name?: string | null;
        };
        Relationships: [];
      };
      course_plans: {
        Row: {
          id: string;
          login_key: string;
          display_name: string;
          majors: string[];
          plan: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          login_key: string;
          display_name: string;
          majors: string[];
          plan: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["course_plans"]["Insert"]>;
        Relationships: [];
      };
      contact_presence: {
        Row: {
          id: string;
          city: "losAngeles" | "london" | "hongKong" | null;
          is_travelling: boolean;
          message: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          city?: "losAngeles" | "london" | "hongKong" | null;
          is_travelling?: boolean;
          message?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_presence"]["Insert"]>;
        Relationships: [];
      };
      recipe_drafts: {
        Row: {
          id: string;
          description: string;
          image_urls: string[];
          thumbnail_url: string | null;
          status: string;
          recipe_date: string | null;
          categories: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          image_urls: string[];
          thumbnail_url?: string | null;
          status?: string;
          recipe_date?: string | null;
          categories?: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["recipe_drafts"]["Insert"]>;
        Relationships: [];
      };
      recipe_card_overrides: {
        Row: {
          recipe_key: string;
          title: string;
          description: string;
          recipe_date: string | null;
          categories: string[];
          ingredient_groups: Json;
          method_groups: Json;
          linked_recipe_keys: string[];
          thumbnail_url: string | null;
          thumbnail_position: string | null;
          thumbnail_zoom: number | null;
          thumbnail_time_seconds: number | null;
          media_items: Json;
          deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          recipe_key: string;
          title: string;
          description: string;
          recipe_date?: string | null;
          categories?: string[];
          ingredient_groups?: Json;
          method_groups?: Json;
          linked_recipe_keys?: string[];
          thumbnail_url?: string | null;
          thumbnail_position?: string | null;
          thumbnail_zoom?: number | null;
          thumbnail_time_seconds?: number | null;
          media_items?: Json;
          deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["recipe_card_overrides"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_course_plan: {
        Args: { p_login_key: string };
        Returns: Database["public"]["Tables"]["course_plans"]["Row"];
      };
      upsert_course_plan: {
        Args: { p_login_key: string; p_display_name: string; p_majors: string[]; p_plan: Json };
        Returns: Database["public"]["Tables"]["course_plans"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
