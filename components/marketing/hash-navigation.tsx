"use client";

import { useEffect } from "react";

export default function HashNavigation() {
  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the # and scroll to the element
      const elementId = hash.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        // Small delay to ensure the page is fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
