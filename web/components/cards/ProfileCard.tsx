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
      <Card variant="profile" selected={selected} onClick={onSelect}>
        {isImgAvatar(profile.avatar) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar}
            alt=""
            className="face aspect-square w-[66%] min-h-0 flex-1 rounded-full border-[3px] border-[#CDE7FB] object-cover shadow-md"
          />
        ) : (
          <CardBig>{profile.avatar || "🙂"}</CardBig>
        )}
        <span className="shrink-0">{profile.name}</span>
      </Card>
      <button
        type="button"
        className="profileEditBtn absolute left-2 top-2 z-[3] flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[#5a7a94] shadow-[0_1px_3px_rgba(29,78,122,.12)] backdrop-blur-sm transition-colors hover:bg-white hover:text-[#1d4e7a] active:scale-95"
        title="הגדרות שחקן"
        aria-label={`הגדרות של ${profile.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 20h9" />
          <path d="M16.45 3.55a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      </button>
    </div>
  );
}

export function AddProfileCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="profileHolder flex w-full">
      <Card variant="addProfile" onClick={onClick}>
        <CardBig>➕</CardBig>
        <span className="shrink-0">פרופיל חדש</span>
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
