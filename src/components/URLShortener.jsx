import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import config from '../config';

const URLShortener = () => {
    // State management
    const [url, setUrl] = useState('');
    const [collisionStrategy, setCollisionStrategy] = useState('linear');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [topUrls, setTopUrls] = useState([]);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('shorten'); // shorten, stats, top

    // Fetch statistics on mount
    useEffect(() => {
        fetchStats();
        fetchTopUrls();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.getStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchTopUrls = async () => {
        try {
            const data = await api.getTopUrls();
            setTopUrls(data.top_urls || []);
        } catch (err) {
            console.error('Failed to fetch top URLs:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const data = await api.shortenUrl(url, collisionStrategy);
            setResult(data);
            setUrl('');

            // Refresh stats and top URLs
            setTimeout(() => {
                fetchStats();
                fetchTopUrls();
            }, 500);
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const StatCard = ({ title, value, subtitle, icon, color = 'indigo' }) => (
        <div className="stat-card">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <p className={`text-3xl font-bold text-${color}-400 mb-1`}>{value}</p>
                    {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
                </div>
                {icon && (
                    <div className={`text-${color}-500 text-2xl opacity-50`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 fade-in">
                    <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">
                        <span className="gradient-text">TinyURL</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-2">
                        URL Shortener with Custom DSA Implementations
                    </p>
                    <p className="text-sm text-slate-500">
                        Built with Hash Map • LRU Cache • Trie • Min Heap • Base62 • Collision Detection
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8 slide-in">
                    <div className="glass rounded-xl p-1 inline-flex">
                        <button
                            onClick={() => setActiveTab('shorten')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'shorten'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            🔗 Shorten URL
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'stats'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            📊 Statistics
                        </button>
                        <button
                            onClick={() => setActiveTab('top')}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'top'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            🔥 Top URLs
                        </button>
                    </div>
                </div>

                {/* Shorten URL Tab */}
                {activeTab === 'shorten' && (
                    <div className="max-w-3xl mx-auto fade-in">
                        {/* Main Form */}
                        <div className="card mb-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Enter URL to Shorten
                                    </label>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://www.example.com/very/long/url"
                                        className="input"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Collision Resolution Strategy
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { value: 'linear', label: 'Linear Probing', desc: 'abc → abd → abe' },
                                            { value: 'regenerate', label: 'Regeneration', desc: 'abc → x7K9mP' },
                                            { value: 'append', label: 'Append Counter', desc: 'abc → abc1 → abc2' }
                                        ].map((strategy) => (
                                            <label
                                                key={strategy.value}
                                                className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${collisionStrategy === strategy.value
                                                    ? 'border-indigo-500 bg-indigo-500/10'
                                                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="strategy"
                                                    value={strategy.value}
                                                    checked={collisionStrategy === strategy.value}
                                                    onChange={(e) => setCollisionStrategy(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className="text-center">
                                                    <p className="font-semibold text-slate-200 mb-1">{strategy.label}</p>
                                                    <p className="text-xs text-slate-500">{strategy.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full text-lg"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <span className="spinner mr-3"></span>
                                            Shortening...
                                        </span>
                                    ) : (
                                        '✨ Shorten URL'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="card bg-red-500/10 border-red-500/30 mb-8 fade-in">
                                <div className="flex items-start">
                                    <span className="text-2xl mr-3">❌</span>
                                    <div>
                                        <h3 className="font-semibold text-red-400 mb-1">Error</h3>
                                        <p className="text-red-300 text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success Result */}
                        {result && (
                            <div className="card bg-green-500/10 border-green-500/30 fade-in">
                                <div className="flex items-start mb-4">
                                    <span className="text-3xl mr-3">✅</span>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-green-400 text-xl mb-2">URL Shortened Successfully!</h3>

                                        {/* Short URL */}
                                        <div className="bg-slate-900 rounded-lg p-4 mb-4">
                                            <p className="text-xs text-slate-500 mb-2">Your Short URL:</p>
                                            <div className="flex items-center justify-between">
                                                <a
                                                    href={result.short_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-400 hover:text-indigo-300 font-mono text-lg break-all"
                                                >
                                                    {result.short_url}
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(result.short_url)}
                                                    className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-300 flex-shrink-0"
                                                >
                                                    {copied ? '✓ Copied!' : '📋 Copy'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <p className="text-xs text-slate-500 mb-1">Short Code</p>
                                                <p className="font-mono font-bold text-green-400">{result.short_code}</p>
                                            </div>
                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <p className="text-xs text-slate-500 mb-1">Attempts</p>
                                                <p className="font-bold text-slate-200">{result.attempts}</p>
                                            </div>
                                            <div className="bg-slate-800/50 rounded-lg p-3">
                                                <p className="text-xs text-slate-500 mb-1">Cached</p>
                                                <p className="font-bold text-slate-200">{result.cached ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>

                                        {/* Collision Info */}
                                        {result.collision_detected && (
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                                <p className="text-yellow-400 text-sm font-semibold mb-1">
                                                    ⚠️ Collision Detected & Resolved
                                                </p>
                                                <p className="text-yellow-300 text-xs">
                                                    Strategy used: <span className="font-mono">{result.strategy_used}</span>
                                                </p>
                                            </div>
                                        )}

                                        {/* Original URL */}
                                        <div className="mt-4 pt-4 border-t border-slate-700">
                                            <p className="text-xs text-slate-500 mb-1">Original URL:</p>
                                            <p className="text-slate-400 text-sm break-all">{result.original_url}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Statistics Tab */}
                {activeTab === 'stats' && stats && (
                    <div className="fade-in">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-slate-200 mb-2">DSA Performance Metrics</h2>
                            <p className="text-slate-400">Real-time statistics from custom data structures</p>
                        </div>

                        {/* Hash Map Stats */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center">
                                <span className="text-2xl mr-2">🗂️</span>
                                Hash Map Statistics
                            </h3>
                            <div className="grid-auto-fit">
                                <StatCard
                                    title="Total Entries"
                                    value={stats.hash_map.size}
                                    subtitle={`Capacity: ${stats.hash_map.capacity}`}
                                    color="indigo"
                                />
                                <StatCard
                                    title="Load Factor"
                                    value={`${(stats.hash_map.load_factor * 100).toFixed(1)}%`}
                                    subtitle="Optimal: < 75%"
                                    color="purple"
                                />
                                <StatCard
                                    title="Collisions"
                                    value={stats.hash_map.collision_count}
                                    subtitle={`Avg chain: ${stats.hash_map.avg_chain_length}`}
                                    color="pink"
                                />
                                <StatCard
                                    title="Max Chain Length"
                                    value={stats.hash_map.max_chain_length}
                                    subtitle={`${stats.hash_map.non_empty_buckets} non-empty buckets`}
                                    color="rose"
                                />
                            </div>
                        </div>

                        {/* LRU Cache Stats */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                                <span className="text-2xl mr-2">⚡</span>
                                LRU Cache Performance
                            </h3>
                            <div className="grid-auto-fit">
                                <StatCard
                                    title="Cache Size"
                                    value={stats.lru_cache.size}
                                    subtitle={`Capacity: ${stats.lru_cache.capacity}`}
                                    color="green"
                                />
                                <StatCard
                                    title="Hit Rate"
                                    value={`${stats.lru_cache.hit_rate}%`}
                                    subtitle={`${stats.lru_cache.hits} hits, ${stats.lru_cache.misses} misses`}
                                    color="emerald"
                                />
                                <StatCard
                                    title="Evictions"
                                    value={stats.lru_cache.evictions}
                                    subtitle="Items removed when full"
                                    color="teal"
                                />
                                <StatCard
                                    title="Utilization"
                                    value={`${stats.lru_cache.utilization}%`}
                                    subtitle="Current usage"
                                    color="cyan"
                                />
                            </div>
                        </div>

                        {/* Trie Stats */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
                                <span className="text-2xl mr-2">🌳</span>
                                Trie Structure
                            </h3>
                            <div className="grid-auto-fit">
                                <StatCard
                                    title="Total URLs"
                                    value={stats.trie.total_urls}
                                    subtitle="Indexed for search"
                                    color="yellow"
                                />
                                <StatCard
                                    title="Total Nodes"
                                    value={stats.trie.total_nodes}
                                    subtitle="Tree nodes created"
                                    color="amber"
                                />
                                <StatCard
                                    title="Avg Nodes/URL"
                                    value={stats.trie.avg_nodes_per_url}
                                    subtitle="Prefix sharing efficiency"
                                    color="orange"
                                />
                            </div>
                        </div>

                        {/* Collision Detector Stats */}
                        <div>
                            <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                                <span className="text-2xl mr-2">⚠️</span>
                                Collision Detection
                            </h3>
                            <div className="grid-auto-fit">
                                <StatCard
                                    title="Total Collisions"
                                    value={stats.collision_detector.total_collisions}
                                    subtitle="Detected and resolved"
                                    color="red"
                                />
                                <StatCard
                                    title="Linear Probing"
                                    value={stats.collision_detector.linear_probing_used}
                                    subtitle={`${stats.collision_detector.linear_probing_percentage}%`}
                                    color="rose"
                                />
                                <StatCard
                                    title="Regeneration"
                                    value={stats.collision_detector.regeneration_used}
                                    subtitle={`${stats.collision_detector.regeneration_percentage}%`}
                                    color="pink"
                                />
                                <StatCard
                                    title="Max Attempts"
                                    value={stats.collision_detector.max_attempts}
                                    subtitle="Worst case resolution"
                                    color="fuchsia"
                                />
                            </div>
                        </div>

                        {/* Refresh Button */}
                        <div className="text-center mt-8">
                            <button
                                onClick={fetchStats}
                                className="btn btn-secondary"
                            >
                                🔄 Refresh Statistics
                            </button>
                        </div>
                    </div>
                )}

                {/* Top URLs Tab */}
                {activeTab === 'top' && (
                    <div className="fade-in">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-slate-200 mb-2">🔥 Most Popular URLs</h2>
                            <p className="text-slate-400">Tracked using Min Heap data structure</p>
                        </div>

                        {topUrls.length === 0 ? (
                            <div className="card text-center py-12">
                                <p className="text-slate-400 text-lg mb-2">No URLs yet</p>
                                <p className="text-slate-500 text-sm">Start shortening URLs to see analytics here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {topUrls.map((urlData, index) => (
                                    <div
                                        key={urlData.id}
                                        className="card card-hover"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-start">
                                            {/* Rank */}
                                            <div className="flex-shrink-0 mr-4">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${index === 0
                                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                                                        : index === 1
                                                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900'
                                                            : index === 2
                                                                ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900'
                                                                : 'bg-slate-700 text-slate-300'
                                                        }`}
                                                >
                                                    #{index + 1}
                                                </div>
                                            </div>

                                            {/* URL Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <a
                                                        href={`${config.API_BASE_URL}/${urlData.short_code}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-400 hover:text-indigo-300 font-mono font-semibold"
                                                    >
                                                        /{urlData.short_code}
                                                    </a>
                                                    <span className="badge badge-primary ml-2">
                                                        {urlData.clicks} clicks
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 text-sm truncate mb-2">
                                                    {urlData.original_url}
                                                </p>
                                                <div className="flex items-center text-xs text-slate-500">
                                                    <span>Created: {new Date(urlData.created_at).toLocaleDateString()}</span>
                                                    {urlData.collision_resolved && (
                                                        <span className="ml-4 badge badge-warning">
                                                            Collision Resolved ({urlData.resolution_strategy})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Copy Button */}
                                            <button
                                                onClick={() => copyToClipboard(`${config.API_BASE_URL}/${urlData.short_code}`)}
                                                className="ml-4 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-300 flex-shrink-0"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Refresh Button */}
                        <div className="text-center mt-8">
                            <button
                                onClick={fetchTopUrls}
                                className="btn btn-secondary"
                            >
                                🔄 Refresh Top URLs
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-16 text-center text-slate-500 text-sm">
                    <p className="mb-2">
                        Built with custom implementations of Hash Map, LRU Cache, Trie, Min Heap, Base62 & Collision Detection
                    </p>
                    <p>
                        No external DSA libraries • All algorithms implemented from scratch
                    </p>
                </div>
            </div>
        </div>
    );
};

export default URLShortener;
