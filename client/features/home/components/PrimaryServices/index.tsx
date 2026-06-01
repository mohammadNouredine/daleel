"use client";

import { HandHeart, Home } from "lucide-react";
import {
  PRIMARY_SERVICE_HELP_IMAGE,
  PRIMARY_SERVICE_HOUSING_IMAGE,
} from "../../mock-data";
import { ServiceCard } from "./ServiceCard";

export function PrimaryServices() {
  return (
    <section
      id="services"
      className="mx-auto mt-8 max-w-6xl scroll-mt-20 px-4 sm:px-6 sm:mt-10 "
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ServiceCard
          href="#housing-listings"
          title="Find Shelter & Housing"
          description="Browse emergency shelters, temporary stays, rooms, apartments, and homes for rent."
          cta="Browse Housing"
          imageUrl={PRIMARY_SERVICE_HOUSING_IMAGE}
          icon={<Home className="size-5 text-primary" />}
          accentClass="bg-linear-to-br from-card to-muted/40"
          delay={0}
        />
        <ServiceCard
          href="/help-requests"
          title="Help Requests"
          description="Discover urgent community needs or publish your own request for assistance."
          cta="View Requests"
          imageUrl={PRIMARY_SERVICE_HELP_IMAGE}
          icon={
            <HandHeart className="size-5 text-emerald-600 dark:text-emerald-400" />
          }
          accentClass="bg-linear-to-br from-card to-emerald-500/5"
          delay={0.08}
        />
      </div>
    </section>
  );
}
