'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Trophy, Users, TrendingUp, Monitor, Smartphone, RefreshCw } from 'lucide-react'

export default function Page() {
  const [csvUrl, setCsvUrl] = useState('')
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  // IMPORTANT:
  // PASTE YOUR PUBLISHED GOOGLE SHEET CSV URL BELOW
  // Example:
  // https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=0&single=true&output=csv

  const DEFAULT_URL = ''

  useEffect(() => {
    if (DEFAULT_URL) {
      setCsvUrl(DEFAULT_URL)
    }
  }, [])

  async function fetchLeaderboard() {
    if (!csvUrl) return

    try {
      setLoading(true)

      const response = await fetch(csvUrl)
      const text = await response.text()

      const rows = text
        .split('\n')
        .map((row) => row.split(','))
        .filter((row) => row.length >= 5)

      const headers = rows[0]
      const dataRows = rows.slice(1)

      const parsedPlayers = dataRows
        .map((row) => ({
          playerId: row[0]?.trim(),
          playerName: row[1]?.trim(),
          gender: row[2]?.trim(),
          gamesPlayed: Number(row[3]) || 0,
          totalPoints: Number(row[4]) || 0,
        }))
        .filter((player) => player.playerName)

      setPlayers(parsedPlayers)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()

    const interval = setInterval(() => {
      fetchLeaderboard()
    }, 10000)

    return () => clearInterval(interval)
  }, [csvUrl])

  const guys = useMemo(() => {
    return players
      .filter((p) => p.gender.toLowerCase().includes('m'))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
        qualified: index < 8,
      }))
  }, [players])

  const girls = useMemo(() => {
    return players
      .filter((p) => p.gender.toLowerCase().includes('f'))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
        qualified: index < 8,
      }))
  }, [players])

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setFullscreen(true)
    } else {
      await document.exitFullscreen()
      setFullscreen(false)
    }
  }

 function LeaderboardTable({
  title,
  players,
}: {
  title: string
  players: any[]
}) { 
    return (
      <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            {title}
          </h2>

          <div className="text-zinc-400 text-sm">
            Top 8 qualify
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-zinc-400 border-b border-zinc-800">
                <th className="text-left py-4">Rank</th>
                <th className="text-left py-4">Player</th>
                <th className="text-center py-4">GP</th>
                <th className="text-center py-4">Points</th>
                <th className="text-center py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {players.map((player, index) => (
                <tr
                  key={player.playerId}
                  className={`border-b border-zinc-800 transition-all duration-500 hover:bg-zinc-800/50 ${
                    player.qualified
                      ? 'bg-green-950/30'
                      : player.rank === 9
                      ? 'bg-red-950/20'
                      : ''
                  }`}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          player.rank <= 3
                            ? 'bg-yellow-500 text-black'
                            : player.qualified
                            ? 'bg-green-600'
                            : 'bg-zinc-700'
                        }`}
                      >
                        {player.rank}
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <div>
                      <div className="font-semibold text-lg">
                        {player.playerName}
                      </div>
                      <div className="text-zinc-400 text-sm">
                        ID: {player.playerId}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 text-center text-lg">
                    {player.gamesPlayed}
                  </td>

                  <td className="py-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {player.totalPoints}
                    </div>
                  </td>

                  <td className="py-4 text-center">
                    {player.qualified ? (
                      <span className="bg-green-600 px-4 py-2 rounded-full text-sm font-semibold">
                        QUALIFIED
                      </span>
                    ) : (
                      <span className="bg-zinc-700 px-4 py-2 rounded-full text-sm">
                        OUTSIDE CUT
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-3 text-zinc-400 text-sm">
          <TrendingUp className="w-4 h-4" />
          Qualification cutoff is between Rank 8 and Rank 9
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="bg-gradient-to-r from-green-700 to-emerald-500 rounded-3xl p-8 text-black shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold mb-3">
                🏓 Live Pickleball Leaderboard
              </h1>

              <p className="text-lg font-medium opacity-80">
                Real-time mixed doubles standings
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchLeaderboard}
                className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold hover:scale-105 transition"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>

              <button
                onClick={toggleFullscreen}
                className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold hover:scale-105 transition"
              >
                <Monitor className="w-5 h-5" />
                TV Mode
              </button>
            </div>
          </div>
        </div>

        

        <div className="grid lg:grid-cols-2 gap-8">
          <LeaderboardTable title="Guys Leaderboard" players={guys} />
          <LeaderboardTable title="Girls Leaderboard" players={girls} />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <div className="text-zinc-400 mb-2">Total Players</div>
            <div className="text-5xl font-bold">{players.length}</div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <div className="text-zinc-400 mb-2">Qualified</div>
            <div className="text-5xl font-bold text-green-400">16</div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <div className="text-zinc-400 mb-2">Auto Refresh</div>
            <div className="text-3xl font-bold">10s</div>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <div className="text-zinc-400 mb-2">Last Updated</div>
            <div className="text-xl font-bold">
              {lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : '--'}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold">
              Google Sheet Integration
            </h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
              placeholder="Paste published Google Sheets CSV URL"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-green-500"
            />

            
          </div>
        </div>
        
      </div>
    </div>
  )
}

