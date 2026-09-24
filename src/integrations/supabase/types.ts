export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string;
          admin_name: string;
          created_at: string;
          id: string;
        };
        Insert: {
          action: string;
          admin_name?: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          action?: string;
          admin_name?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          button_link: string;
          button_text: string;
          created_at: string;
          eyebrow: string;
          id: string;
          image: string;
          is_active: boolean;
          placement: string;
          sort_order: number;
          subtitle: string;
          title: string;
        };
        Insert: {
          button_link?: string;
          button_text?: string;
          created_at?: string;
          eyebrow?: string;
          id?: string;
          image?: string;
          is_active?: boolean;
          placement?: string;
          sort_order?: number;
          subtitle?: string;
          title?: string;
        };
        Update: {
          button_link?: string;
          button_text?: string;
          created_at?: string;
          eyebrow?: string;
          id?: string;
          image?: string;
          is_active?: boolean;
          placement?: string;
          sort_order?: number;
          subtitle?: string;
          title?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          banner_cta: string;
          banner_image: string;
          banner_subtitle: string;
          banner_title: string;
          created_at: string;
          description: string;
          icon: string;
          id: string;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          banner_cta?: string;
          banner_image?: string;
          banner_subtitle?: string;
          banner_title?: string;
          created_at?: string;
          description?: string;
          icon?: string;
          id: string;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          banner_cta?: string;
          banner_image?: string;
          banner_subtitle?: string;
          banner_title?: string;
          created_at?: string;
          description?: string;
          icon?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      homepage_sections: {
        Row: {
          eyebrow: string;
          id: string;
          is_active: boolean;
          item_limit: number;
          key: string;
          sort_order: number;
          subtitle: string;
          title: string;
        };
        Insert: {
          eyebrow?: string;
          id?: string;
          is_active?: boolean;
          item_limit?: number;
          key: string;
          sort_order?: number;
          subtitle?: string;
          title?: string;
        };
        Update: {
          eyebrow?: string;
          id?: string;
          is_active?: boolean;
          item_limit?: number;
          key?: string;
          sort_order?: number;
          subtitle?: string;
          title?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          created_at: string;
          id: string;
          item_count: number;
          items: Json;
          note: string;
          status: string;
          total: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_count?: number;
          items?: Json;
          note?: string;
          status?: string;
          total?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_count?: number;
          items?: Json;
          note?: string;
          status?: string;
          total?: number;
        };
        Relationships: [];
      };
      media: {
        Row: {
          created_at: string;
          id: string;
          mime_type: string;
          name: string;
          path: string;
          size: number;
          uploaded_by: string | null;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          mime_type?: string;
          name: string;
          path: string;
          size?: number;
          uploaded_by?: string | null;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          mime_type?: string;
          name?: string;
          path?: string;
          size?: number;
          uploaded_by?: string | null;
          url?: string;
        };
        Relationships: [];
      };
      nav_items: {
        Row: {
          id: string;
          is_active: boolean;
          label: string;
          path: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          is_active?: boolean;
          label: string;
          path: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          is_active?: boolean;
          label?: string;
          path?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      products: {
        Row: {
          added_at: string;
          availability: string;
          brand: string;
          category_id: string | null;
          condition: string;
          created_at: string;
          description: string;
          id: string;
          image: string;
          images: string[];
          in_stock: boolean;
          is_active: boolean;
          is_best_seller: boolean;
          is_clearance: boolean;
          is_deal: boolean;
          is_featured: boolean;
          is_new_arrival: boolean;
          is_top_pick: boolean;
          name: string;
          price: number;
          rating: number;
          reviews: number;
          seller: string;
          sku: string;
          sold: number;
          spec: string;
          stock: number;
          tag: string;
          updated_at: string;
          was_price: number;
        };
        Insert: {
          added_at?: string;
          availability?: string;
          brand?: string;
          category_id?: string | null;
          condition?: string;
          created_at?: string;
          description?: string;
          id: string;
          image?: string;
          images?: string[];
          in_stock?: boolean;
          is_active?: boolean;
          is_best_seller?: boolean;
          is_clearance?: boolean;
          is_deal?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_top_pick?: boolean;
          name: string;
          price?: number;
          rating?: number;
          reviews?: number;
          seller?: string;
          sku?: string;
          sold?: number;
          spec?: string;
          stock?: number;
          tag?: string;
          updated_at?: string;
          was_price?: number;
        };
        Update: {
          added_at?: string;
          availability?: string;
          brand?: string;
          category_id?: string | null;
          condition?: string;
          created_at?: string;
          description?: string;
          id?: string;
          image?: string;
          images?: string[];
          in_stock?: boolean;
          is_active?: boolean;
          is_best_seller?: boolean;
          is_clearance?: boolean;
          is_deal?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_top_pick?: boolean;
          name?: string;
          price?: number;
          rating?: number;
          reviews?: number;
          seller?: string;
          sku?: string;
          sold?: number;
          spec?: string;
          stock?: number;
          tag?: string;
          updated_at?: string;
          was_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          is_active: boolean;
          name: string;
        };
        Insert: {
          created_at?: string;
          email?: string;
          id: string;
          is_active?: boolean;
          name?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          address: string;
          cart_enabled: boolean;
          copyright_text: string;
          email: string;
          facebook: string;
          favicon_url: string;
          favorites_enabled: boolean;
          footer_description: string;
          id: string;
          instagram: string;
          logo_url: string;
          max_qty_per_product: number;
          phone: string;
          store_description: string;
          store_name: string;
          tiktok: string;
          updated_at: string;
          whatsapp_message: string;
          whatsapp_number: string;
          x_url: string;
          youtube: string;
        };
        Insert: {
          address?: string;
          cart_enabled?: boolean;
          copyright_text?: string;
          email?: string;
          facebook?: string;
          favicon_url?: string;
          favorites_enabled?: boolean;
          footer_description?: string;
          id?: string;
          instagram?: string;
          logo_url?: string;
          max_qty_per_product?: number;
          phone?: string;
          store_description?: string;
          store_name?: string;
          tiktok?: string;
          updated_at?: string;
          whatsapp_message?: string;
          whatsapp_number?: string;
          x_url?: string;
          youtube?: string;
        };
        Update: {
          address?: string;
          cart_enabled?: boolean;
          copyright_text?: string;
          email?: string;
          facebook?: string;
          favicon_url?: string;
          favorites_enabled?: boolean;
          footer_description?: string;
          id?: string;
          instagram?: string;
          logo_url?: string;
          max_qty_per_product?: number;
          phone?: string;
          store_description?: string;
          store_name?: string;
          tiktok?: string;
          updated_at?: string;
          whatsapp_message?: string;
          whatsapp_number?: string;
          x_url?: string;
          youtube?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "super_admin" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin"],
    },
  },
} as const;
