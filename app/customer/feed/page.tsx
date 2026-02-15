'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  FaHeart, FaComment, FaShare, FaUtensils, FaMapMarkerAlt,
  FaClock, FaRegHeart, FaEllipsisV, FaTrash, FaEdit
} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  type: 'order' | 'status' | 'photo' | 'review';
  content?: string;
  orderData?: {
    businessName: string;
    businessSlug: string;
    items: string[];
    total: number;
    orderType: string;
  };
  imageUrl?: string;
  likes: string[];
  commentCount: number;
  createdAt: any;
  privacy: 'public' | 'friends' | 'private';
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: any;
}

export default function SocialFeedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState('');
  const [feedFilter, setFeedFilter] = useState<'all' | 'friends' | 'mine'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadFeed();
  }, [user, feedFilter]);

  const loadFeed = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let postsQuery;

      if (feedFilter === 'mine') {
        postsQuery = query(
          collection(db, 'socialPosts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      } else if (feedFilter === 'friends') {
        // Get friend IDs
        const friendshipsSnap = await getDocs(
          query(collection(db, 'friendships'), where('users', 'array-contains', user.uid))
        );
        const friendIds = friendshipsSnap.docs.flatMap(doc => {
          const data = doc.data();
          return data.users.filter((id: string) => id !== user.uid);
        });

        if (friendIds.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        postsQuery = query(
          collection(db, 'socialPosts'),
          where('userId', 'in', friendIds.slice(0, 10)), // Firestore limit
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      } else {
        postsQuery = query(
          collection(db, 'socialPosts'),
          where('privacy', '==', 'public'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      }

      const snap = await getDocs(postsQuery);
      const postsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.trim()) return;

    setPosting(true);
    try {
      await addDoc(collection(db, 'socialPosts'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || null,
        type: 'status',
        content: newPost,
        likes: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
        privacy: 'public',
      });

      setNewPost('');
      loadFeed();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string, currentLikes: string[]) => {
    if (!user) return;

    const isLiked = currentLikes.includes(user.uid);
    const postRef = doc(db, 'socialPosts', postId);

    try {
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId
          ? { ...post, likes: isLiked ? post.likes.filter(id => id !== user.uid) : [...post.likes, user.uid] }
          : post
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const commentsQuery = query(
        collection(db, 'socialComments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );

      const snap = await getDocs(commentsQuery);
      const commentsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(prev => ({ ...prev, [postId]: commentsData }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;

    try {
      await addDoc(collection(db, 'socialComments'), {
        postId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || null,
        content: commentText,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'socialPosts', postId), {
        commentCount: increment(1),
      });

      setCommentText('');
      loadComments(postId);
      loadFeed();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'socialPosts', postId));
      loadFeed();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const renderPost = (post: Post) => {
    const isLiked = post.likes.includes(user?.uid || '');
    const isMyPost = post.userId === user?.uid;

    return (
      <div key={post.id} className="bg-white rounded-2xl shadow-lg border border-zinc-100 overflow-hidden">
        {/* Post Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black">
              {post.userPhoto ? (
                <Image src={post.userPhoto} alt={post.userName} width={48} height={48} className="rounded-full" />
              ) : (
                post.userName[0]?.toUpperCase()
              )}
            </div>
            <div>
              <p className="font-black text-black">{post.userName}</p>
              <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <FaClock className="text-[10px]" />
                {post.createdAt && formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
              </p>
            </div>
          </div>
          {isMyPost && (
            <button onClick={() => deletePost(post.id)} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-500">
              <FaTrash />
            </button>
          )}
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          {post.type === 'order' && post.orderData && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <FaUtensils className="text-orange-600" />
                <p className="font-black text-black">
                  Ordered from <Link href={`/${post.orderData.businessSlug}`} className="text-orange-600 hover:underline">{post.orderData.businessName}</Link>
                </p>
              </div>
              <div className="text-sm">
                <p className="text-zinc-600 font-bold mb-2">
                  {post.orderData.items.slice(0, 3).join(', ')}
                  {post.orderData.items.length > 3 && ` +${post.orderData.items.length - 3} more`}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 capitalize">{post.orderData.orderType}</span>
                  <span className="text-lg font-black text-emerald-600">${post.orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {post.content && (
            <p className="text-black font-medium leading-relaxed">{post.content}</p>
          )}

          {post.imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <Image src={post.imageUrl} alt="Post image" width={600} height={400} className="w-full object-cover" />
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="px-4 py-2 border-t border-zinc-100 flex items-center justify-between text-sm text-zinc-500">
          <span className="font-bold">{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</span>
          <span className="font-bold">{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-zinc-100 flex items-center gap-2">
          <button
            onClick={() => toggleLike(post.id, post.likes)}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isLiked
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            Like
          </button>
          <button
            onClick={() => {
              setActiveComments(activeComments === post.id ? null : post.id);
              if (activeComments !== post.id) {
                loadComments(post.id);
              }
            }}
            className="flex-1 py-2.5 rounded-xl bg-zinc-50 text-zinc-600 hover:bg-zinc-100 font-bold flex items-center justify-center gap-2 transition-all"
          >
            <FaComment />
            Comment
          </button>
        </div>

        {/* Comments Section */}
        {activeComments === post.id && (
          <div className="px-4 pb-4 border-t border-zinc-100 space-y-3">
            <div className="pt-3 space-y-3">
              {comments[post.id]?.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    {comment.userName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 bg-zinc-50 rounded-xl p-3">
                    <p className="font-black text-sm text-black mb-1">{comment.userName}</p>
                    <p className="text-sm text-zinc-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 rounded-xl border-2 border-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => addComment(post.id)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-black tracking-tighter text-black mb-2">
            Social Feed<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-zinc-500">See what your friends are ordering</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFeedFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              feedFilter === 'all' ? 'bg-black text-white' : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Everyone
          </button>
          <button
            onClick={() => setFeedFilter('friends')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              feedFilter === 'friends' ? 'bg-black text-white' : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setFeedFilter('mine')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              feedFilter === 'mine' ? 'bg-black text-white' : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            My Posts
          </button>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-2xl shadow-lg border border-zinc-100 p-4 mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 border-2 border-zinc-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={createPost}
              disabled={posting || !newPost.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black hover:shadow-lg transition-all disabled:opacity-50"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-zinc-400 font-bold">Loading feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaUtensils className="text-6xl text-zinc-300 mx-auto mb-4" />
            <p className="text-xl font-black text-zinc-400 mb-2">No posts yet</p>
            <p className="text-sm text-zinc-500">
              {feedFilter === 'friends' ? 'Add friends to see their activity' : 'Be the first to post something!'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(renderPost)}
          </div>
        )}
      </div>
    </div>
  );
}
