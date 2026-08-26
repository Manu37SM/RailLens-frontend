import { Metadata } from 'next';
import { BookOpen, Gauge, KeyRound } from 'lucide-react';
import Container from '@/components/layout/Container';
import Breadcrumb from '@/components/layout/Breadcrumb';
import EndpointCard from '@/components/developers/EndpointCard';
export const metadata: Metadata = {
  title: 'Developers | RailLens',
  description:
    'RailLens public API documentation - endpoints, request/response examples in curl, JavaScript and Python, rate limits, and the full OpenAPI/Swagger spec.',
};
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
const SWAGGER_URL = `${API_ORIGIN}/swagger-ui.html`;
export default function DevelopersPage() {
  return (
    <div className="bg-slate-50 py-6 dark:bg-slate-800">
      <Container>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Developers' }]}
        />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Developers
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600 dark:text-slate-300">
            RailLens&apos;s train/station/journey search data is available as a
            public, read-only REST API - the same one this website itself calls.
            Built for the mobile apps in the roadmap, but usable by anyone
            today.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <BookOpen
                size={16}
                className="text-orange-600"
                aria-hidden="true"
              />
              Base URL
            </div>
            <code className="mt-1.5 block truncate text-sm text-slate-600 dark:text-slate-300">
              {API_BASE_URL}
            </code>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <KeyRound
                size={16}
                className="text-orange-600"
                aria-hidden="true"
              />
              Authentication
            </div>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
              None required for the read endpoints below. API keys for
              higher-volume/third-party use are planned but not yet available.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Gauge size={16} className="text-orange-600" aria-hidden="true" />
              Rate limit
            </div>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
              120 requests/minute per IP. Exceeding it returns{' '}
              <code className="text-xs">429</code> with a{' '}
              <code className="text-xs">Retry-After</code> header.
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
          Looking for the complete, always-up-to-date spec instead? RailLens
          also publishes a full{' '}
          <a
            href={SWAGGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            OpenAPI/Swagger UI
          </a>{' '}
          covering every endpoint, request/response schema, and validation rule.
        </div>

        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          Endpoints
        </h2>

        <div className="space-y-6">
          <EndpointCard
            method="GET"
            path="/trains/search?q={query}"
            description="Search trains by number or name. Falls back to a typo-tolerant fuzzy match if there are no exact results."
            curl={`curl "${API_BASE_URL}/trains/search?q=rajdhani"`}
            javascript={`const res = await fetch("${API_BASE_URL}/trains/search?q=rajdhani");\nconst trains = await res.json();`}
            python={`import requests\n\nres = requests.get("${API_BASE_URL}/trains/search", params={"q": "rajdhani"})\ntrains = res.json()`}
          />

          <EndpointCard
            method="GET"
            path="/trains/{trainNumber}"
            description="Full route for one train: every stop with arrival/departure time, distance, halt duration, and journey-day (for overnight trains)."
            curl={`curl "${API_BASE_URL}/trains/12301"`}
            javascript={`const res = await fetch("${API_BASE_URL}/trains/12301");\nconst details = await res.json();`}
            python={`import requests\n\nres = requests.get("${API_BASE_URL}/trains/12301")\ndetails = res.json()`}
          />

          <EndpointCard
            method="GET"
            path="/stations/search?q={query}"
            description="Search stations by code or name, same fuzzy-match fallback as train search."
            curl={`curl "${API_BASE_URL}/stations/search?q=new+delhi"`}
            javascript={`const res = await fetch("${API_BASE_URL}/stations/search?q=new+delhi");\nconst stations = await res.json();`}
            python={`import requests\n\nres = requests.get("${API_BASE_URL}/stations/search", params={"q": "new delhi"})\nstations = res.json()`}
          />

          <EndpointCard
            method="GET"
            path="/stations/{stationCode}"
            description="A station's originating, terminating, and passing-through trains, with arrival/departure times."
            curl={`curl "${API_BASE_URL}/stations/NDLS"`}
            javascript={`const res = await fetch("${API_BASE_URL}/stations/NDLS");\nconst station = await res.json();`}
            python={`import requests\n\nres = requests.get("${API_BASE_URL}/stations/NDLS")\nstation = res.json()`}
          />

          <EndpointCard
            method="GET"
            path="/journeys?from={code}&to={code}"
            description="Every direct train between two stations, sorted fastest-first, with distance and duration for each."
            curl={`curl "${API_BASE_URL}/journeys?from=NDLS&to=HWH"`}
            javascript={`const res = await fetch("${API_BASE_URL}/journeys?from=NDLS&to=HWH");\nconst journeys = await res.json();`}
            python={`import requests\n\nres = requests.get(\n    "${API_BASE_URL}/journeys", params={"from": "NDLS", "to": "HWH"}\n)\njourneys = res.json()`}
          />

          <EndpointCard
            method="GET"
            path="/stats"
            description="Dataset-wide statistics: total trains/stations, longest/shortest routes, fastest/slowest trains, and busiest stations."
            curl={`curl "${API_BASE_URL}/stats"`}
            javascript={`const res = await fetch("${API_BASE_URL}/stats");\nconst stats = await res.json();`}
            python={`import requests\n\nres = requests.get("${API_BASE_URL}/stats")\nstats = res.json()`}
          />
        </div>
      </Container>
    </div>
  );
}
