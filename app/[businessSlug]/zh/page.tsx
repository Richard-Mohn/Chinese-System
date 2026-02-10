import Link from 'next/link';
import { notFound } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MohnMenuBusiness } from '@/lib/types';

async function getBusinessBySlug(slug: string): Promise<(MohnMenuBusiness & { businessId: string }) | null> {
  try {
    const businessesRef = collection(db, 'businesses');
    const q = query(businessesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { ...snapshot.docs[0].data(), businessId: snapshot.docs[0].id } as MohnMenuBusiness & { businessId: string };
  } catch {
    return null;
  }
}

export default async function ChineseInfoPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;
  const business = await getBusinessBySlug(businessSlug);

  if (!business || business.type !== 'chinese_restaurant') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-28 pb-16 px-4 bg-gradient-to-br from-red-900 via-rose-950 to-zinc-950 text-white">
        <div className="container mx-auto max-w-4xl">
          <p className="text-xs font-black uppercase tracking-widest text-red-200">中文说明</p>
          <h1 className="text-4xl md:text-6xl font-black mt-4">{business.name}</h1>
          <p className="text-red-100/80 mt-5 text-lg leading-relaxed">
            MohnMenu 帮助中餐馆在线接单、收款、管理菜单与配送。您可以用自己的品牌网站接收订单，
            顾客用手机即可下单，不需要下载任何应用。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${business.slug}/menu`}
              className="px-6 py-3 rounded-full bg-red-500 text-white font-bold"
            >
              查看菜单
            </Link>
            <Link
              href={`/order/${business.slug}`}
              className="px-6 py-3 rounded-full bg-white text-red-700 font-bold"
            >
              立即下单
            </Link>
            <Link
              href={`/${business.slug}`}
              className="px-6 py-3 rounded-full border border-white/40 text-white font-bold"
            >
              返回主页
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-10">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-black mb-3">主要功能</h2>
            <ul className="space-y-3 text-zinc-600">
              <li>✅ 在线点餐与自助支付（信用卡、Apple Pay 等）</li>
              <li>✅ 电子菜单（菜品、图片、规格、加料）</li>
              <li>✅ 外卖与自取订单管理</li>
              <li>✅ 厨房出单屏（KDS）</li>
              <li>✅ 顾客订单追踪与自动通知</li>
            </ul>
          </div>
          <div className="bg-zinc-950 text-white rounded-3xl p-8">
            <h2 className="text-2xl font-black mb-3">对餐厅的价值</h2>
            <ul className="space-y-3 text-zinc-300">
              <li>✅ 不收 30% 平台佣金</li>
              <li>✅ 拥有自己的顾客数据</li>
              <li>✅ 减少前台电话压力</li>
              <li>✅ 出单更快，错误更少</li>
              <li>✅ 支持多语言沟通</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-black mb-4">想了解更多？</h3>
          <p className="text-zinc-500 mb-6">
            如果您有任何问题，欢迎联系我们。我们可以帮助您快速上线并开始接单。
          </p>
          <Link
            href={`/${business.slug}/contact`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-black text-white font-bold"
          >
            联系我们
          </Link>
        </div>
      </section>
    </div>
  );
}
