'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FaUserPlus, FaCheck, FaTimes, FaClock, FaSearch, FaUserFriends
} from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

interface FriendRequest {
  id: string;
  fromId: string;
  toId: string;
  fromName: string;
  fromPhoto?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

interface User {
  id: string;
  displayName: string;
  photoURL?: string;
  email?: string;
}

export default function CustomerFriendsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadFriendRequests();
    loadFriends();
  }, [user]);

  const loadFriendRequests = async () => {
    if (!user) return;

    try {
      // Pending requests TO me
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('toId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const requestsSnap = await getDocs(requestsQuery);
      setPendingRequests(requestsSnap.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest)));

      // Requests I sent
      const sentQuery = query(
        collection(db, 'friendRequests'),
        where('fromId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const sentSnap = await getDocs(sentQuery);
      setSentRequests(sentSnap.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest)));
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    }
  };

  const loadFriends = async () => {
    if (!user) return;

    try {
      const friendshipsQuery = query(
        collection(db, 'friendships'),
        where('users', 'array-contains', user.uid)
      );

      const snap = await getDocs(friendshipsQuery);
      const friendIds = snap.docs.map(doc => {
        const data = doc.data();
        return data.users.find((id: string) => id !== user.uid);
      }).filter(Boolean);

      const friendProfiles: User[] = [];
      
      for (const friendId of friendIds) {
        const userDoc = await getDoc(doc(db, 'users', friendId));
        if (userDoc.exists()) {
          friendProfiles.push({
            id: userDoc.id,
            ...userDoc.data() as any,
          });
        }
      }

      setFriends(friendProfiles);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    setLoading(true);
    try {
      // Search by email or display name
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'customer'),
        limit(20)
      );

      const snap = await getDocs(usersQuery);
      const results: User[] = [];

      snap.forEach(doc => {
        if (doc.id === user.uid) return; // Skip self
        
        const data = doc.data();
        const matchesEmail = data.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesName = data.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (matchesEmail || matchesName) {
          results.push({
            id: doc.id,
            displayName: data.displayName || 'Anonymous',
            photoURL: data.photoURL,
            email: data.email,
          });
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (toUserId: string, toUserName: string) => {
    if (!user) return;

    try {
      // Check if request already exists
      const existingQuery = query(
        collection(db, 'friendRequests'),
        where('fromId', '==', user.uid),
        where('toId', '==', toUserId)
      );
      const existingSnap = await getDocs(existingQuery);
      
      if (!existingSnap.empty) {
        alert('Friend request already sent');
        return;
      }

      // Check if already friends
      const friendshipQuery = query(
        collection(db, 'friendships'),
        where('users', 'array-contains', user.uid)
      );
      const friendshipSnap = await getDocs(friendshipQuery);
      const alreadyFriends = friendshipSnap.docs.some(doc => {
        const data = doc.data();
        return data.users.includes(toUserId);
      });

      if (alreadyFriends) {
        alert('Already friends');
        return;
      }

      await addDoc(collection(db, 'friendRequests'), {
        fromId: user.uid,
        toId: toUserId,
        fromName: user.displayName || 'Anonymous',
        fromPhoto: user.photoURL || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert(`Friend request sent to ${toUserName}!`);
      loadFriendRequests();
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestId: string, fromId: string) => {
    if (!user) return;

    try {
      // Update request status
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
      });

      // Create friendship
      await addDoc(collection(db, 'friendships'), {
        users: [user.uid, fromId],
        createdAt: serverTimestamp(),
      });

      loadFriendRequests();
      loadFriends();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      alert('Failed to accept request');
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'friendRequests', requestId), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
      });

      loadFriendRequests();
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/customer/profile" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm mb-2 inline-block">
            ← Back to Profile
          </Link>
          <h1  className="text-4xl font-black tracking-tighter text-black">
            Friends<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-zinc-500 mt-1">Connect with other MohnMenu users</p>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
              <FaClock className="text-amber-500" />
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border-2 border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black">
                      {request.fromName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-black">{request.fromName}</p>
                      <p className="text-xs text-zinc-500">Wants to be friends</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptFriendRequest(request.id, request.fromId)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
                    >
                      <FaCheck /> Accept
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(request.id)}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <FaTimes /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Friends */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
            <FaUserFriends className="text-indigo-600" />
            My Friends ({friends.length})
          </h2>
          {friends.length === 0 ? (
            <p className="text-center text-zinc-400 py-8">No friends yet. Search below to add some!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border-2 border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black">
                      {friend.displayName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-black">{friend.displayName}</p>
                      <p className="text-xs text-zinc-500">{friend.email}</p>
                    </div>
                  </div>
                  <Link
                    href={`/order-for-friend/${friend.id}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
                  >
                    Gift Order
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Users */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
            <FaUserPlus className="text-emerald-600" />
            Add Friends
          </h2>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or email..."
              className="flex-1 h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaSearch /> Search
            </button>
          </div>

          {loading ? (
            <p className="text-center text-zinc-400 py-8">Searching...</p>
          ) : searchResults.length === 0 && searchQuery ? (
            <p className="text-center text-zinc-400 py-8">No users found</p>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map(result => {
                const alreadySent = sentRequests.some(r => r.toId === result.id);
                const isFriend = friends.some(f => f.id === result.id);

                return (
                  <div key={result.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border-2 border-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black">
                        {result.displayName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-black">{result.displayName}</p>
                        <p className="text-xs text-zinc-500">{result.email}</p>
                      </div>
                    </div>
                    {isFriend ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                        Friends ✓
                      </span>
                    ) : alreadySent ? (
                      <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                        Request Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => sendFriendRequest(result.id, result.displayName)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <FaUserPlus /> Add Friend
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
