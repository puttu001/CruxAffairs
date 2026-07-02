"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CurrentAffairItem } from "@/lib/api";
import { userApi } from "@/lib/user-api";

interface BookmarkContextValue {
  bookmarkedIds: Set<string>;
  toggle: (item: CurrentAffairItem) => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextValue>({
  bookmarkedIds: new Set(),
  toggle: async () => {},
});

export function useBookmarks() {
  return useContext(BookmarkContext);
}

export default function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    userApi.getBookmarkIds()
      .then((ids) => setBookmarkedIds(new Set(ids)))
      .catch(() => {});
  }, []);

  const toggle = useCallback(async (item: CurrentAffairItem) => {
    const isBookmarked = bookmarkedIds.has(item.id);
    // Optimistic update
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      isBookmarked ? next.delete(item.id) : next.add(item.id);
      return next;
    });
    try {
      if (isBookmarked) {
        await userApi.removeBookmark(item.id);
      } else {
        await userApi.addBookmark(item.id);
      }
    } catch {
      // Revert on failure
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        isBookmarked ? next.add(item.id) : next.delete(item.id);
        return next;
      });
    }
  }, [bookmarkedIds]);

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, toggle }}>
      {children}
    </BookmarkContext.Provider>
  );
}
