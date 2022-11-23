import Avatar from "@/components/Avatar";
import { Database } from "@/utils/database.types";
import {
  Session,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
type UserProfile = Database["public"]["Tables"]["user_profile_table"]["Row"];

export default function Account({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<UserProfile["username"]>(null);
  const [avatar_url, setAvatarUrl] = useState<UserProfile["avatar_url"]>(null);
  const [full_name, setFullname] = useState<UserProfile["full_name"]>(null);

  useEffect(() => {
    getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!user) throw new Error("No user");

      const { data, error, status } = await supabase
        .from("user_profile_table")
        .select(`username, full_name, avatar_url`)
        .eq("user_id", user.id)
        .single();

      if (!data) {
        // if no data, initialize a user_profile for current user
        // id
        // updated_at - no need since DEFAULT NOW() is used
        // username
        // full_name
        // avatar_url
        console.log(user);
        const { error } = await supabase.from("user_profile_table").insert({
          user_id: user.id,
          username: "",
          full_name: "",
          avatar_url: "",
        });
        if (error) {
          console.log(error);
        }
        console.log("success");
      }

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setFullname(data.full_name);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert("Error loading user data!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    full_name,
    avatar_url,
  }: {
    username: UserProfile["username"];
    full_name: UserProfile["full_name"];
    avatar_url: UserProfile["avatar_url"];
  }) {
    try {
      setLoading(true);
      if (!user) throw new Error("No user");

      const updates = {
        user_id: user.id,
        username,
        full_name,
        avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_profile_table")
        .upsert(updates);
      if (error) throw error;
      alert("Profile updated!");
    } catch (error) {
      alert("Error updating the data!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-widget">
      <Avatar
        uid={session.user.id}
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          setAvatarUrl(url);
          updateProfile({ username, full_name, avatar_url: url });
        }}
      />
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username || ""}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="fullname">Full Name</label>
        <input
          id="full_name"
          type="text"
          value={full_name || ""}
          onChange={(e) => setFullname(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button primary block"
          onClick={() => updateProfile({ username, full_name, avatar_url })}
          disabled={loading}
        >
          {loading ? "Loading ..." : "Update"}
        </button>
      </div>

      <div>
        <button
          className="button block"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
