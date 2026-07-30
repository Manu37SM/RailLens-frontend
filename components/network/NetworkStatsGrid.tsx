import { Network, Route, Share2, Waypoints } from 'lucide-react';

import Card from '@/components/layout/Card';
import { NetworkStatsResponse } from '@/types/network';

interface Props {
  stats: NetworkStatsResponse;
}

export default function NetworkStatsGrid({ stats }: Props) {
  const summary = [
    { label: 'Stations', value: stats.totalStations.toLocaleString(), icon: Waypoints },
    { label: 'Trains', value: stats.totalTrains.toLocaleString(), icon: Route },
    { label: 'Station links', value: stats.totalEdges.toLocaleString(), icon: Share2 },
    { label: 'Network diameter', value: stats.networkDiameter.toLocaleString(), icon: Network },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {summary.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <Icon className="h-6 w-6 text-orange-600" />
            <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Connectivity</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          How stitched-together the network is, computed from the shared-station graph across every train&apos;s route.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500 dark:text-slate-400">Route density</dt>
            <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {(stats.routeDensity * 100).toFixed(2)}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-slate-400">Connected groups</dt>
            <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.connectedComponentCount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-slate-400">Largest group size</dt>
            <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.largestComponentSize.toLocaleString()} stations
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Most central stations</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Ranked by betweenness centrality - how often a station sits on the shortest path between two others in the network&apos;s largest connected group.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                <th className="py-2 pr-4 font-medium">#</th>
                <th className="py-2 pr-4 font-medium">Station</th>
                <th className="py-2 pr-4 font-medium">Betweenness</th>
                <th className="py-2 pr-4 font-medium">Closeness</th>
                <th className="py-2 pr-4 font-medium">Direct links</th>
              </tr>
            </thead>
            <tbody>
              {stats.mostCentralStations.map((station, index) => (
                <tr
                  key={station.stationCode}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <td className="py-2 pr-4 text-gray-500 dark:text-slate-400">{index + 1}</td>
                  <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">
                    {station.stationName} ({station.stationCode})
                  </td>
                  <td className="py-2 pr-4">{station.betweennessCentrality.toFixed(1)}</td>
                  <td className="py-2 pr-4">{station.closenessCentrality.toFixed(4)}</td>
                  <td className="py-2 pr-4">{station.degree}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
