"use client";

import { Card, CardBig } from "@/design-system";
import { isImgAvatar } from "@/lib/migrate";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProfileCardProps = {
  profile: Profile;
  selected?: boolean;
  onSelect: () => void;
  onEdit: () => void;
};

export function ProfileCard({ profile, selected, onSelect, onEdit }: ProfileCardProps) {
  return (
    <div className="profileHolder relative flex w-full">
      <Card variant="profile" selected={selected} onClick={onSelect} className="w-full">
        {isImgAvatar(profile.avatar) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar}
            alt=""
            className="face aspect-square w-[58%] rounded-full border-4 border-[#CDE7FB] object-cover shadow-md"
          />
        ) : (
          <CardBig>{profile.avatar || "🙂"}</CardBig>
        )}
        <span>{profile.name}</span>
      </Card>
      <button
        type="button"
        className="editPencil absolute left-1.5 top-1.5 z-[3] flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[15px] shadow-md"
        title="ערוך פרופיל"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        ✏️
      </button>
    </div>
  );
}

export function AddProfileCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="profileHolder flex w-full">
      <Card variant="addProfile" onClick={onClick} className="w-full">
        <CardBig>➕</CardBig>
        <span>פרופיל חדש</span>
      </Card>
    </div>
  );
}

export function AvatarFace({
  avatar,
  className,
  size = 22,
}: {
  avatar: string;
  className?: string;
  size?: number;
}) {
  if (isImgAvatar(avatar)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt=""
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span className={className} style={{ fontSize: size }}>
      {avatar || "🙂"}
    </span>
  );
}
