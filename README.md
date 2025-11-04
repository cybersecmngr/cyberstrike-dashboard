# 🎯 CyberStrike Dashboard

Advanced cyber security monitoring dashboard built with Next.js 14, Tailwind CSS, and modern React libraries.

## 🚀 Features

- **Real-time Security Monitoring**
- **Attack Timeline Visualization**
- **Threat Distribution Analytics**
- **System Health Metrics**
- **Dark Theme Only** (Optimized for security operations)

## 🛠️ Tech Stack

- **Next.js 14** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **shadcn/ui** - UI components
- **Radix UI** - Accessible primitives

## 📦 Dependencies

```json
{
  "@radix-ui/react-icons": "^1.3.2",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-tabs": "^1.1.13",
  "recharts": "^3.3.0",
  "framer-motion": "^12.23.24",
  "lucide-react": "^0.552.0"
}
```

## 🎨 Design

- **Dark Theme Only** - No light mode
- **Modern UI** - Clean and professional
- **Responsive** - Works on all screen sizes
- **Animated** - Smooth transitions with Framer Motion

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 📁 Project Structure

```
cyberstrike-dashboard/
├── app/
│   ├── layout.tsx      # Root layout with dark theme
│   ├── page.tsx        # Main dashboard page
│   └── globals.css     # Global styles & dark theme
├── components/         # shadcn/ui components
├── lib/
│   └── utils.ts        # Utility functions
└── package.json
```

## 🎯 Key Components

- **StatCard** - Security metrics display
- **Attack Timeline** - Area chart showing attack trends
- **Threat Distribution** - Bar chart for threat types
- **Real-time Activity** - Live security event feed

---

**Built with ❤️ for cyber security professionals**
