"use client";

import { useTourTrigger } from "@/hooks/useTourTrigger";

export default function TourTrigger() {
  useTourTrigger();
  return null; // This component renders nothing, just triggers tours
}