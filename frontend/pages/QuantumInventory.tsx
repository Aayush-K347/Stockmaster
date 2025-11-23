import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Copy, Check, Database, Zap, Terminal, Activity } from "lucide-react";
import { toast } from "sonner";

interface QueryResult {
  success: boolean;
  question: string;
  sql: string;
  answer: string;
  summary?: string;
  data?: any[];
  rowCount?: number;
  meta?: any;
}

const API_BASE_URL = "https://satisfied-prosperity-production.up.railway.app";

const QuantumInventory = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const inputRef = useRef<HTMLInputElement>(null);

  const exampleQuestions = [
    "List all warehouses",
    "Show total inventory valuation",
    "Which products are below minimum stock level?",
    "What are the top 5 products by quantity?",
    "Show all products with their current stock",
  ];

  useEffect(() => {
    // Check backend connection
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        setConnectionStatus(response.ok ? "connected" : "disconnected");
      } catch {
        setConnectionStatus("disconnected");
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle error responses
        setResult({
          success: false,
          question,
          sql: data.sql || "",
          answer: data.error || "An error occurred while processing your query.",
          data: [],
          rowCount: 0,
        });
        toast.error(data.error || "Query failed");
      } else {
        setResult(data);
        if (data.success) {
          toast.success("Query executed successfully!");
        } else {
          toast.error(data.error || "Query failed");
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect to backend");
      setResult({
        success: false,
        question,
        sql: "",
        answer: "Failed to connect to backend. Make sure the server is running at https://satisfied-prosperity-production.up.railway.app",
        data: [],
        rowCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
    inputRef.current?.focus();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-full bg-[#02010A] overflow-hidden relative -m-6 md:-m-8">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#02010A] via-[#05050A] to-[#02010A]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(270_70%_70%_/_0.1),_transparent_50%)]" />
        <ParticleField />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#05050A]/50 backdrop-blur-md border border-white/10">
            <motion.div
              animate={{
                scale: connectionStatus === "connected" ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "checking"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-sm text-white">
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "checking"
                ? "Checking..."
                : "Disconnected"}
            </span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 pt-20"
        >
          <motion.div
            animate={{
              textShadow: [
                "0 0 20px hsl(270 70% 70% / 0.5)",
                "0 0 40px hsl(270 70% 70% / 0.8)",
                "0 0 20px hsl(270 70% 70% / 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative inline-block"
          >
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 bg-clip-text text-transparent mb-4">
              Inventory Bot
            </h1>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-8 -right-8"
            >
              <Sparkles className="w-12 h-12 text-purple-400" />
            </motion.div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-400 mt-4"
          >
            Ask questions in natural language, get instant SQL-powered answers
          </motion.p>
        </motion.div>

        {/* Query Input Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="relative group">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-purple-400 via-purple-300 to-purple-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
            />
            <div className="relative bg-[#05050A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-4 mb-6">
                  <Terminal className="w-6 h-6 text-purple-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask anything about your inventory..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    disabled={loading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <motion.div
                      animate={{ x: loading ? [0, 100, 0] : 0 }}
                      transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative flex items-center gap-2">
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      {loading ? "Processing..." : "Execute"}
                    </span>
                  </motion.button>
                </div>
              </form>

              {/* Example Questions */}
              <div className="flex flex-wrap gap-3">
                {exampleQuestions.map((example, index) => (
                  <motion.button
                    key={example}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExampleClick(example)}
                    className="px-4 py-2 bg-black/20 hover:bg-black/30 border border-white/10 rounded-full text-sm text-white transition-all"
                  >
                    {example}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: "spring", damping: 20 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              {/* Stats Cards */}
              {result.success && result.rowCount !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    icon={<Database className="w-6 h-6" />}
                    label="Rows Returned"
                    value={result.rowCount || 0}
                    delay={0}
                  />
                  <StatCard
                    icon={<Activity className="w-6 h-6" />}
                    label="Query Status"
                    value="Success"
                    delay={0.1}
                  />
                  <StatCard
                    icon={<Zap className="w-6 h-6" />}
                    label="Response Time"
                    value={result.meta?.duration || "<100ms"}
                    delay={0.2}
                  />
                </div>
              )}

              {/* Answer Card */}
              <ResultCard title={result.success ? "Natural Language Answer" : "Error"}>
                <TypewriterText text={result.answer || result.error || "An error occurred"} />
                {result.suggestion && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      <strong>💡 Suggestion:</strong> {result.suggestion}
                    </p>
                  </div>
                )}
              </ResultCard>

              {/* SQL Query Card */}
              {result.sql && (
                <ResultCard title="SQL Query">
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(result.sql)}
                      className="absolute top-2 right-2 p-2 bg-black/20 hover:bg-black/30 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-white" />
                      )}
                    </motion.button>
                    <pre className="bg-black/20 rounded-lg p-4 overflow-x-auto">
                      <code className="text-purple-300 text-sm font-mono">
                        {result.sql}
                      </code>
                    </pre>
                  </div>
                </ResultCard>
              )}

              {/* Data Table */}
              {result.data && result.data.length > 0 && (
                <ResultCard title="Query Results">
                  <DataTable data={result.data} />
                </ResultCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Particle Field Component
const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-300 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
    <div className="relative bg-[#05050A]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-400/20 rounded-lg text-purple-400">{icon}</div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-white"
          >
            {value}
          </motion.p>
        </div>
      </div>
    </div>
  </motion.div>
);

// Result Card Component
const ResultCard = ({ title, children }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-300/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative bg-[#05050A]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        {title}
      </h3>
      {children}
    </div>
  </motion.div>
);

// Typewriter Text Component
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [text]);

  return <p className="text-white text-lg leading-relaxed">{displayText}</p>;
};

// Data Table Component
const DataTable = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.2)" }}
              className="border-b border-white/5 transition-colors"
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-3 text-sm text-gray-400">
                  {String(row[col])}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuantumInventory;

