'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaUser, FaUserFriends, FaTrophy, FaNewspaper } from 'react-icons/fa';
import AddressAutocomplete from '@/components/AddressAutocomplete';

export default function CustomerProfilePage() {
  const { user, MohnMenuUser, loading, isCustomer } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoPostOrders, setAutoPostOrders] = useState(true);
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [acceptFriendOrders, setAcceptFriendOrders] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isCustomer())) {
      router.push('/login');
    }
  }, [user, loading, isCustomer, router]);

  useEffect(() => {
    if (MohnMenuUser) {
      setDisplayName(MohnMenuUser.displayName || '');
      setPhone((MohnMenuUser as any).phone || '');
      setAddress((MohnMenuUser as any).address || '');
    }
    // Load privacy settings from customer profile
    const loadPrivacySettings = async () => {
      if (user) {
        const profileRef = doc(db, 'customerProfiles', user.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const data = snap.data();
          setAutoPostOrders(data.privacy?.disableSocialPosts !== true);
          setPostPrivacy(data.privacy?.socialPostPrivacy || 'public');
          setAcceptFriendOrders(data.privacy?.acceptFriendOrders !== false);
        }
      }
    };
    loadPrivacySettings();
  }, [MohnMenuUser, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName,
        phone,
        address,
        updatedAt: new Date().toISOString(),
      });

      // Update customer profile privacy settings
      const profileDocRef = doc(db, 'customerProfiles', user.uid);
      await updateDoc(profileDocRef, {
        privacy: {
          disableSocialPosts: !autoPostOrders,
          socialPostPrivacy: postPrivacy,
          acceptFriendOrders: acceptFriendOrders,
        },
      }).catch(() => {
        // Profile might not exist yet, that's ok
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-bold text-zinc-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/customer" className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <FaArrowLeft className="text-sm text-zinc-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-black">
              Profile<span className="text-orange-600">.</span>
            </h1>
            <p className="text-sm text-zinc-500 font-medium">Manage your account</p>
          </div>
        </div>

        {/* Avatar + Email */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-zinc-100 p-10 mb-6"
        >
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <FaUser className="text-2xl text-white" />
            </div>
            <div>
              <p className="font-black text-black text-xl">{displayName || 'User'}</p>
              <p className="text-sm text-zinc-400 font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-5 py-3.5 border border-zinc-100 rounded-xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-300 text-sm"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-3.5 border border-zinc-100 rounded-xl bg-zinc-50 text-black font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-zinc-300 text-sm"
                placeholder="(555) 555-5555"
              />
            </div>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              onSelect={(parsed) => setAddress(parsed.formatted)}
              label="Delivery Address"
              placeholder="123 Main St, City, State"
              inputClassName="px-5 py-3.5 border-zinc-100 bg-zinc-50 text-black font-bold placeholder:text-zinc-300"
            />

            {/* Social Privacy Settings */}
            <div className="pt-6 border-t border-zinc-200">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 ml-1">
                Social Feed Privacy
              </label>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={autoPostOrders}
                    onChange={(e) => setAutoPostOrders(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-300"
                  />
                  <div>
                    <p className="font-bold text-black text-sm">Auto-post when I order</p>
                    <p className="text-xs text-zinc-500">Share your orders with friends automatically</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={acceptFriendOrders}
                    onChange={(e) => setAcceptFriendOrders(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-300"
                  />
                  <div>
                    <p className="font-bold text-black text-sm">Accept orders from friends</p>
                    <p className="text-xs text-zinc-500">Allow friends to send you gift orders</p>
                  </div>
                </label>

                <div className="p-4 bg-zinc-50 rounded-xl">
                  <p className="font-bold text-black text-sm mb-3">Post visibility</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postPrivacy"
                        value="public"
                        checked={postPrivacy === 'public'}
                        onChange={() => setPostPrivacy('public')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-zinc-700">Public - Everyone can see</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postPrivacy"
                        value="friends"
                        checked={postPrivacy === 'friends'}
                        onChange={() => setPostPrivacy('friends')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-zinc-700">Friends only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postPrivacy"
                        value="private"
                        checked={postPrivacy === 'private'}
                        onChange={() => setPostPrivacy('private')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-zinc-700">Private - Only me</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-8 w-full group bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-full font-bold text-base flex items-center justify-center gap-2.5 hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saved ? (
              <><FaCheck /> Saved!</>
            ) : saving ? (
              'Saving...'
            ) : (
              'Save Changes'
            )}
          </button>
        </motion.div>

        {/* Social Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Link href="/customer/feed" className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all group">
            <FaNewspaper className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-lg mb-1">Social Feed</h3>
            <p className="text-sm text-blue-100">See what friends are ordering</p>
          </Link>
          <Link href="/customer/friends" className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all group">
            <FaUserFriends className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-lg mb-1">Friends</h3>
            <p className="text-sm text-indigo-100">Connect with other customers</p>
          </Link>
          <Link href="/customer/leaderboard" className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all group">
            <FaTrophy className="text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-lg mb-1">Leaderboard</h3>
            <p className="text-sm text-orange-100">See top spenders & your rank</p>
          </Link>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-zinc-100 p-6"
        >
          <h3 className="font-bold text-black text-sm mb-3">Account Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-zinc-50">
              <span className="text-zinc-400 font-medium">Email</span>
              <span className="font-bold text-black">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-50">
              <span className="text-zinc-400 font-medium">Member Since</span>
              <span className="font-bold text-black">
                {MohnMenuUser?.createdAt
                  ? new Date(MohnMenuUser.createdAt).toLocaleDateString()
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-400 font-medium">Account Type</span>
              <span className="font-bold text-orange-600 capitalize">{MohnMenuUser?.role || 'Customer'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
