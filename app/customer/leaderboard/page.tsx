'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FaTrophy, FaStar, FaCrown, FaMedal, FaAward, FaFire, FaUtensils, FaDollarSign
} from 'react-icons/fa';
import Link from 'next/link';

interface LeaderboardUser {
  id: string;
  displayName: string;
  photoURL?: string;
  totalSpent: number;
  totalOrders: number;
  badges?: string[];
  rank: number;
}

export default function CustomerLeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const profilesQuery = query(
        collection(db, 'customerProfiles'),
        orderBy('stats.totalSpent', 'desc'),
        limit(100)
      );

      const snap = await getDocs(profilesQuery);
      const users: LeaderboardUser[] = [];

      snap.forEach((doc, index) => {
        const data = doc.data();
        // Only show users who opted into leaderboard
        if (data.privacy?.showLeaderboard !== false) {
          users.push({
            id: doc.id,
            displayName: data.displayName || 'Anonymous',
            photoURL: data.photoURL,
            totalSpent: data.stats?.totalSpent || 0,
            totalOrders: data.stats?.totalOrders || 0,
            badges: data.stats?.badges || [],
            rank: index + 1,
          });
        }
      });

      setLeaderboard(users);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const myRank = leaderboard.findIndex(u => u.id === user?.uid) + 1;
  const myStats = leaderboard.find(u => u.id === user?.uid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-black mb-4">
            <FaFire className="inline mr-2" />
            LIVE LEADERBOARD
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-black mb-2">
            Top Spenders<span className="text-orange-600">.</span>
          </h1>
          <p className="text-zinc-600 text-lg font-medium">
            The most supportive customers in the MohnMenu community
          </p>
        </div>

        {/* My Rankcard (if logged in and in leaderboard) */}
        {user && myStats && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl text-white p-6 mb-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
                  #{myRank}
                </div>
                <div>
                  <p className="text-sm opacity-80 font-bold">Your Rank</p>
                  <p className="text-2xl font-black">{myStats.displayName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">${myStats.totalSpent.toFixed(2)}</p>
                <p className="text-sm opacity-80 font-bold">{myStats.totalOrders} orders</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeframe Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-6 py-3 rounded-xl font-black transition-all ${
              timeframe === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-6 py-3 rounded-xl font-black transition-all ${
              timeframe === 'month'
                ? 'bg-black text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-6 py-3 rounded-xl font-black transition-all ${
              timeframe === 'week'
                ? 'bg-black text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            This Week
          </button>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top 3 Podium */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-8">
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {/* 2nd Place */}
              {leaderboard[1] && (
                <div className="flex flex-col items-center pt-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center text-white text-2xl font-black mb-3 border-4 border-white shadow-xl">
                    <FaMedal />
                  </div>
                  <p className="text-white font-black text-lg mb-1">{leaderboard[1].displayName}</p>
                  <p className="text-white/90 text-sm font-bold">${leaderboard[1].totalSpent.toFixed(0)}</p>
                  <div className="mt-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-black">
                    #2
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <div className="flex flex-col items-center">
                  <FaCrown className="text-yellow-200 text-3xl mb-2 animate-bounce" />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-3xl font-black mb-3 border-4 border-white shadow-2xl">
                    <FaTrophy />
                  </div>
                  <p className="text-white font-black text-xl mb-1">{leaderboard[0].displayName}</p>
                  <p className="text-white/90 text-base font-bold">${leaderboard[0].totalSpent.toFixed(0)}</p>
                  <div className="mt-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-black">
                    👑 #1 CHAMPION
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div className="flex flex-col items-center pt-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-black mb-3 border-4 border-white shadow-xl">
                    <FaAward />
                  </div>
                  <p className="text-white font-black text-lg mb-1">{leaderboard[2].displayName}</p>
                  <p className="text-white/90 text-sm font-bold">${leaderboard[2].totalSpent.toFixed(0)}</p>
                  <div className="mt-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-black">
                    #3
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rest of Leaderboard */}
          <div className="p-6">
            {loading ? (
              <p className="text-center text-zinc-400 py-8 font-bold">Loading leaderboard...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-zinc-400 py-8 font-bold">No leaderboard data yet</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.slice(3).map((user, index) => {
                  const actualRank = index + 4;
                  const isMe = user.id === user?.uid;

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isMe
                          ? 'bg-indigo-50 border-2 border-indigo-500'
                          : 'bg-zinc-50 border-2 border-transparent hover:border-zinc-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-black">
                        #{actualRank}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-black">{user.displayName}</p>
                        <p className="text-xs text-zinc-500 font-bold">
                          {user.totalOrders} orders
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-600">
                          ${user.totalSpent.toFixed(2)}
                        </p>
                      </div>
                      {isMe && (
                        <div className="px-3 py-1.5 rounded-full bg-indigo-500 text-white text-xs font-black">
                          YOU
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        {!user && (
          <div className="mt-8 text-center bg-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-black text-black mb-2">Join the Competition!</h3>
            <p className="text-zinc-600 mb-4">Sign up to track your stats and climb the leaderboard</p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-lg hover:shadow-2xl transition-all"
            >
              Sign Up Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
