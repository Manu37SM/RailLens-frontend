import Link from "next/link";
import { ArrowRightLeft, MapPin, TrainFront } from "lucide-react";

const features = [
  {
    title: "Train Search",
    description: "Search trains by number",
    icon: TrainFront,
    href: "/",
    disabled: true,
  },
  {
    title: "Between Stations",
    description: "Find trains between two stations",
    icon: ArrowRightLeft,
    href: "/journeys",
    disabled: false,
  },
  {
    title: "Station Search",
    description: "Coming soon",
    icon: MapPin,
    href: "#",
    disabled: true,
  },
];

export default function FeatureCards() {
  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Explore More
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          const content = (
            <div
              className={`rounded-xl border bg-white p-6 transition ${
                feature.disabled
                  ? "cursor-not-allowed opacity-60"
                  : "hover:border-blue-500 hover:shadow-md"
              }`}
            >
              <Icon className="mb-4 h-8 w-8 text-blue-600" />

              <h3 className="font-semibold text-slate-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {feature.description}
              </p>
            </div>
          );

          return feature.disabled ? (
            <div key={feature.title}>{content}</div>
          ) : (
            <Link key={feature.title} href={feature.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}