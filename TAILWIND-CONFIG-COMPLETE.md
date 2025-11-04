# ✅ Tailwind Config - CyberStrike Özelleştirmeleri

## 🎨 Özel Renkler

### Gradient Renkler
```css
/* Neon Yeşil Gradyan */
bg-neon-green → linear-gradient(135deg, #00FF41 0%, #00C832 100%)
text-neon-green → #00FF41

/* Siber Mavi Gradyan */
bg-cyber-blue → linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)
text-cyber-blue → #00D4FF

/* Tehlike Kırmızısı Gradyan */
bg-danger-red → linear-gradient(135deg, #FF0040 0%, #CC0033 100%)
text-danger-red → #FF0040
```

### Dark Theme Renkler
```css
bg-dark-primary → #0A0A0B
bg-dark-secondary → #1A1A1C
```

### Glassmorphism Card
```css
card-glass → rgba(20, 20, 22, 0.8)
```

---

## 🎬 Özel Animasyonlar

### 1. `pulse-neon`
**Neon ışık efekti**
```css
animate-pulse-neon
```
- 2 saniye döngü
- Box shadow ile neon glow efekti
- Opacity değişimi

### 2. `scan-line`
**Tarama çizgisi efekti**
```css
animate-scan-line
```
- 3 saniye döngü
- Y ekseninde hareket
- Matrix tarama efekti

### 3. `glitch`
**Siber glitch efekti**
```css
animate-glitch
```
- 0.3 saniye döngü
- Transform ve hue-rotate
- Cyberpunk glitch efekti

### 4. `matrix-rain`
**Matrix yağmur efekti**
```css
animate-matrix-rain
```
- 8 saniye döngü
- Y ekseninde düşen efekt
- Matrix tarzı animasyon

---

## 🔮 Glassmorphism Utilities

### Glass Effects
```css
.glass {
  background: rgba(20, 20, 22, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card {
  background: rgba(20, 20, 22, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-strong {
  background: rgba(20, 20, 22, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
```

### Backdrop Blur Utilities
```css
.backdrop-blur-glass → blur(12px)
.backdrop-blur-card → blur(16px)
.backdrop-blur-strong → blur(24px)
```

---

## 🌈 Neon Glow Effects

```css
.glow-neon-green {
  box-shadow: 0 0 10px #00FF41, 0 0 20px #00FF41, 0 0 30px #00FF41;
}

.glow-cyber-blue {
  box-shadow: 0 0 10px #00D4FF, 0 0 20px #00D4FF, 0 0 30px #00D4FF;
}

.glow-danger-red {
  box-shadow: 0 0 10px #FF0040, 0 0 20px #FF0040, 0 0 30px #FF0040;
}
```

---

## 📐 Border Gradients

```css
.border-gradient-neon → linear-gradient(135deg, #00FF41, #00C832)
.border-gradient-cyber → linear-gradient(135deg, #00D4FF, #0099CC)
.border-gradient-danger → linear-gradient(135deg, #FF0040, #CC0033)
```

---

## 🎯 Kullanım Örnekleri

### Gradient Background
```tsx
<div className="bg-gradient-neon-green">
  Neon green gradient
</div>
```

### Glassmorphism Card
```tsx
<div className="glass-card rounded-lg p-6">
  Glass effect card
</div>
```

### Neon Glow
```tsx
<button className="glow-neon-green animate-pulse-neon">
  Neon Button
</button>
```

### Glitch Effect
```tsx
<h1 className="animate-glitch text-cyber-blue">
  Glitch Text
</h1>
```

### Scan Line
```tsx
<div className="relative overflow-hidden">
  <div className="absolute inset-0 animate-scan-line bg-cyber-blue/20" />
  Content
</div>
```

---

## ✅ Özellikler

- ✅ **Özel Renkler** - Neon yeşil, siber mavi, tehlike kırmızısı
- ✅ **Gradient Backgrounds** - 3 farklı gradient
- ✅ **4 Özel Animasyon** - pulse-neon, scan-line, glitch, matrix-rain
- ✅ **Glassmorphism** - 3 seviye blur efekti
- ✅ **Neon Glow** - 3 farklı glow efekti
- ✅ **Backdrop Blur** - 3 seviye blur utility
- ✅ **Border Gradients** - 3 farklı border gradient

**Tüm özellikler hazır! 🚀**

---

**Son Güncelleme:** 2024-12-19

