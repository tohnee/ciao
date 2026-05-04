"use client";

import { useHomeStore } from "@/stores/home";

export function useHome() {
  return useHomeStore();
}
