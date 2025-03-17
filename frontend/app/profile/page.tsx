import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/profile-form";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Profile | BlogMind",
  description: "Manage your profile settings",
};

export default async function ProfilePage() {
  const cookieStore = await cookies(); // Ensure cookies() is awaited
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login?redirect=/profile");
  }

  return (
    <div className="container max-w-screen-lg py-12">
      <ProfileForm />
    </div>
  );
}
