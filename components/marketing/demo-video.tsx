"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Volume2 } from "lucide-react";

export default function DemoVideo() {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section id="demo-video" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="relative">
          {/* Video Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Video Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Contenov - Content Brief Generator For Blog Posts
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-600 hover:text-gray-800"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Video Content */}
            <div className="relative aspect-video bg-white rounded-lg overflow-hidden">
              <iframe
                src="https://player.vimeo.com/video/1126900233?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;title=0&amp;byline=0&amp;portrait=0&amp;color=ffffff&amp;controls=1"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Contenov Demo Video"
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>

          {/* Video Description */}
          <div className="text-center mt-8">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how Contenov transforms any topic into a comprehensive blog content brief. 
              See the AI analyze competitor content and generate winning strategies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
