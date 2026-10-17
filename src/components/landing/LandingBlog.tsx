import React, { useState } from 'react';
import {
  Search,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  X,
  Sparkles,
  Share2,
  ThumbsUp,
} from 'lucide-react';

export interface BlogPost {
  id: string;
  title: string;
  category: 'AI & Copilots' | 'CRM Strategy' | 'Product Operations' | 'Growth & Billing';
  summary: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export const LandingBlog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  const posts: BlogPost[] = [
    {
      id: 'post_1',
      title: 'How Gemini 2.5 Redefines Operational CRM Workflows in 2026',
      category: 'AI & Copilots',
      summary:
        'Discover how AI agents analyze pipeline bottlenecks, predict deal closing probabilities, and draft personalized executive updates automatically.',
      content: `The SaaS CRM landscape has evolved from passive databases into active reasoning engines. With the introduction of Google's Gemini 2.5 Flash models natively embedded into CherryFlow, operations teams no longer spend hours logging meeting notes or calculating churn risk.

### 1. Zero-Touch Data Entry
Traditional CRMs require manual field updates after every sales call. CherryFlow AI listens to structured activity logs and automatically extracts key dates, budget ranges, and stakeholder sentiment.

### 2. Predictive Pipeline Intelligence
By evaluating historical deal conversion patterns across 45,000+ workspaces, Gemini highlights deals that have gone cold before revenue is lost.

### 3. Automated Executive Briefings
Instead of spending Sunday evenings drafting slide decks, managers can click "Generate Weekly Digest" to get an instant, publication-ready summary of MRR growth and task velocity.`,
      author: 'Sarah Chen',
      date: 'Aug 2, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
      featured: true,
    },
    {
      id: 'post_2',
      title: 'The Hidden Cost of SaaS Tool Fragmentation (And How to Fix It)',
      category: 'Product Operations',
      summary:
        'Using 6 separate apps for tasks, CRM, notes, billing, and team chat costs the average 10-person company over $14,000/year in license fees and lost productivity.',
      content: `In 2024, the average startup subscribed to 14 different SaaS micro-apps. Today in 2026, the trend has reversed dramatically toward unified operating systems.

### Context Switching Penalties
Studies show that switching between tabs takes 2.3 seconds per transition. Multiplied by 200 daily switches, a team loses over 12 hours per week simply navigating interface boundaries.

### The CherryFlow Single Engine Approach
By unifying CRM, tasks, billing, and notes into one reactive state engine, context is preserved automatically. A deal closed in the CRM instantly triggers a task in the sprint board and updates revenue metrics.`,
      author: 'Alex Rivera',
      date: 'Jul 28, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'post_3',
      title: 'Building High-Velocity Sales Pipelines with Stripe Billing Integration',
      category: 'Growth & Billing',
      summary:
        'Learn how to issue instant payment links, collect deposits, and automate invoice generation directly inside customer records.',
      content: `Friction during contract signing kills more deals than price. Integrating billing directly into the CRM pipeline eliminates back-and-forth email attachments and manual wire verifications.

### Instant Payment Links
Inside CherryFlow's Customer Modal, reps can select a subscription tier and click "Generate Payment Link". The link is embedded into the proposal with automatic Stripe webhook updates upon completion.`,
      author: 'Marcus Vance',
      date: 'Jul 15, 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'post_4',
      title: 'Role-Based Access Control (RBAC): Best Practices for Scale',
      category: 'CRM Strategy',
      summary:
        'Safeguard sensitive customer records, financial numbers, and API tokens while keeping team collaboration frictionless.',
      content: `As organizations grow from 5 to 50 members, permission governance becomes critical. CherryFlow provides granular role definitions (Owner, Admin, Member, Viewer) with instant policy propagation.`,
      author: 'Elena Rostova',
      date: 'Jul 10, 2026',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const categories = ['All', 'AI & Copilots', 'CRM Strategy', 'Product Operations', 'Growth & Billing'];

  const filteredPosts = posts.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featured = posts.find((p) => p.featured) || posts[0];

  return (
    <div className="py-24 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            CherryFlow Engineering & Growth Blog
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Insights on SaaS, AI & <br />
            <span className="text-rose-600 dark:text-rose-500">Operational Excellence</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Tactical playbooks, system architecture deep dives, and product updates from the CherryFlow team.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              id="blog-search-input"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-rose-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Hero Article */}
        {selectedCategory === 'All' && !searchQuery && (
          <div
            onClick={() => setActiveArticle(featured)}
            className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 cursor-pointer group hover:border-rose-500 transition-all"
          >
            <div className="lg:col-span-7 overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                  Featured Article • {featured.category}
                </span>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 line-clamp-3">
                  {featured.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-rose-500" />
                  <span>{featured.author}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{featured.readTime}</span>
                </div>
                <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  Read Article →
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setActiveArticle(post)}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md hover:border-rose-500 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-500" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Article Reader Modal */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 max-w-3xl w-full max-h-[85vh] rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  {activeArticle.category}
                </span>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {activeArticle.title}
                </h1>

                <div className="flex items-center gap-4 text-xs text-zinc-500 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <span>By {activeArticle.author}</span>
                  <span>•</span>
                  <span>{activeArticle.date}</span>
                  <span>•</span>
                  <span>{activeArticle.readTime}</span>
                </div>

                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-64 object-cover rounded-2xl shadow-md"
                />

                <div className="prose dark:prose-invert max-w-none text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                  {activeArticle.content}
                </div>
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center text-xs">
                <span className="text-zinc-400">Published by CherryFlow Editorial</span>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
