'use client';

import { useState } from 'react';
import { Database, Server, Eye, EyeOff, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'redis';
  host: string;
  port: number;
  database: string;
  username: string;
  connected: boolean;
}

interface QueryResult {
  columns: string[];
  rows: (string | number)[][];
  executionTime: number;
}

export default function DatabaseExplorer() {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newConnection, setNewConnection] = useState<{
    name: string;
    type: 'mysql' | 'postgresql' | 'mongodb' | 'redis';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  }>({
    name: '',
    type: 'mysql',
    host: '',
    port: 3306,
    database: '',
    username: '',
    password: '',
  });
  const [results, setResults] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleConnect = async () => {
    // Add new connection
    const connection: DatabaseConnection = {
      id: Date.now().toString(),
      name: newConnection.name,
      type: newConnection.type,
      host: newConnection.host,
      port: newConnection.port,
      database: newConnection.database,
      username: newConnection.username,
      connected: true,
    };

    setConnections([...connections, connection]);
    setActiveConnection(connection.id);
    setNewConnection({
      name: '',
      type: 'mysql',
      host: '',
      port: 3306,
      database: '',
      username: '',
      password: '',
    });
  };

  const handleQuery = async () => {
    if (!query.trim() || !activeConnection) return;

    setIsExecuting(true);
    setResults(null);

    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock results
    const mockResults: QueryResult = {
      columns: ['id', 'name', 'email', 'created_at'],
      rows: [
        [1, 'John Doe', 'john@example.com', '2024-01-15'],
        [2, 'Jane Smith', 'jane@example.com', '2024-01-16'],
        [3, 'Bob Johnson', 'bob@example.com', '2024-01-17'],
      ],
      executionTime: 0.023,
    };

    setResults(mockResults);
    setIsExecuting(false);
  };

  return (
    <div className="relative glass-strong rounded-2xl p-8 backdrop-blur-strong border border-border/50 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-neon-green/5 animate-pulse" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyber-blue/20 text-cyber-blue">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground" style={{
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              }}>Database Explorer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connect, query, and manage databases
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connections Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <h4 className="font-semibold text-foreground mb-4">Connections</h4>
              <div className="space-y-2">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    onClick={() => setActiveConnection(conn.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      activeConnection === conn.id
                        ? 'bg-cyber-blue/20 border-cyber-blue/50'
                        : 'bg-muted/20 border-border/30 hover:border-border/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-cyber-blue" />
                        <span className="font-medium text-foreground">{conn.name}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${conn.connected ? 'bg-neon-green' : 'bg-muted-foreground'}`} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {conn.type.toUpperCase()} • {conn.host}:{conn.port}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Connection Form */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <h4 className="font-semibold text-foreground mb-4">New Connection</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Connection Name"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
                />
                <select
                  value={newConnection.type}
                  onChange={(e) => setNewConnection({ ...newConnection, type: e.target.value as 'mysql' | 'postgresql' | 'mongodb' | 'redis' })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
                >
                  <option value="mysql">MySQL</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="redis">Redis</option>
                </select>
                <input
                  type="text"
                  placeholder="Host"
                  value={newConnection.host}
                  onChange={(e) => setNewConnection({ ...newConnection, host: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
                />
                <input
                  type="number"
                  placeholder="Port"
                  value={newConnection.port}
                  onChange={(e) => setNewConnection({ ...newConnection, port: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
                />
                <input
                  type="text"
                  placeholder="Database"
                  value={newConnection.database}
                  onChange={(e) => setNewConnection({ ...newConnection, database: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={newConnection.username}
                  onChange={(e) => setNewConnection({ ...newConnection, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={newConnection.password}
                    onChange={(e) => setNewConnection({ ...newConnection, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleConnect}
                  className="w-full px-4 py-2 rounded-lg bg-cyber-blue/20 hover:bg-cyber-blue/30 border border-cyber-blue/50 text-cyber-blue font-medium transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>

          {/* Query Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <h4 className="font-semibold text-foreground mb-4">SQL Query</h4>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SELECT * FROM users WHERE id = 1;"
                className="w-full h-32 px-4 py-3 rounded-lg bg-dark-secondary border border-border/50 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 resize-none"
              />
              <button
                onClick={handleQuery}
                disabled={!activeConnection || isExecuting}
                className="mt-3 px-6 py-2 rounded-lg bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green/50 text-neon-green font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isExecuting ? 'Executing...' : 'Execute Query'}
              </button>
            </div>

            {/* Results */}
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">Results</h4>
                  <span className="text-xs text-muted-foreground">
                    {results.rows.length} rows • {results.executionTime}s
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        {results.columns.map((col, idx) => (
                          <th key={idx} className="px-4 py-2 text-left text-foreground font-semibold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-border/10 hover:bg-muted/20">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-4 py-2 text-foreground font-mono">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {!activeConnection && (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Create a connection to start querying</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

