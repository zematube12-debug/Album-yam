import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface PhotoItem {
  id: string;
  t: string; // thumb
  m: string; // medium
  f: string; // full print res
  fx: number; // crop pan X (0..1)
  fy: number; // crop pan Y (0..1)
  z: number;  // crop zoom (1..3)
  bright?: number;
  contrast?: number;
}

export interface ThemeConfig {
  id: string;
  n: string;
  am: string;
  paper: string;
  cover: string;
  ced: string;
  cink: string;
  acc: string;
  ink: string;
  sub: string;
  bg: string;
  s1: string;
  s2: string;
  mat: string;
  edge: string;
  deco: 'frame' | 'habesha' | 'arch' | 'leaf' | 'deco' | 'floral' | 'double' | 'minimal';
  scr: string;
  dsp: string;
}

export interface LayoutAdjustments {
  m: number;   // Page Margin
  g: number;   // Photo Gap
  r: number;   // Corner Radius
  mat: number; // Mat Border
  ps: number;  // Photo Shadow
  sp: number;  // Spine Crease Shadow
  sh: number;  // Book Drop Shadow
  ss: number;  // Shadow Spread
}

export interface PageConfig {
  layout: string;
  slots: number[]; // Photo indices assigned to each slot of this page
  caption: string;
  subCaption: string;
  showPageNum: boolean;
}

// ============================================================================
// 12 LUXURY TEMPLATES (THEMES)
// ============================================================================
export const THEMES: ThemeConfig[] = [
  { id: 'ivory-gold', n: 'Ivory Gold', am: 'የዝሆን ጥርስ እና ወርቅ', paper: '#fbf8f2', cover: '#efe4cf', ced: '#cdb98f', cink: '#3a2f22', acc: '#b8924a', ink: '#3a2f22', sub: '#8a7a63', bg: '#ece4d4', s1: '#dccfb4', s2: '#a99874', mat: '#ffffff', edge: '#e0cc9a', deco: 'frame', scr: '"Pinyon Script"', dsp: '"Cormorant Garamond"' },
  { id: 'habesha-royal', n: 'Habesha Royal', am: 'ሐበሻ ወርቅ እና ጥበብ', paper: '#fcf9f2', cover: '#181410', ced: '#0f0c09', cink: '#f5e3b8', acc: '#d4af37', ink: '#261d13', sub: '#877355', bg: '#e8dec8', s1: '#dfd1b4', s2: '#9c865c', mat: '#ffffff', edge: '#d4af37', deco: 'habesha', scr: '"Great Vibes"', dsp: '"Cinzel"' },
  { id: 'gondar-gold', n: 'Royal Gondar Velvet', am: 'የጎንደር ቤተ-መንግስት ወርቅ', paper: '#f9f5eb', cover: '#241715', ced: '#160d0c', cink: '#ffdf85', acc: '#cfa346', ink: '#2b1d16', sub: '#7d6856', bg: '#dfd5c3', s1: '#d2c2a8', s2: '#8c775c', mat: '#fffdf9', edge: '#e5c158', deco: 'habesha', scr: '"Pinyon Script"', dsp: '"Cinzel"' },
  { id: 'obsidian-cinema', n: 'Obsidian Cinema', am: 'ጥቁር ሲኒማ (Dark Gallery)', paper: '#161514', cover: '#0d0c0b', ced: '#050505', cink: '#e5c883', acc: '#c5a059', ink: '#f2ece1', sub: '#9e9485', bg: '#1c1a18', s1: '#2e2a25', s2: '#12100e', mat: '#242220', edge: '#c5a059', deco: 'double', scr: '"Great Vibes"', dsp: '"Cormorant Garamond"' },
  { id: 'vogue-white', n: 'Pure Vogue Editorial', am: 'ዘመናዊ ነጭ መጽሔት', paper: '#ffffff', cover: '#f7f7f5', ced: '#dcdcdc', cink: '#111111', acc: '#1a1a1a', ink: '#111111', sub: '#666666', bg: '#efefef', s1: '#ffffff', s2: '#cccccc', mat: '#f4f4f4', edge: '#d4af37', deco: 'minimal', scr: '"Parisienne"', dsp: '"Playfair Display"' },
  { id: 'blush-rose', n: 'Blush Rose Arch', am: 'ሮዝ እና ወርቅ', paper: '#fff7f6', cover: '#f3d5d2', ced: '#d9a9a6', cink: '#6b3a42', acc: '#b76e79', ink: '#5a3a3f', sub: '#9a7b7f', bg: '#f6e3e0', s1: '#ebc5c5', s2: '#b58187', mat: '#ffffff', edge: '#f1cfcc', deco: 'arch', scr: '"Great Vibes"', dsp: '"Playfair Display"' },
  { id: 'sage-garden', n: 'Sage Botanical', am: 'አረንጓዴ ገነት', paper: '#f9fbf6', cover: '#c8d8c0', ced: '#9db592', cink: '#2f4129', acc: '#6f8a5f', ink: '#34432f', sub: '#7b8a72', bg: '#e2eadb', s1: '#c2d4b9', s2: '#84a078', mat: '#ffffff', edge: '#d5e2cd', deco: 'leaf', scr: '"Parisienne"', dsp: '"Cormorant Garamond"' },
  { id: 'navy-champagne', n: 'Navy & Champagne', am: 'ሰማያዊ እና ሻምፓኝ', paper: '#fdfbf7', cover: '#1f2f4d', ced: '#14213a', cink: '#f1e3bb', acc: '#c9a96a', ink: '#1f2f4d', sub: '#6d7890', bg: '#dde3ec', s1: '#d0d9e8', s2: '#8f9db8', mat: '#ffffff', edge: '#c9a96a', deco: 'deco', scr: '"Great Vibes"', dsp: '"Cinzel"' },
  { id: 'burgundy-marsala', n: 'Burgundy Marsala', am: 'ወይን ጠጅ እና ወርቅ', paper: '#fbf5f0', cover: '#5c1926', ced: '#3d0e17', cink: '#f2dcc0', acc: '#c99b5f', ink: '#4a1520', sub: '#8f6a6e', bg: '#ead8d2', s1: '#e8cfc5', s2: '#b08c84', mat: '#ffffff', edge: '#d9b27c', deco: 'floral', scr: '"Pinyon Script"', dsp: '"Playfair Display"' },
  { id: 'emerald-brass', n: 'Emerald & Antique Brass', am: 'ኤመራልድ አረንጓዴ', paper: '#faf8f2', cover: '#133328', ced: '#0b2119', cink: '#edd8a6', acc: '#b89448', ink: '#172e25', sub: '#687d73', bg: '#dce6e1', s1: '#c5d6ce', s2: '#7a9488', mat: '#ffffff', edge: '#d4b26a', deco: 'frame', scr: '"Great Vibes"', dsp: '"Cinzel"' },
  { id: 'terracotta-sand', n: 'Terracotta Desert', am: 'ቴራኮታ እና አሸዋ', paper: '#fdf9f3', cover: '#b85d43', ced: '#8f422c', cink: '#fff2e6', acc: '#c87d55', ink: '#4a2c22', sub: '#997466', bg: '#f2e4d8', s1: '#e8d0bc', s2: '#ba967c', mat: '#ffffff', edge: '#e0b694', deco: 'arch', scr: '"Parisienne"', dsp: '"Cormorant Garamond"' },
  { id: 'mocha-silk', n: 'Mocha & Warm Silk', am: 'ሞካ እና ሐር', paper: '#faf6f0', cover: '#3d2e24', ced: '#291e17', cink: '#ebdcc7', acc: '#a8845e', ink: '#36281e', sub: '#877567', bg: '#e6ddd3', s1: '#d9cbbd', s2: '#9e8b78', mat: '#ffffff', edge: '#cfb393', deco: 'double', scr: '"Pinyon Script"', dsp: '"Playfair Display"' }
];

export const COLOR_FILTERS: Record<string, { n: string; f: string }> = {
  none: { n: 'ተፈጥሯዊ · Natural', f: 'none' },
  warm: { n: 'ወርቃማ · Golden Warmth', f: 'sepia(0.16) saturate(1.16) contrast(1.03)' },
  vintage: { n: 'ክላሲክ · Film Vintage', f: 'sepia(0.32) contrast(1.06) brightness(0.98)' },
  bw: { n: 'ጥቁር እና ነጭ · Fine Art B&W', f: 'grayscale(1) contrast(1.14)' },
  airy: { n: 'ብሩህ · Bright & Airy', f: 'brightness(1.07) contrast(0.96) saturate(1.05)' },
  cinema: { n: 'ሲኒማ · Moody Rich', f: 'contrast(1.15) saturate(0.92) brightness(0.96)' }
};

// ============================================================================
// 25 PROFESSIONAL PAGE LAYOUT DEFINITIONS
// ============================================================================
export const LAYOUT_META: Record<string, { name: string; count: number; cat: string }> = {
  // 1-Photo Hero & Editorial (7)
  full:         { name: '01 · ሙሉ ገጽ (Full Bleed)', count: 1, cat: '1 Photo' },
  matted:       { name: '02 · ክላሲክ ፍሬም (Classic Mat)', count: 1, cat: '1 Photo' },
  wide:         { name: '03 · ሲኒማ ፓኖራማ (Cinematic)', count: 1, cat: '1 Photo' },
  polaroid:     { name: '04 · ፖላሮይድ (Polaroid Card)', count: 1, cat: '1 Photo' },
  story:        { name: '05 · ታሪክ እና ጥቅስ (Story Split)', count: 1, cat: '1 Photo' },
  arch:         { name: '06 · የቤተ-መንግስት ቅስት (Royal Arch)', count: 1, cat: '1 Photo' },
  oval:         { name: '07 · ክብ ቪንቴጅ (Vintage Oval)', count: 1, cat: '1 Photo' },
  habeshaFrame: { name: '08 · የሐበሻ ጥበብ ፍሬም (Tibeb Crest)', count: 1, cat: '1 Photo' },
  vowsCard:     { name: '09 · የቃል ኪዳን ገጽ (Vows & Portrait)', count: 1, cat: '1 Photo' },

  // 2-Photo Duos & Layered (6)
  duo:          { name: '10 · ሁለት ተደራራቢ (Vertical Duo)', count: 2, cat: '2 Photos' },
  pair:         { name: '11 · ጎን ለጎን ጥንድ (Side Pair)', count: 2, cat: '2 Photos' },
  overlap:      { name: '12 · ተደራራቢ ኤዲቶሪያል (Overlap)', count: 2, cat: '2 Photos' },
  magazine:     { name: '13 · መጽሔት ቅንብር (Magazine)', count: 2, cat: '2 Photos' },
  splitDiag:    { name: '14 · አግድም ክፍልፍል (Asymmetric Split)', count: 2, cat: '2 Photos' },
  insetBadge:   { name: '15 · ዋና እና ዝርዝር (Hero + Inset)', count: 2, cat: '2 Photos' },

  // 3-Photo Trios (4)
  trio:         { name: '16 · ሶስት ቅንብር (Editorial Trio)', count: 3, cat: '3 Photos' },
  hero3:        { name: '17 · ከላይ ትልቅ + 2 (Top Hero 3)', count: 3, cat: '3 Photos' },
  strips:       { name: '18 · ሶስት ረድፍ (3 Vertical Strips)', count: 3, cat: '3 Photos' },
  panoHalf:     { name: '19 · ፓኖራማ + 2 ካሬ (Pano + 2)', count: 3, cat: '3 Photos' },

  // 4+ Multi-Photo Collages (6)
  mosaic:       { name: '20 · ሞዛይክ 4 (Mosaic 4)', count: 4, cat: '4+ Photos' },
  grid4:        { name: '21 · ካሬ ግሪድ 4 (2×2 Grid)', count: 4, cat: '4+ Photos' },
  film:         { name: '22 · የፊልም ስትሪፕ 4 (Filmstrip 4)', count: 4, cat: '4+ Photos' },
  masonry4:     { name: '23 · ዘመናዊ 4 (Staggered 4)', count: 4, cat: '4+ Photos' },
  collage5:     { name: '24 · ኮላዥ 5 (5-Photo Collage)', count: 5, cat: '4+ Photos' },
  grid6:        { name: '25 · ድግስ ግሪድ 6 (6-Photo Party Grid)', count: 6, cat: '4+ Photos' }
};

export const BOOK_PRESETS: Record<string, { label: string; pages: string[] }> = {
  classic:   { label: 'ክላሲክ · Classic Luxury', pages: ['full', 'mosaic', 'matted', 'trio', 'habeshaFrame', 'duo', 'arch', 'hero3', 'overlap', 'grid4', 'wide', 'vowsCard'] },
  habesha:   { label: 'ሐበሻ · Royal Melse & Tibeb', pages: ['habeshaFrame', 'trio', 'arch', 'collage5', 'overlap', 'grid6', 'oval', 'hero3', 'habeshaFrame', 'mosaic', 'magazine', 'vowsCard'] },
  editorial: { label: 'ኤዲቶሪያል · Vogue Magazine', pages: ['story', 'magazine', 'overlap', 'strips', 'full', 'masonry4', 'insetBadge', 'film', 'splitDiag', 'collage5', 'wide', 'polaroid'] },
  collage:   { label: 'ኮላዥ · Multi-Photo Story', pages: ['hero3', 'grid4', 'collage5', 'grid6', 'mosaic', 'masonry4', 'trio', 'film', 'panoHalf', 'grid6', 'pair', 'vowsCard'] }
};

const DEFAULT_UNSPLASH_IDS = [
  '1519741497674-611481863552', '1511285560929-80b456fea0bc', '1465495976277-4387d4b0b4c6',
  '1520854221256-17451cc331bf', '1519225421980-715cb0215aed', '1522673607200-164d1b6ce486',
  '1515934751635-c81c6bc9a2d8', '1583939003579-730e3918a45a', '1532712938310-34cb3982ef74',
  '1606216794074-735e91aa2c92', '1591604466107-ec97de577aff', '1519671482749-fd09be7ccebf'
];

const DEFAULT_CAPTIONS = [
  'Two hearts, one eternal covenant · ሁለት ልቦች፣ አንድ ዘላለማዊ ቃል ኪዳን',
  'Always and forever begins today · ለዘላለም አብረን',
  'Love captured in golden light · ፍቅር በየቅጽበቱ',
  'Hand in hand, our journey unfolds · የሕይወት ጉዟችን ጅማሬ',
  'Crowned in grace and heritage · የባህል እና የፍቅር ድምቀት',
  'Every moment with you is a treasure · ከአንተ ጋር ያለች እያንዳንዷ ቅጽበት'
];

// ============================================================================
// PROCEDURAL WEB AUDIO ENGINE
// ============================================================================
class AlbumAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;
  private scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

  private init() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  public playFlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const dur = 0.25, sr = this.ctx.sampleRate, len = Math.floor(sr * dur);
      const buf = this.ctx.createBuffer(1, len, sr);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * (i / len)) * 0.13;
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const flt = this.ctx.createBiquadFilter();
      flt.type = 'bandpass';
      flt.frequency.setValueAtTime(920, this.ctx.currentTime);
      flt.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + dur);
      flt.Q.value = 1.8;
      src.connect(flt);
      flt.connect(this.ctx.destination);
      src.start();
    } catch {}
  }

  public playChime() {
    if (!this.enabled || !this.ctx || document.hidden) return;
    try {
      const now = this.ctx.currentTime;
      const note = this.scale[Math.floor(Math.random() * this.scale.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.022, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 3.6);
    } catch {}
  }
}

const audioFX = new AlbumAudioEngine();

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // --- CORE ALBUM STATE ---
  const [bride, setBride] = useState('Selam');
  const [groom, setGroom] = useState('Yonas');
  const [weddingDate, setWeddingDate] = useState('October 14, 2026 • ጥቅምት 04 2019 ዓ.ም');
  const [studioBrand, setStudioBrand] = useState('YAM PICTURE LUXURY EDITION');
  const [themeIndex, setThemeIndex] = useState(0);
  const [colorFilter, setColorFilter] = useState('none');
  const [ls, setLs] = useState<LayoutAdjustments>({
    m: 1, g: 1, r: 0, mat: 1, ps: 1, sp: 1, sh: 1, ss: 1
  });

  // Photos State
  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    DEFAULT_UNSPLASH_IDS.map((id, idx) => {
      const b = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=`;
      return {
        id: `p-${idx}`,
        t: `${b}800&q=85`,
        m: `${b}2200&q=90`,
        f: `${b}3000&q=100`,
        fx: 0.5,
        fy: 0.5,
        z: 1
      };
    })
  );

  // 12 Inner Editable Content Pages (Pages 2..13; Page 1 is Title, Page 14 is Closing)
  const [pagesConfig, setPagesConfig] = useState<PageConfig[]>(() => {
    let ptr = 0;
    return BOOK_PRESETS.classic.pages.map((lay, idx) => {
      const cnt = LAYOUT_META[lay]?.count || 1;
      const slots = Array.from({ length: cnt }, (_, k) => (ptr + k) % DEFAULT_UNSPLASH_IDS.length);
      ptr += cnt;
      return {
        layout: lay,
        slots,
        caption: DEFAULT_CAPTIONS[idx % DEFAULT_CAPTIONS.length],
        subCaption: `${bride} & ${groom}`,
        showPageNum: true
      };
    });
  });

  // UI & Navigation State
  const [started, setStarted] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);
  const [currentLeaf, setCurrentLeaf] = useState(0); // K: 0..8
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'pages' | 'slots' | 'adjust' | 'export' | 'info'>('design');
  const [selectedPageIdx, setSelectedPageIdx] = useState(2); // 2..13
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(0); // slot inside selectedPageIdx
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [layoutCategoryFilter, setLayoutCategoryFilter] = useState('All');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportDpiMode, setExportDpiMode] = useState<'print300' | 'ultra'>('print300');
  const [includeCropMarks, setIncludeCropMarks] = useState(false);

  // Lightbox State
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Refs for Three.js & Loaded HTMLImageElements
  const stageRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLCanvasElement | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);
  const threeCtxRef = useRef<{
    repaintAll: (fast?: boolean) => void;
    rebuildBook: (keepLeaf?: boolean) => void;
    gotoLeaf: (targetK: number) => void;
    turnLeaf: (dir: 1 | -1) => void;
    renderCleanPageCanvas: (pageNumber1To14: number, targetW: number, targetH: number, cleanForPrint: boolean) => HTMLCanvasElement;
    renderCleanCoverCanvas: (targetW: number, targetH: number) => HTMLCanvasElement;
  } | null>(null);

  // Keep mutable mirror ref so Three.js canvas painters always read latest state synchronously
  const stateRef = useRef({
    bride, groom, weddingDate, studioBrand,
    theme: THEMES[themeIndex],
    colorFilter,
    ls,
    photos,
    pagesConfig
  });
  stateRef.current = {
    bride, groom, weddingDate, studioBrand,
    theme: THEMES[themeIndex] || THEMES[0],
    colorFilter,
    ls,
    photos,
    pagesConfig
  };

  // --- LOAD GOOGLE FONTS ---
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Pinyon+Script&family=Great+Vibes&family=Parisienne&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@400;500;600&family=Noto+Serif+Ethiopic:wght@300;400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  // --- FLOATING GOLDEN BOKEH PARTICLES ---
  useEffect(() => {
    const pc = particlesRef.current;
    if (!pc) return;
    const px = pc.getContext('2d');
    if (!px) return;
    let animId = 0;
    let W = (pc.width = window.innerWidth);
    let H = (pc.height = window.innerHeight);
    const onResize = () => {
      if (!pc) return;
      W = pc.width = window.innerWidth;
      H = pc.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const dots = Array.from({ length: 36 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.4 + 0.8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.35 - 0.1,
      a: Math.random() * Math.PI * 2
    }));

    const step = () => {
      animId = requestAnimationFrame(step);
      px.clearRect(0, 0, W, H);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        d.a += 0.015;
        if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
        if (d.x < -10) d.x = W + 10;
        if (d.x > W + 10) d.x = -10;
        const alpha = (Math.sin(d.a) * 0.5 + 0.5) * 0.45;
        px.fillStyle = `rgba(212, 175, 102, ${alpha.toFixed(3)})`;
        px.beginPath();
        px.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        px.fill();
      }
    };
    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // --- PRELOAD IMAGES ---
  useEffect(() => {
    let active = true;
    setLoadingMsg(`ፎቶዎች በመጫን ላይ... 0 / ${photos.length}`);
    let loadedCount = 0;

    photos.forEach((p, idx) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => {
        if (!active) return;
        loadedImagesRef.current[idx] = im;
        loadedCount++;
        if (loadedCount >= Math.min(4, photos.length)) {
          setLoadingMsg(null);
        } else {
          setLoadingMsg(`ፎቶዎች በመጫን ላይ... ${loadedCount} / ${photos.length}`);
        }
        threeCtxRef.current?.repaintAll();
        drawInteractiveCropCanvas();
      };
      im.onerror = () => {
        loadedCount++;
        if (loadedCount >= Math.min(4, photos.length)) setLoadingMsg(null);
      };
      im.src = p.m || p.t;
    });

    return () => { active = false; };
  }, [photos.length]);

  // ============================================================================
  // 2D CANVAS PAGE & 25-LAYOUT RENDERING ENGINE (Shared by 3D WebGL & 300-DPI Print Exporter)
  // ============================================================================
  const paintPageToContext = useCallback((
    g: CanvasRenderingContext2D,
    W: number,
    H: number,
    pageKind: { type: 'cover' | 'endpaper' | 'title' | 'close' | 'content'; contentIndex?: number },
    options?: { isLeftPage?: boolean; isCover?: boolean; cleanPrint?: boolean; outRects?: Array<{ x: number; y: number; w: number; h: number; slotIdx: number; photoIdx: number }> }
  ) => {
    const S = stateRef.current;
    const TH = S.theme;
    const LS = S.ls;
    const imgs = loadedImagesRef.current;
    const u = W / 1400;

    const font = (px: number, type: 'script' | 'display', weight = 400) =>
      `${weight} ${Math.round(px)}px ${type === 'script' ? `${TH.scr},"Noto Serif Ethiopic",cursive` : `${TH.dsp},"Noto Serif Ethiopic",Georgia,serif`}`;

    const txt = (str: string, x: number, y: number, f: string, fill: string, space = 0) => {
      g.save();
      g.font = f;
      g.fillStyle = fill;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      if (space && 'letterSpacing' in g) {
        (g as unknown as { letterSpacing: string }).letterSpacing = `${space * u}px`;
      }
      g.fillText(str, x, y);
      g.restore();
    };

    const line = (x: number, y: number, w: number, color: string, h = 2) => {
      g.fillStyle = color;
      g.fillRect(x - w / 2, y, w, h * u);
    };

    const paper = () => {
      g.fillStyle = TH.paper;
      g.fillRect(0, 0, W, H);
      const grd = g.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.85);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, 'rgba(60,40,15,0.035)');
      g.fillStyle = grd;
      g.fillRect(0, 0, W, H);
    };

    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      const rad = Math.max(0, Math.min(r, w / 2, h / 2));
      g.beginPath();
      g.moveTo(x + rad, y);
      g.arcTo(x + w, y, x + w, y + h, rad);
      g.arcTo(x + w, y + h, x, y + h, rad);
      g.arcTo(x, y + h, x, y, rad);
      g.arcTo(x, y, x + w, y, rad);
      g.closePath();
    };

    const deco = (t: ThemeConfig['deco'], c: string) => {
      g.save();
      g.strokeStyle = c;
      g.lineWidth = 2.5 * u;
      if (t === 'frame' || t === 'double') {
        g.strokeRect(W * 0.055, H * 0.045, W * 0.89, H * 0.91);
        g.strokeRect(W * 0.055 + 16 * u, H * 0.045 + 16 * u, W * 0.89 - 32 * u, H * 0.91 - 32 * u);
      } else if (t === 'minimal') {
        g.lineWidth = 1.2 * u;
        g.strokeRect(W * 0.045, H * 0.04, W * 0.91, H * 0.92);
      } else if (t === 'habesha') {
        const x0 = W * 0.05, y0 = H * 0.042, w = W * 0.9, h = H * 0.916;
        g.strokeRect(x0, y0, w, h);
        g.strokeRect(x0 + 22 * u, y0 + 22 * u, w - 44 * u, h - 44 * u);
        const step = 28 * u;
        g.lineWidth = 2 * u;
        for (let x = x0 + 22 * u; x <= x0 + w - 22 * u - step; x += step) {
          const mx = x + step / 2;
          g.beginPath();
          g.moveTo(mx, y0 + 4 * u); g.lineTo(x + step, y0 + 11 * u); g.lineTo(mx, y0 + 18 * u); g.lineTo(x, y0 + 11 * u);
          g.closePath(); g.stroke();
          g.beginPath();
          g.moveTo(mx, y0 + h - 18 * u); g.lineTo(x + step, y0 + h - 11 * u); g.lineTo(mx, y0 + h - 4 * u); g.lineTo(x, y0 + h - 11 * u);
          g.closePath(); g.stroke();
        }
      } else if (t === 'arch') {
        const r = Math.min(W * 0.36, H * 0.4), cy = H * 0.075 + r;
        [0, 20 * u].forEach((o) => {
          g.beginPath();
          g.moveTo(W / 2 - r + o, H * 0.93 - o);
          g.lineTo(W / 2 - r + o, cy);
          g.arc(W / 2, cy, r - o, Math.PI, 0);
          g.lineTo(W / 2 + r - o, H * 0.93 - o);
          g.stroke();
        });
      } else {
        g.strokeRect(W * 0.05, H * 0.045, W * 0.9, H * 0.91);
      }
      g.restore();
    };

    // Draw Photo inside Frame (Rectangular, Arch, or Oval)
    const drawPhotoSlot = (
      slotIdx: number,
      photoIdx: number,
      x: number,
      y: number,
      w: number,
      h: number,
      fullBleed = false,
      shape: 'rect' | 'arch' | 'oval' = 'rect'
    ) => {
      const tot = S.photos.length || 1;
      const safeIdx = ((photoIdx % tot) + tot) % tot;
      const im = imgs[safeIdx];
      const P = S.photos[safeIdx] || { fx: 0.5, fy: 0.5, z: 1 };
      const mp = fullBleed ? 0 : LS.mat * 7 * u;
      const rd = fullBleed ? 0 : LS.r * u;
      const ix = x + mp, iy = y + mp, iw0 = Math.max(4, w - 2 * mp), ih0 = Math.max(4, h - 2 * mp);

      const applyClipPath = (cx: number, cy: number, cw: number, ch: number, crad: number) => {
        if (shape === 'arch') {
          const ar = cw / 2;
          g.beginPath();
          g.moveTo(cx, cy + ch);
          g.lineTo(cx, cy + ar);
          g.arc(cx + ar, cy + ar, ar, Math.PI, 0);
          g.lineTo(cx + cw, cy + ch);
          g.closePath();
        } else if (shape === 'oval') {
          g.beginPath();
          g.ellipse(cx + cw / 2, cy + ch / 2, cw / 2, ch / 2, 0, 0, Math.PI * 2);
          g.closePath();
        } else {
          rr(cx, cy, cw, ch, crad);
        }
      };

      if (!fullBleed && LS.ps > 0) {
        g.save();
        g.shadowColor = `rgba(30, 18, 8, ${Math.min(0.68, 0.24 * LS.ps)})`;
        g.shadowBlur = (10 + 16 * LS.ps) * u;
        g.shadowOffsetY = 6 * LS.ps * u;
        g.fillStyle = TH.mat;
        applyClipPath(x, y, w, h, rd);
        g.fill();
        g.restore();
      } else if (!fullBleed) {
        g.fillStyle = TH.mat;
        applyClipPath(x, y, w, h, rd);
        g.fill();
      }

      g.save();
      applyClipPath(ix, iy, iw0, ih0, Math.max(0, rd - mp));
      g.clip();
      g.fillStyle = '#e5e0d5';
      g.fillRect(ix, iy, iw0, ih0);

      if (im && im.naturalWidth > 0) {
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = 'high';
        const fltObj = COLOR_FILTERS[S.colorFilter || 'none'];
        if (fltObj && fltObj.f !== 'none') {
          try { g.filter = fltObj.f; } catch {}
        }
        const r = Math.max(iw0 / im.naturalWidth, ih0 / im.naturalHeight) * (P.z || 1);
        const dw = im.naturalWidth * r;
        const dh = im.naturalHeight * r;
        const fx = P.fx == null ? 0.5 : P.fx;
        const fy = P.fy == null ? 0.5 : P.fy;
        g.drawImage(im, ix + (iw0 - dw) * fx, iy + (ih0 - dh) * fy, dw, dh);
        try { g.filter = 'none'; } catch {}
      }
      g.restore();

      if (options?.outRects) {
        options.outRects.push({ x, y, w, h, slotIdx, photoIdx: safeIdx });
      }
    };

    const MM = (f: number) => W * f * LS.m;
    const GG = (f: number) => W * f * LS.g;

    // --- 1. COVER ---
    if (pageKind.type === 'cover') {
      g.fillStyle = TH.cover;
      g.fillRect(0, 0, W, H);
      const grd = g.createRadialGradient(W * 0.5, H * 0.38, W * 0.05, W * 0.5, H * 0.5, W * 0.85);
      grd.addColorStop(0, 'rgba(255,255,255,0.08)');
      grd.addColorStop(1, 'rgba(0,0,0,0.22)');
      g.fillStyle = grd;
      g.fillRect(0, 0, W, H);

      deco(TH.deco, TH.acc);
      txt('THE ROYAL WEDDING OF', W / 2, H * 0.24, font(H * 0.024, 'display', 500), TH.acc, 6);
      txt(S.bride, W / 2, H * 0.36, font(H * 0.105, 'script'), TH.cink);
      txt('&', W / 2, H * 0.465, font(H * 0.05, 'script'), TH.acc);
      txt(S.groom, W / 2, H * 0.57, font(H * 0.105, 'script'), TH.cink);
      line(W / 2, H * 0.67, W * 0.2, TH.acc);
      txt(S.weddingDate.toUpperCase(), W / 2, H * 0.73, font(H * 0.021, 'display', 400), TH.cink, 4);
      txt(S.studioBrand, W / 2, H * 0.88, font(H * 0.016, 'display', 500), TH.acc, 7);
      return;
    }

    // --- 2. ENDPAPER ---
    if (pageKind.type === 'endpaper') {
      g.fillStyle = TH.cover;
      g.fillRect(0, 0, W, H);
      const m = `${S.bride.charAt(0)} & ${S.groom.charAt(0)}`.toUpperCase();
      txt(m, W / 2, H * 0.47, font(H * 0.045, 'display', 400), TH.acc, 8);
      txt(S.studioBrand, W / 2, H * 0.54, font(H * 0.015, 'display', 400), TH.acc, 6);
      return;
    }

    // --- 3. OPENING TITLE PAGE (Page 1) ---
    if (pageKind.type === 'title') {
      paper();
      deco(TH.deco, TH.acc);
      txt('THE WEDDING CELEBRATION OF', W / 2, H * 0.27, font(H * 0.022, 'display', 500), TH.sub, 5);
      txt(S.bride, W / 2, H * 0.39, font(H * 0.095, 'script'), TH.ink);
      txt('&', W / 2, H * 0.485, font(H * 0.048, 'script'), TH.acc);
      txt(S.groom, W / 2, H * 0.58, font(H * 0.095, 'script'), TH.ink);
      line(W / 2, H * 0.68, W * 0.16, TH.acc);
      txt(S.weddingDate, W / 2, H * 0.74, font(H * 0.021, 'display', 400), TH.sub, 3);
      txt('የሰርግ ማስታወሻ አልበም', W / 2, H * 0.81, font(H * 0.022, 'display', 400), TH.acc, 2);
      return;
    }

    // --- 4. CLOSING PAGE (Page 14) ---
    if (pageKind.type === 'close') {
      paper();
      deco(TH.deco, TH.acc);
      txt('Thank You', W / 2, H * 0.39, font(H * 0.11, 'script'), TH.ink);
      txt('በደስታችን ስለተካፈላችሁ ከልብ እናመሰግናለን', W / 2, H * 0.49, font(H * 0.024, 'display', 400), TH.acc, 1);
      line(W / 2, H * 0.55, W * 0.16, TH.acc);
      txt(`${S.bride} & ${S.groom}`, W / 2, H * 0.62, font(H * 0.028, 'display', 500), TH.sub, 3);
      txt(S.studioBrand, W / 2, H * 0.88, font(H * 0.016, 'display', 500), TH.acc, 7);
      return;
    }

    // --- 5. CONTENT PAGES (Pages 2..13) WITH 25 PROFESSIONAL LAYOUTS ---
    paper();
    const cfgIdx = pageKind.contentIndex ?? 0;
    const cfg = S.pagesConfig[cfgIdx] || S.pagesConfig[0];
    const lay = cfg.layout;
    const sl = (i: number) => cfg.slots[i] ?? i;
    const capText = cfg.caption || '';

    switch (lay) {
      case 'full':
        drawPhotoSlot(0, sl(0), 0, 0, W, H, true);
        break;

      case 'matted': {
        const m = MM(0.11);
        drawPhotoSlot(0, sl(0), m, m, W - 2 * m, H - 2 * m - H * 0.05);
        txt(capText, W / 2, H - m * 0.6, font(H * 0.026, 'script'), TH.sub);
        break;
      }

      case 'wide':
        drawPhotoSlot(0, sl(0), 0, H * 0.16, W, H * 0.64, true);
        txt(capText, W / 2, H * 0.87, font(H * 0.028, 'script'), TH.ink);
        line(W / 2, H * 0.91, W * 0.12, TH.acc);
        break;

      case 'polaroid': {
        const m = MM(0.13);
        g.save();
        g.shadowColor = `rgba(35,20,10,${Math.min(0.6, 0.22 * LS.ps)})`;
        g.shadowBlur = 22 * u;
        g.shadowOffsetY = 8 * u;
        g.fillStyle = TH.mat;
        g.fillRect(m - W * 0.03, H * 0.055, W - 2 * m + W * 0.06, H * 0.88);
        g.restore();
        drawPhotoSlot(0, sl(0), m, H * 0.085, W - 2 * m, H * 0.68, true);
        txt(capText, W / 2, H * 0.845, font(H * 0.034, 'script'), TH.ink);
        break;
      }

      case 'story': {
        drawPhotoSlot(0, sl(0), 0, 0, W * 0.54, H, true);
        const cx = W * 0.77;
        deco('minimal', TH.acc);
        txt(capText, cx, H * 0.44, font(H * 0.032, 'script'), TH.ink);
        line(cx, H * 0.52, W * 0.1, TH.acc);
        txt(`${S.bride} & ${S.groom}`, cx, H * 0.57, font(H * 0.022, 'display', 500), TH.sub, 3);
        break;
      }

      case 'arch': {
        const m = MM(0.14);
        drawPhotoSlot(0, sl(0), m, H * 0.08, W - 2 * m, H * 0.76, false, 'arch');
        txt(capText, W / 2, H * 0.9, font(H * 0.028, 'script'), TH.ink);
        break;
      }

      case 'oval': {
        const m = MM(0.14);
        drawPhotoSlot(0, sl(0), m, H * 0.09, W - 2 * m, H * 0.74, false, 'oval');
        txt(capText, W / 2, H * 0.895, font(H * 0.028, 'script'), TH.ink);
        break;
      }

      case 'habeshaFrame': {
        deco('habesha', TH.acc);
        const m = MM(0.11);
        drawPhotoSlot(0, sl(0), m, H * 0.1, W - 2 * m, H * 0.72);
        txt(capText, W / 2, H * 0.875, font(H * 0.026, 'display', 500), TH.acc, 1);
        break;
      }

      case 'vowsCard': {
        const m = MM(0.09);
        drawPhotoSlot(0, sl(0), m, m, W - 2 * m, H * 0.58);
        g.strokeStyle = TH.acc;
        g.lineWidth = 1.5 * u;
        g.strokeRect(m + W * 0.04, H * 0.69, W - 2 * m - W * 0.08, H * 0.21);
        txt('“ፍቅር ለዘላለም ይኖራል”', W / 2, H * 0.76, font(H * 0.024, 'display', 500), TH.acc, 2);
        txt(capText, W / 2, H * 0.825, font(H * 0.028, 'script'), TH.ink);
        break;
      }

      case 'duo': {
        const m = MM(0.13), gp = GG(0.03), h1 = H * 0.45, y2 = H * 0.07 + h1 + gp;
        drawPhotoSlot(0, sl(0), m, H * 0.07, W - 2 * m, h1);
        drawPhotoSlot(1, sl(1), m + W * 0.06, y2, W - 2 * m - W * 0.12, H * 0.86 - h1 - gp);
        break;
      }

      case 'pair': {
        const m = MM(0.07), gp = GG(0.035), w = (W - 2 * m - gp) / 2;
        drawPhotoSlot(0, sl(0), m, H * 0.1, w, H * 0.76);
        drawPhotoSlot(1, sl(1), m + w + gp, H * 0.1, w, H * 0.76);
        txt(capText, W / 2, H * 0.91, font(H * 0.027, 'script'), TH.sub);
        break;
      }

      case 'overlap': {
        const m = MM(0.07);
        drawPhotoSlot(0, sl(0), m, H * 0.06, W * 0.68, H * 0.66);
        drawPhotoSlot(1, sl(1), W * 0.36, H * 0.44, W * 0.56, H * 0.46);
        txt(capText, W * 0.22, H * 0.83, font(H * 0.026, 'script'), TH.ink);
        break;
      }

      case 'magazine': {
        const m = MM(0.07), gp = GG(0.03);
        drawPhotoSlot(0, sl(0), m, m, W * 0.52, H * 0.84);
        drawPhotoSlot(1, sl(1), m + W * 0.52 + gp, m + H * 0.22, W - 2 * m - W * 0.52 - gp, H * 0.62);
        txt('EDITORIAL', m + W * 0.72, m + H * 0.08, font(H * 0.022, 'display', 600), TH.acc, 5);
        txt(capText, m + W * 0.72, m + H * 0.14, font(H * 0.025, 'script'), TH.ink);
        break;
      }

      case 'splitDiag': {
        const m = MM(0.06), gp = GG(0.03);
        drawPhotoSlot(0, sl(0), m, m, W - 2 * m, H * 0.43);
        drawPhotoSlot(1, sl(1), m, m + H * 0.43 + gp, W - 2 * m, H * 0.43);
        break;
      }

      case 'insetBadge': {
        drawPhotoSlot(0, sl(0), 0, 0, W, H, true);
        drawPhotoSlot(1, sl(1), W * 0.56, H * 0.56, W * 0.36, H * 0.36);
        break;
      }

      case 'trio': {
        const m = MM(0.07), gp = GG(0.035), Hh = (H - 2 * m) * 0.7, w1 = (W - 2 * m - gp) * 0.58, w2 = W - 2 * m - gp - w1;
        drawPhotoSlot(0, sl(0), m, m, w1, Hh);
        drawPhotoSlot(1, sl(1), m + w1 + gp, m, w2, (Hh - gp) / 2);
        drawPhotoSlot(2, sl(2), m + w1 + gp, m + (Hh - gp) / 2 + gp, w2, (Hh - gp) / 2);
        const cy = (m + Hh + H - m) / 2;
        txt(capText, W / 2, cy, font(H * 0.028, 'script'), TH.ink);
        line(W / 2, cy + H * 0.035, W * 0.1, TH.acc);
        break;
      }

      case 'hero3': {
        const m = MM(0.06), gp = GG(0.03), Ht = (H - 2 * m - gp) * 0.62, w = (W - 2 * m - gp) / 2, Hb = H - 2 * m - Ht - gp;
        drawPhotoSlot(0, sl(0), m, m, W - 2 * m, Ht);
        drawPhotoSlot(1, sl(1), m, m + Ht + gp, w, Hb);
        drawPhotoSlot(2, sl(2), m + w + gp, m + Ht + gp, w, Hb);
        break;
      }

      case 'strips': {
        const m = MM(0.06), gp = GG(0.025), w = (W - 2 * m - 2 * gp) / 3;
        drawPhotoSlot(0, sl(0), m, m, w, H - 2 * m);
        drawPhotoSlot(1, sl(1), m + w + gp, m + H * 0.05, w, H - 2 * m - H * 0.1);
        drawPhotoSlot(2, sl(2), m + 2 * (w + gp), m, w, H - 2 * m);
        break;
      }

      case 'panoHalf': {
        const m = MM(0.06), gp = GG(0.03), w = (W - 2 * m - gp) / 2;
        drawPhotoSlot(0, sl(0), 0, H * 0.05, W, H * 0.44, true);
        drawPhotoSlot(1, sl(1), m, H * 0.53, w, H * 0.36);
        drawPhotoSlot(2, sl(2), m + w + gp, H * 0.53, w, H * 0.36);
        break;
      }

      case 'mosaic': {
        const m = MM(0.06), gp = GG(0.028), hw = (W - 2 * m - gp) / 2, Ht = (H - 2 * m - gp) * 0.65, Hb = H - 2 * m - gp - Ht;
        drawPhotoSlot(0, sl(0), m, m, hw, Ht);
        drawPhotoSlot(1, sl(1), m + hw + gp, m, hw, (Ht - gp) / 2);
        drawPhotoSlot(2, sl(2), m + hw + gp, m + (Ht - gp) / 2 + gp, hw, (Ht - gp) / 2);
        drawPhotoSlot(3, sl(3), m, m + Ht + gp, W - 2 * m, Hb);
        break;
      }

      case 'grid4': {
        const m = MM(0.065), gp = GG(0.03), w = (W - 2 * m - gp) / 2, h = (H - 2 * m - gp) / 2;
        drawPhotoSlot(0, sl(0), m, m, w, h);
        drawPhotoSlot(1, sl(1), m + w + gp, m, w, h);
        drawPhotoSlot(2, sl(2), m, m + h + gp, w, h);
        drawPhotoSlot(3, sl(3), m + w + gp, m + h + gp, w, h);
        break;
      }

      case 'film': {
        const m = MM(0.06), gp = GG(0.022), h = (H - 2 * m - 3 * gp) / 4;
        for (let i = 0; i < 4; i++) {
          drawPhotoSlot(i, sl(i), m, m + i * (h + gp), W - 2 * m, h);
        }
        break;
      }

      case 'masonry4': {
        const m = MM(0.06), gp = GG(0.028), w = (W - 2 * m - gp) / 2;
        drawPhotoSlot(0, sl(0), m, m, w, H * 0.52);
        drawPhotoSlot(1, sl(1), m + w + gp, m, w, H * 0.36);
        drawPhotoSlot(2, sl(2), m, m + H * 0.52 + gp, w, H - 2 * m - H * 0.52 - gp);
        drawPhotoSlot(3, sl(3), m + w + gp, m + H * 0.36 + gp, w, H - 2 * m - H * 0.36 - gp);
        break;
      }

      case 'collage5': {
        const m = MM(0.055), gp = GG(0.025), W1 = (W - 2 * m - gp) * 0.54, x0 = m + W1 + gp, w2 = (W - m - x0 - gp) / 2, h2 = (H - 2 * m - gp) / 2;
        drawPhotoSlot(0, sl(0), m, m, W1, H - 2 * m);
        drawPhotoSlot(1, sl(1), x0, m, w2, h2);
        drawPhotoSlot(2, sl(2), x0 + w2 + gp, m, w2, h2);
        drawPhotoSlot(3, sl(3), x0, m + h2 + gp, w2, h2);
        drawPhotoSlot(4, sl(4), x0 + w2 + gp, m + h2 + gp, w2, h2);
        break;
      }

      case 'grid6': {
        const m = MM(0.06), gp = GG(0.025), w = (W - 2 * m - gp) / 2, h = (H - 2 * m - 2 * gp) / 3;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 2; c++) {
            const idx = r * 2 + c;
            drawPhotoSlot(idx, sl(idx), m + c * (w + gp), m + r * (h + gp), w, h);
          }
        }
        break;
      }

      default:
        drawPhotoSlot(0, sl(0), 0, 0, W, H, true);
    }

    // Page Number Footer
    if (cfg.showPageNum && lay !== 'full' && lay !== 'insetBadge') {
      txt(`— ${cfgIdx + 2} —`, W / 2, H * 0.965, font(H * 0.015, 'display', 400), TH.sub, 2);
    }

    // Realistic 3D Book Spine Crease Shadow (Skipped automatically during Clean Print PNG Export!)
    if (!options?.cleanPrint && !options?.isCover && LS.sp > 0) {
      g.save();
      const sw = W * 0.14;
      const isLeft = !!options?.isLeftPage;
      const grd = isLeft
        ? g.createLinearGradient(W, 0, W - sw, 0)
        : g.createLinearGradient(0, 0, sw, 0);
      const a = 0.22 * LS.sp;
      grd.addColorStop(0, `rgba(20, 12, 5, ${a.toFixed(3)})`);
      grd.addColorStop(0.35, `rgba(20, 12, 5, ${(a * 0.38).toFixed(3)})`);
      grd.addColorStop(1, 'rgba(20, 12, 5, 0)');
      g.fillStyle = grd;
      if (isLeft) g.fillRect(W - sw, 0, sw, H);
      else g.fillRect(0, 0, sw, H);
      g.restore();
    }
  }, []);

  // ============================================================================
  // INITIALIZE THREE.JS 3D WEBGL BOOK ENGINE
  // ============================================================================
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const N = 8, T_COVER = 0.052, T_PAGE = 0.015;
    let PW = 3, PD = 4, CX = 1400, CY = 1800, K = 0, T = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    const pr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(pr);
    stage.innerHTML = '';
    stage.appendChild(renderer.domElement);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.up.set(0, 0, -1);
    const book = new THREE.Group();
    scene.add(book);

    // Soft Ground Drop Shadow
    const shCanvas = document.createElement('canvas');
    shCanvas.width = 512; shCanvas.height = 512;
    const shCtx = shCanvas.getContext('2d')!;
    shCtx.shadowColor = 'rgba(15, 8, 2, 0.95)';
    shCtx.shadowBlur = 52;
    shCtx.shadowOffsetX = 1000;
    shCtx.fillStyle = '#000';
    shCtx.fillRect(68 - 1000, 68, 376, 376);
    const shTex = new THREE.CanvasTexture(shCanvas);
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: 0.82 })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.15;
    shadowMesh.renderOrder = -1;
    scene.add(shadowMesh);

    const edgeGilt = new THREE.MeshBasicMaterial({ color: 0xc9a96a });
    const edgeCover = new THREE.MeshBasicMaterial({ color: 0x181818 });

    interface TexEntry {
      pageKind: { type: 'cover' | 'endpaper' | 'title' | 'close' | 'content'; contentIndex?: number };
      back: boolean;
      isCover: boolean;
      c: HTMLCanvasElement;
      d?: HTMLCanvasElement;
      tex: THREE.CanvasTexture;
      rects: Array<{ x: number; y: number; w: number; h: number; slotIdx: number; photoIdx: number }>;
    }

    interface LeafObj {
      i: number;
      w: number;
      geo: THREE.BoxGeometry;
      grp: THREE.Group;
      p: number;
      tp: number;
      rate: number;
      lastP: number;
      fe?: TexEntry;
      be?: TexEntry;
    }

    let leaves: LeafObj[] = [];
    let texList: TexEntry[] = [];

    const paintEntry = (e: TexEntry) => {
      const g = e.c.getContext('2d')!;
      e.rects = [];
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, CX, CY);
      let dg = g;
      if (e.back) {
        if (!e.d || e.d.width !== CX || e.d.height !== CY) {
          e.d = document.createElement('canvas');
          e.d.width = CX; e.d.height = CY;
        }
        dg = e.d.getContext('2d')!;
        dg.setTransform(1, 0, 0, 1, 0, 0);
        dg.clearRect(0, 0, CX, CY);
      }
      dg.save();
      paintPageToContext(dg, CX, CY, e.pageKind, {
        isLeftPage: e.back,
        isCover: e.isCover,
        cleanPrint: false,
        outRects: e.rects
      });
      dg.restore();

      if (e.back && e.d) {
        g.save();
        g.translate(CX, CY);
        g.rotate(Math.PI);
        g.drawImage(e.d, 0, 0);
        g.restore();
      }
      e.tex.needsUpdate = true;
    };

    const getPageKind = (pageNum1To14: number): TexEntry['pageKind'] => {
      if (pageNum1To14 === 1) return { type: 'title' };
      if (pageNum1To14 === 14) return { type: 'close' };
      return { type: 'content', contentIndex: pageNum1To14 - 2 };
    };

    const createMat = (pageKind: TexEntry['pageKind'], back: boolean, isCover: boolean) => {
      const c = document.createElement('canvas');
      c.width = CX; c.height = CY;
      const t = new THREE.CanvasTexture(c);
      t.anisotropy = maxAniso;
      t.minFilter = THREE.LinearFilter;
      const e: TexEntry = { pageKind, back, isCover, c, tex: t, rects: [] };
      paintEntry(e);
      texList.push(e);
      const m = new THREE.MeshBasicMaterial({ map: t });
      m.userData.entry = e;
      return m;
    };

    const rebuildBook = (keepLeaf = true) => {
      const W = window.innerWidth, H = window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      PD = 4;
      PW = PD * (W / 2) / H;
      CY = Math.max(1500, Math.min(2200, Math.round(H * renderer.getPixelRatio() * 1.35)));
      CX = Math.round(CY * (W / 2) / H);

      while (book.children.length) {
        const o = book.children[0];
        book.remove(o);
      }
      const prevK = keepLeaf ? K : 0;
      leaves = [];
      texList = [];

      const coverM = createMat({ type: 'cover' }, false, true);
      const innerL = createMat({ type: 'endpaper' }, true, true);
      const innerR = createMat({ type: 'endpaper' }, false, true);

      const TOT = 2 * T_COVER + (N - 1) * T_PAGE, HY = TOT / 2;
      const sOff: number[] = [];
      for (let i = 0; i <= N; i++) {
        let above = 0;
        for (let j = i + 1; j <= N; j++) above += j === N ? T_COVER : T_PAGE;
        const th = i === 0 || i === N ? T_COVER : T_PAGE;
        sOff[i] = above + th / 2 - HY;
      }

      for (let idx = 0; idx <= N; idx++) {
        const isC = idx === 0 || idx === N;
        const t = isC ? T_COVER : T_PAGE;
        const w = PW + (isC ? 0.045 : 0), d = PD + (isC ? 0.085 : 0);
        const geo = new THREE.BoxGeometry(w, t, d, 44, 1, 1);
        geo.translate(w / 2, 0, 0);
        geo.userData.orig = Float32Array.from(geo.attributes.position.array);

        let front: THREE.MeshBasicMaterial, back: THREE.MeshBasicMaterial;
        if (idx === 0) {
          front = coverM; back = innerL;
        } else if (idx === N) {
          front = innerR; back = coverM;
        } else {
          front = createMat(getPageKind(2 * idx - 1), false, false);
          back = createMat(getPageKind(2 * idx), true, false);
        }
        const e = isC ? edgeCover : edgeGilt;
        const mesh = new THREE.Mesh(geo, [e, e, front, back, e, e]);
        mesh.position.y = sOff[idx];
        const grp = new THREE.Group();
        grp.position.y = HY;
        grp.add(mesh);
        book.add(grp);
        leaves.push({
          i: idx, w, geo, grp,
          p: idx < prevK ? 1 : 0,
          tp: idx < prevK ? 1 : 0,
          rate: 6,
          lastP: -1,
          fe: front.userData.entry,
          be: back.userData.entry
        });
      }
      K = prevK;
      setCurrentLeaf(K);
    };

    const bendGeo = (geo: THREE.BoxGeometry, c: number, w: number) => {
      const pos = geo.attributes.position;
      const o = geo.userData.orig as Float32Array;
      const a = pos.array as Float32Array;
      const n = pos.count;
      for (let v = 0; v < n; v++) {
        const i3 = v * 3, x = o[i3], y = o[i3 + 1];
        if (Math.abs(c) < 1e-4) {
          a[i3] = x; a[i3 + 1] = y; a[i3 + 2] = o[i3 + 2];
          continue;
        }
        const phi = (c * x) / w, R = w / c;
        a[i3] = R * Math.sin(phi) - y * Math.sin(phi);
        a[i3 + 1] = R * (1 - Math.cos(phi)) + y * Math.cos(phi);
        a[i3 + 2] = o[i3 + 2];
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    };

    const repaintAll = () => {
      const TH = stateRef.current.theme;
      edgeGilt.color.set(TH.edge);
      edgeCover.color.set(TH.ced);
      texList.forEach(paintEntry);
    };

    const turnLeaf = (dir: 1 | -1) => {
      if (dir > 0 && K < N) {
        leaves[K].tp = 1;
        leaves[K].rate = 4.5;
        K++;
        audioFX.playFlip();
        setCurrentLeaf(K);
      } else if (dir < 0 && K > 0) {
        leaves[K - 1].tp = 0;
        leaves[K - 1].rate = 4.5;
        K--;
        audioFX.playFlip();
        setCurrentLeaf(K);
      }
    };

    const gotoLeaf = (targetK: number) => {
      const clamped = Math.max(0, Math.min(N, targetK));
      while (K < clamped) turnLeaf(1);
      while (K > clamped) turnLeaf(-1);
    };

    // High-Res Print Canvas Renderer
    const renderCleanPageCanvas = (pageNumber1To14: number, targetW: number, targetH: number, cleanForPrint: boolean) => {
      const c = document.createElement('canvas');
      c.width = targetW;
      c.height = targetH;
      const g = c.getContext('2d')!;
      paintPageToContext(g, targetW, targetH, getPageKind(pageNumber1To14), {
        isLeftPage: pageNumber1To14 % 2 === 0,
        isCover: false,
        cleanPrint: cleanForPrint
      });
      return c;
    };

    const renderCleanCoverCanvas = (targetW: number, targetH: number) => {
      const c = document.createElement('canvas');
      c.width = targetW;
      c.height = targetH;
      const g = c.getContext('2d')!;
      paintPageToContext(g, targetW, targetH, { type: 'cover' }, { isCover: true, cleanPrint: true });
      return c;
    };

    threeCtxRef.current = {
      repaintAll,
      rebuildBook,
      gotoLeaf,
      turnLeaf,
      renderCleanPageCanvas,
      renderCleanCoverCanvas
    };

    rebuildBook(false);

    // Pointer Drag & Hit-Test on 3D Stage
    let drag: {
      id: number; x0: number; y0: number; dir: 1 | -1; L: LeafObj; moved: boolean; startTime: number;
    } | null = null;

    const hitTestPhoto = (clientX: number, clientY: number) => {
      if (K < 1 || K >= N) return null;
      const left = clientX < window.innerWidth / 2;
      const ent = left ? leaves[K - 1].be : leaves[K].fe;
      const pageNum = left ? 2 * K - 2 : 2 * K - 1;
      if (!ent || !ent.rects.length) return { pageNum, slotIdx: -1, photoIdx: -1 };
      const px = ((left ? clientX : clientX - window.innerWidth / 2) / (window.innerWidth / 2)) * CX;
      const py = (clientY / window.innerHeight) * CY;
      for (let i = ent.rects.length - 1; i >= 0; i--) {
        const r = ent.rects[i];
        if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
          return { pageNum, slotIdx: r.slotIdx, photoIdx: r.photoIdx };
        }
      }
      return { pageNum, slotIdx: -1, photoIdx: -1 };
    };

    const onPointerDown = (e: PointerEvent) => {
      if (drag || !leaves.length) return;
      const dir: 1 | -1 = K === 0 || e.clientX >= window.innerWidth / 2 ? 1 : -1;
      const L = dir > 0 ? (K < N ? leaves[K] : null) : K > 0 ? leaves[K - 1] : null;
      if (!L) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dir, L, moved: false, startTime: performance.now() };
      try { stage.setPointerCapture(e.pointerId); } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      if (!drag.moved && Math.abs(dx) > 8) {
        drag.moved = true;
        drag.L.rate = 16;
        audioFX.playFlip();
      }
      if (!drag.moved) return;
      const span = window.innerWidth * 0.5;
      const cl = (v: number) => Math.max(0, Math.min(1, v));
      drag.L.tp = drag.dir > 0 ? cl(-dx / span) : 1 - cl(dx / span);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      const L = d.L;
      drag = null;
      const dt = performance.now() - d.startTime;
      if (!d.moved && dt < 350) {
        const hit = hitTestPhoto(e.clientX, e.clientY);
        if (hit && hit.photoIdx >= 0) {
          setLightboxIdx(hit.photoIdx);
          return;
        }
        turnLeaf(d.dir);
        return;
      }
      const done = d.dir > 0 ? L.tp > 0.35 : L.tp < 0.65;
      if (done) {
        L.tp = d.dir > 0 ? 1 : 0;
        L.rate = 5.5;
        K += d.dir > 0 ? 1 : -1;
        setCurrentLeaf(K);
      } else {
        L.tp = d.dir > 0 ? 0 : 1;
        L.rate = 6.5;
      }
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);

    // Animation Loop
    let animId = 0;
    let last = 0;
    const frame = (now: number) => {
      animId = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
      last = now;
      T = now;
      if (!leaves.length) return;

      for (let k = 0; k <= N; k++) {
        const L = leaves[k];
        if (L.p !== L.tp) {
          const df = L.tp - L.p;
          L.p = Math.abs(df) < 4e-4 ? L.tp : L.p + df * (1 - Math.exp(-L.rate * dt));
        }
        if (L.p !== L.lastP) {
          L.grp.rotation.z = L.p * Math.PI;
          bendGeo(L.geo, -1.35 * Math.sin(Math.PI * L.p), L.w);
          L.lastP = L.p;
        }
      }

      // Place Camera
      const open = leaves[0].p, e = 1 - open;
      const dist = ((PD / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * (1 + e * 0.38);
      const tilt = e * 0.38 + Math.sin(T / 1500) * 0.014 * e;
      const cx = (PW / 2) * e;
      camera.position.set(cx, dist * Math.cos(tilt), dist * Math.sin(tilt));
      camera.lookAt(cx, 0, 0);

      // Update Shadow
      const LS = stateRef.current.ls;
      const le = PW * leaves[0].p, ri = PW * (1 - leaves[N].p), ks = 1 + 0.12 * LS.ss;
      shadowMesh.material.opacity = Math.min(1, LS.sh * 0.82);
      shadowMesh.visible = LS.sh > 0;
      shadowMesh.scale.set((Math.max(0.1, le + ri) / 0.742) * ks, (PD / 0.742) * ks, 1);
      shadowMesh.position.x = (ri - le) / 2;
      shadowMesh.position.z = PD * 0.032;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(frame);

    const onResize = () => rebuildBook(true);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
    };
  }, [paintPageToContext]);

  // Repaint 3D textures whenever state changes
  useEffect(() => {
    threeCtxRef.current?.repaintAll();
    drawInteractiveCropCanvas();
  }, [bride, groom, weddingDate, studioBrand, themeIndex, colorFilter, ls, pagesConfig, photos]);

  // Auto-play Slideshow
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      if (currentLeaf < 8) {
        threeCtxRef.current?.turnLeaf(1);
      } else {
        threeCtxRef.current?.gotoLeaf(0);
        setIsAutoPlaying(false);
      }
    }, 3600);
    return () => clearInterval(timer);
  }, [isAutoPlaying, currentLeaf]);

  // ============================================================================
  // INTERACTIVE CROP & PAN CANVAS IN STUDIO
  // ============================================================================
  const drawInteractiveCropCanvas = useCallback(() => {
    const cc = cropCanvasRef.current;
    if (!cc) return;
    const cg = cc.getContext('2d');
    if (!cg) return;
    const P = stateRef.current.photos[selectedPhotoIdx];
    const im = loadedImagesRef.current[selectedPhotoIdx];
    const W = 280, H = 280;
    cc.width = W; cc.height = H;
    cg.fillStyle = '#e5ded2';
    cg.fillRect(0, 0, W, H);
    if (im && im.naturalWidth > 0 && P) {
      const r = Math.max(W / im.naturalWidth, H / im.naturalHeight) * (P.z || 1);
      const dw = im.naturalWidth * r, dh = im.naturalHeight * r;
      cg.drawImage(im, (W - dw) * (P.fx ?? 0.5), (H - dh) * (P.fy ?? 0.5), dw, dh);
      // Rule of thirds grid overlay
      cg.strokeStyle = 'rgba(255,255,255,0.35)';
      cg.lineWidth = 1;
      cg.beginPath();
      cg.moveTo(W / 3, 0); cg.lineTo(W / 3, H);
      cg.moveTo((2 * W) / 3, 0); cg.lineTo((2 * W) / 3, H);
      cg.moveTo(0, H / 3); cg.lineTo(W, H / 3);
      cg.moveTo(0, (2 * H) / 3); cg.lineTo(W, (2 * H) / 3);
      cg.stroke();
    }
  }, [selectedPhotoIdx]);

  useEffect(() => {
    drawInteractiveCropCanvas();
  }, [selectedPhotoIdx, drawInteractiveCropCanvas]);

  // ============================================================================
  // HIGH-RESOLUTION 300-DPI PRINT PNG EXPORTER
  // ============================================================================
  const drawCropMarksOnCanvas = (ctx: CanvasRenderingContext2D, totalW: number, totalH: number, bleedPx: number) => {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    const len = bleedPx * 0.75;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(0, bleedPx); ctx.lineTo(len, bleedPx);
    ctx.moveTo(bleedPx, 0); ctx.lineTo(bleedPx, len);
    // Top-right
    ctx.moveTo(totalW, bleedPx); ctx.lineTo(totalW - len, bleedPx);
    ctx.moveTo(totalW - bleedPx, 0); ctx.lineTo(totalW - bleedPx, len);
    // Bottom-left
    ctx.moveTo(0, totalH - bleedPx); ctx.lineTo(len, totalH - bleedPx);
    ctx.moveTo(bleedPx, totalH); ctx.lineTo(bleedPx, totalH - len);
    // Bottom-right
    ctx.moveTo(totalW, totalH - bleedPx); ctx.lineTo(totalW - len, totalH - bleedPx);
    ctx.moveTo(totalW - bleedPx, totalH); ctx.lineTo(totalW - bleedPx, totalH - len);
    ctx.stroke();
    ctx.restore();
  };

  const downloadCanvasAsPng = (canvas: HTMLCanvasElement, filename: string): Promise<void> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
          resolve();
        }, 250);
      }, 'image/png', 1.0);
    });
  };

  // 1. Export Single Selected Page (300 DPI)
  const handleExportSinglePagePng = async (pageNum: number) => {
    if (!threeCtxRef.current) return;
    setExportStatus(`ገጽ ${pageNum} በከፍተኛ የህትመት ጥራት (PNG) በመዘጋጀት ላይ...`);
    const pageW = exportDpiMode === 'ultra' ? 3000 : 2400;
    const pageH = exportDpiMode === 'ultra' ? 3750 : 3000;
    const bleed = includeCropMarks ? 90 : 0;

    const rawCanvas = threeCtxRef.current.renderCleanPageCanvas(pageNum, pageW, pageH, true);
    let finalCanvas = rawCanvas;

    if (includeCropMarks) {
      finalCanvas = document.createElement('canvas');
      finalCanvas.width = pageW + bleed * 2;
      finalCanvas.height = pageH + bleed * 2;
      const fCtx = finalCanvas.getContext('2d')!;
      fCtx.fillStyle = '#ffffff';
      fCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      fCtx.drawImage(rawCanvas, bleed, bleed);
      drawCropMarksOnCanvas(fCtx, finalCanvas.width, finalCanvas.height, bleed);
    }

    await downloadCanvasAsPng(finalCanvas, `${bride}-${groom}-Page-${String(pageNum).padStart(2, '0')}-Print.png`);
    setExportStatus(null);
  };

  // 2. Export Full Panoramic Spread (Left + Right Combined 12x24 / Panoramic Print Ready PNG)
  const handleExportCurrentSpreadPng = async () => {
    if (!threeCtxRef.current) return;
    const spreadLeaf = currentLeaf === 0 ? 1 : currentLeaf >= 8 ? 7 : currentLeaf;
    const leftPageNum = 2 * spreadLeaf - 2;
    const rightPageNum = 2 * spreadLeaf - 1;

    setExportStatus(`ሙሉ Spread (ገጽ ${leftPageNum} እና ${rightPageNum}) በ 300-DPI PNG በመዘጋጀት ላይ...`);
    const singleW = exportDpiMode === 'ultra' ? 3000 : 2400;
    const singleH = exportDpiMode === 'ultra' ? 3750 : 3000;
    const bleed = includeCropMarks ? 90 : 0;

    const leftCanvas = leftPageNum >= 1
      ? threeCtxRef.current.renderCleanPageCanvas(leftPageNum, singleW, singleH, true)
      : threeCtxRef.current.renderCleanCoverCanvas(singleW, singleH);
    const rightCanvas = threeCtxRef.current.renderCleanPageCanvas(rightPageNum, singleW, singleH, true);

    const spreadCanvas = document.createElement('canvas');
    spreadCanvas.width = singleW * 2 + bleed * 2;
    spreadCanvas.height = singleH + bleed * 2;
    const ctx = spreadCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, spreadCanvas.width, spreadCanvas.height);
    ctx.drawImage(leftCanvas, bleed, bleed);
    ctx.drawImage(rightCanvas, bleed + singleW, bleed);

    if (includeCropMarks) {
      drawCropMarksOnCanvas(ctx, spreadCanvas.width, spreadCanvas.height, bleed);
    }

    await downloadCanvasAsPng(
      spreadCanvas,
      `${bride}-${groom}-FullSpread-Pages-${leftPageNum}-${rightPageNum}.png`
    );
    setExportStatus(null);
  };

  // 3. Batch Export Entire Album Spreads for Print Lab
  const handleBatchExportAllSpreads = async () => {
    if (!threeCtxRef.current) return;
    const singleW = exportDpiMode === 'ultra' ? 2600 : 2000;
    const singleH = exportDpiMode === 'ultra' ? 3250 : 2500;

    setExportStatus('ሽፋን (Cover) በመውጣት ላይ...');
    const coverCanvas = threeCtxRef.current.renderCleanCoverCanvas(singleW, singleH);
    await downloadCanvasAsPng(coverCanvas, `00-${bride}-${groom}-Cover.png`);

    for (let s = 1; s <= 7; s++) {
      const lp = 2 * s - 2;
      const rp = 2 * s - 1;
      setExportStatus(`Spread ${s} / 7 በመውጣት ላይ...`);
      const comb = document.createElement('canvas');
      comb.width = singleW * 2;
      comb.height = singleH;
      const g = comb.getContext('2d')!;
      if (lp >= 1) {
        g.drawImage(threeCtxRef.current.renderCleanPageCanvas(lp, singleW, singleH, true), 0, 0);
      } else {
        g.fillStyle = stateRef.current.theme.paper;
        g.fillRect(0, 0, singleW, singleH);
      }
      if (rp <= 14) {
        g.drawImage(threeCtxRef.current.renderCleanPageCanvas(rp, singleW, singleH, true), singleW, 0);
      }
      await downloadCanvasAsPng(comb, `0${s}-${bride}-${groom}-Spread-${s}.png`);
    }
    setExportStatus(null);
  };

  // ============================================================================
  // HELPER ACTIONS FOR INTERACTIVE EDITOR
  // ============================================================================
  const currentTheme = THEMES[themeIndex] || THEMES[0];
  const currentEditedPage = pagesConfig[selectedPageIdx - 2] || pagesConfig[0];

  const handleChangePageLayout = (newLayoutKey: string) => {
    const newCount = LAYOUT_META[newLayoutKey]?.count || 1;
    setPagesConfig((prev) =>
      prev.map((p, idx) => {
        if (idx !== selectedPageIdx - 2) return p;
        const nextSlots = Array.from({ length: newCount }, (_, i) => p.slots[i] ?? (idx * 2 + i) % photos.length);
        return { ...p, layout: newLayoutKey, slots: nextSlots };
      })
    );
    setSelectedSlotIdx(0);
  };

  const handleAssignPhotoToSlot = (photoIndex: number) => {
    setPagesConfig((prev) =>
      prev.map((p, idx) => {
        if (idx !== selectedPageIdx - 2) return p;
        const nextSlots = [...p.slots];
        nextSlots[selectedSlotIdx] = photoIndex;
        return { ...p, slots: nextSlots };
      })
    );
    setSelectedPhotoIdx(photoIndex);
  };

  const handleApplyBookPreset = (presetKey: string) => {
    const preset = BOOK_PRESETS[presetKey];
    if (!preset) return;
    let ptr = 0;
    setPagesConfig((prev) =>
      preset.pages.map((lay, idx) => {
        const cnt = LAYOUT_META[lay]?.count || 1;
        const slots = Array.from({ length: cnt }, (_, k) => (ptr + k) % photos.length);
        ptr += cnt;
        return {
          layout: lay,
          slots,
          caption: prev[idx]?.caption || DEFAULT_CAPTIONS[idx % DEFAULT_CAPTIONS.length],
          subCaption: `${bride} & ${groom}`,
          showPageNum: true
        };
      })
    );
  };

  const handleAutoSmartFill = () => {
    const allLayoutKeys = Object.keys(LAYOUT_META);
    let ptr = 0;
    setPagesConfig((prev) =>
      prev.map((p, idx) => {
        const randomLay = allLayoutKeys[(idx * 3 + Math.floor(Math.random() * 5)) % allLayoutKeys.length];
        const cnt = LAYOUT_META[randomLay].count;
        const slots = Array.from({ length: cnt }, (_, k) => (ptr + k) % photos.length);
        ptr += cnt;
        return { ...p, layout: randomLay, slots };
      })
    );
  };

  const handleUploadPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded: PhotoItem[] = files.map((file, i) => {
      const u = URL.createObjectURL(file);
      return { id: `up-${Date.now()}-${i}`, t: u, m: u, f: u, fx: 0.5, fy: 0.5, z: 1 };
    });
    loadedImagesRef.current = [];
    setPhotos(uploaded);
  };

  const selectPageAndTurnBook = (pageNum2To13: number) => {
    setSelectedPageIdx(pageNum2To13);
    setSelectedSlotIdx(0);
    const targetSpread = pageNum2To13 % 2 === 0 ? pageNum2To13 / 2 + 1 : (pageNum2To13 + 1) / 2;
    threeCtxRef.current?.gotoLeaf(targetSpread);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: currentTheme.bg,
        color: currentTheme.ink,
        fontFamily: '"Cormorant Garamond", "Noto Serif Ethiopic", Georgia, serif',
        userSelect: 'none'
      }}
    >
      {/* Floating Bokeh Particles */}
      <canvas
        ref={particlesRef}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: 0.75 }}
      />

      {/* Top Right Quick Studio & Export Bar */}
      {!isStudioOpen && (
        <div style={{ position: 'fixed', top: '2.2vmin', right: '2.2vmin', zIndex: 45, display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              setStarted(true);
              setIsStudioOpen(true);
              setActiveTab('export');
            }}
            style={{
              height: 42, padding: '0 16px', borderRadius: 22,
              border: `1px solid ${currentTheme.acc}`,
              background: currentTheme.paper, color: currentTheme.ink,
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(0,0,0,0.16)'
            }}
          >
            <span>🖨️</span> <span>High-Res PNG Export</span>
          </button>
          <button
            onClick={() => {
              setStarted(true);
              setIsStudioOpen(true);
            }}
            style={{
              height: 42, padding: '0 18px', borderRadius: 22,
              border: `1px solid ${currentTheme.acc}`,
              background: currentTheme.acc, color: '#fff',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)'
            }}
          >
            <span>✦</span> <span>አልበም ስቱዲዮ · Pro Studio (25 Layouts)</span>
          </button>
        </div>
      )}

      {/* Luxury Start Screen */}
      {!started && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 25,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
            background: `radial-gradient(circle at center, ${currentTheme.s1} 0%, ${currentTheme.bg} 75%)`,
            color: currentTheme.ink
          }}
        >
          <div style={{ position: 'absolute', inset: '2.8vmin', border: `1px solid ${currentTheme.acc}`, opacity: 0.55, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: '3.6vmin', border: `1px solid ${currentTheme.acc}`, opacity: 0.28, pointerEvents: 'none' }} />

          <div
            style={{
              width: 68, height: 68, borderRadius: '50%', border: `1px solid ${currentTheme.acc}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: '500 22px "Cinzel", serif', color: currentTheme.acc, marginBottom: '2vmin',
              background: 'rgba(255,255,255,0.25)'
            }}
          >
            {`${bride.charAt(0)} & ${groom.charAt(0)}`.toUpperCase()}
          </div>

          <p style={{ font: 'italic 400 18px serif', color: currentTheme.acc, letterSpacing: 4, margin: 0 }}>
            THE ROYAL WEDDING OF
          </p>
          <h1
            style={{
              fontSize: 'clamp(44px, 12vmin, 96px)',
              fontFamily: `${currentTheme.scr}, "Noto Serif Ethiopic", cursive`,
              fontWeight: 400, margin: '1.5vmin 0'
            }}
          >
            {bride} &amp; {groom}
          </h1>
          <p style={{ letterSpacing: 3, fontSize: 14, color: currentTheme.sub }}>{weddingDate}</p>

          <button
            onClick={() => {
              audioFX.playChime();
              setStarted(true);
            }}
            style={{
              marginTop: '3.5vmin', padding: '14px 38px', borderRadius: 40,
              border: `1px solid ${currentTheme.acc}`,
              background: currentTheme.acc, color: '#fff',
              fontSize: 16, fontWeight: 500, cursor: 'pointer',
              boxShadow: '0 10px 28px rgba(184, 146, 74, 0.35)'
            }}
          >
            📖 አልበሙን ክፈት · Open 3D Album
          </button>

          <p style={{ position: 'absolute', bottom: '4vmin', letterSpacing: 6, fontSize: 12, color: currentTheme.sub }}>
            {studioBrand}
          </p>
        </div>
      )}

      {/* 3D WebGL Stage (Full screen when viewing, left 52% preview when Studio Editor is open) */}
      <div
        ref={stageRef}
        style={{
          position: 'fixed',
          inset: isStudioOpen ? '56px 46% 0 0' : '0',
          zIndex: isStudioOpen ? 52 : 1,
          cursor: 'grab',
          background: `radial-gradient(ellipse at 50% 42%, ${currentTheme.s1} 0%, ${currentTheme.s2} 100%)`,
          transition: 'inset 0.35s ease'
        }}
      />

      {/* Bottom Floating HUD Bar (When not in Studio) */}
      {started && !isStudioOpen && (
        <div
          style={{
            position: 'fixed', bottom: '2.4vmin', left: '50%', transform: 'translateX(-50%)',
            zIndex: 15, display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 16px', borderRadius: 40,
            background: currentTheme.paper, border: `1px solid ${currentTheme.acc}`,
            boxShadow: '0 10px 35px rgba(20, 12, 4, 0.25)'
          }}
        >
          <button
            onClick={() => threeCtxRef.current?.turnLeaf(-1)}
            style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: currentTheme.ink }}
          >
            ‹
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 105, textAlign: 'center' }}>
            {currentLeaf === 0 ? 'ሽፋን · Cover' : currentLeaf >= 8 ? 'የኋላ ሽፋን · End' : `ገጽ ${2 * currentLeaf - 1}–${2 * currentLeaf}`}
          </span>
          <div style={{ width: 100, height: 4, background: 'rgba(0,0,0,0.12)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${(currentLeaf / 8) * 100}%`, height: '100%', background: currentTheme.acc, transition: 'width 0.4s' }} />
          </div>
          <button
            onClick={() => threeCtxRef.current?.turnLeaf(1)}
            style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: currentTheme.ink }}
          >
            ›
          </button>
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isAutoPlaying ? currentTheme.acc : 'transparent',
              color: isAutoPlaying ? '#fff' : currentTheme.ink
            }}
            title="Auto-Play Slideshow"
          >
            {isAutoPlaying ? '❚❚' : '▶'}
          </button>
          <button
            onClick={() => {
              audioFX.enabled = !soundEnabled;
              setSoundEnabled(!soundEnabled);
            }}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: soundEnabled ? currentTheme.acc : 'transparent',
              color: soundEnabled ? '#fff' : currentTheme.ink
            }}
            title="Toggle Sound"
          >
            ♪
          </button>
        </div>
      )}

      {/* ====================================================================
          INTERACTIVE PRO STUDIO EDITOR (25 LAYOUTS, 12 TEMPLATES, 300-DPI PNG)
          ==================================================================== */}
      {isStudioOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', flexDirection: 'column',
            background: '#fbf8f2', color: '#2c2217',
            fontFamily: '"Noto Serif Ethiopic", sans-serif'
          }}
        >
          {/* Top Studio Header */}
          <div
            style={{
              height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 18px', borderBottom: '1px solid rgba(0,0,0,0.1)', background: '#fff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <strong style={{ fontSize: 16 }}>🎨 YAM PRO ALBUM STUDIO</strong>
              <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 12, background: 'rgba(184,146,74,0.15)', color: '#8f6c29' }}>
                25 Layouts • 12 Luxury Templates • 300-DPI Print Engine
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleAutoSmartFill}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: `1px solid ${currentTheme.acc}`,
                  background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 500
                }}
              >
                ✨ Auto-Design Album
              </button>
              <button
                onClick={() => handleExportCurrentSpreadPng()}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: `1px solid ${currentTheme.acc}`,
                  background: 'rgba(184,146,74,0.14)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600
                }}
              >
                🖨️ Export Spread PNG
              </button>
              <button
                onClick={() => setIsStudioOpen(false)}
                style={{
                  padding: '7px 18px', borderRadius: 8, border: 'none',
                  background: currentTheme.acc, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600
                }}
              >
                ✓ ጨርስ · Done
              </button>
            </div>
          </div>

          {/* Studio Body: Left 54% is Live 3D Book Preview, Right 46% is Interactive Inspector */}
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {/* Left Spacer for 3D Stage + Floating Spread Switcher */}
            <div style={{ flex: '0 0 54%', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                  zIndex: 60, display: 'flex', alignItems: 'center', gap: 12,
                  padding: '6px 16px', borderRadius: 30, background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.2)'
                }}
              >
                <button
                  onClick={() => threeCtxRef.current?.turnLeaf(-1)}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${currentTheme.acc}`, background: '#fff', cursor: 'pointer' }}
                >
                  ‹
                </button>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {currentLeaf === 0 ? 'ሽፋን · Cover' : currentLeaf >= 8 ? 'የኋላ ሽፋን' : `ገጽ ${2 * currentLeaf - 1} – ${2 * currentLeaf}`}
                </span>
                <button
                  onClick={() => threeCtxRef.current?.turnLeaf(1)}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${currentTheme.acc}`, background: '#fff', cursor: 'pointer' }}
                >
                  ›
                </button>
              </div>
            </div>

            {/* Right Interactive Control Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fbf8f2', borderLeft: '1px solid rgba(0,0,0,0.1)' }}>
              {/* Navigation Tabs */}
              <div style={{ display: 'flex', gap: 6, padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto', background: '#fff' }}>
                {[
                  { id: 'design', label: '1. ቴምፕሌት · 12 Themes' },
                  { id: 'pages', label: '2. ገጽ አቀማመጥ · 25 Layouts' },
                  { id: 'slots', label: '3. ፎቶ እና ክሮፕ · Photos & Crop' },
                  { id: 'adjust', label: '4. ቅንብር · Margins & Frame' },
                  { id: 'export', label: '5. ህትመት · Print PNG Export' },
                  { id: 'info', label: '6. መረጃ · Names & Upload' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    style={{
                      padding: '7px 13px', borderRadius: 20, fontSize: 12.5, whiteSpace: 'nowrap', cursor: 'pointer',
                      border: `1px solid ${activeTab === tab.id ? currentTheme.acc : 'rgba(0,0,0,0.12)'}`,
                      background: activeTab === tab.id ? currentTheme.acc : '#fff',
                      color: activeTab === tab.id ? '#fff' : '#2c2217',
                      fontWeight: activeTab === tab.id ? 600 : 400
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 40px' }}>
                {/* TAB 1: 12 LUXURY TEMPLATES & COLOR GRADING */}
                {activeTab === 'design' && (
                  <div>
                    <h4 style={{ margin: '0 0 10px', color: currentTheme.acc }}>12 ፕሮፌሽናል የሰርግ ቴምፕሌቶች · 12 Luxury Album Templates</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 8 }}>
                      {THEMES.map((t, idx) => (
                        <button
                          key={t.id}
                          onClick={() => setThemeIndex(idx)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: 9,
                            borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                            border: themeIndex === idx ? `2px solid ${currentTheme.acc}` : '1px solid rgba(0,0,0,0.12)',
                            background: themeIndex === idx ? 'rgba(184,146,74,0.12)' : '#fff'
                          }}
                        >
                          <span style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}>
                            <i style={{ width: 16, height: 34, background: t.cover, display: 'block' }} />
                            <i style={{ width: 16, height: 34, background: t.paper, display: 'block' }} />
                            <i style={{ width: 16, height: 34, background: t.acc, display: 'block' }} />
                          </span>
                          <span>
                            <b style={{ fontSize: 13 }}>{t.n}</b>
                            <br />
                            <small style={{ color: '#666', fontSize: 11 }}>{t.am}</small>
                          </span>
                        </button>
                      ))}
                    </div>

                    <h4 style={{ margin: '20px 0 10px', color: currentTheme.acc }}>የፎቶ ከለር ቶን · Studio Color Grading</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                      {Object.keys(COLOR_FILTERS).map((k) => (
                        <button
                          key={k}
                          onClick={() => setColorFilter(k)}
                          style={{
                            padding: '9px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                            border: colorFilter === k ? `2px solid ${currentTheme.acc}` : '1px solid rgba(0,0,0,0.12)',
                            background: colorFilter === k ? 'rgba(184,146,74,0.14)' : '#fff',
                            fontWeight: colorFilter === k ? 600 : 400
                          }}
                        >
                          {COLOR_FILTERS[k].n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: 25 PROFESSIONAL PAGE LAYOUTS & PAGE TEXT */}
                {activeTab === 'pages' && (
                  <div>
                    <h4 style={{ margin: '0 0 8px', color: currentTheme.acc }}>ሙሉ አልበም ቅድመ-ቅንብር · Whole-Book Presets</h4>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {Object.keys(BOOK_PRESETS).map((k) => (
                        <button
                          key={k}
                          onClick={() => handleApplyBookPreset(k)}
                          style={{
                            padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.15)',
                            background: '#fff', cursor: 'pointer', fontSize: 12
                          }}
                        >
                          {BOOK_PRESETS[k].label}
                        </button>
                      ))}
                    </div>

                    <h4 style={{ margin: '10px 0 8px', color: currentTheme.acc }}>የሚስተካከለውን ገጽ ይምረጡ · Select Page (2–13)</h4>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {Array.from({ length: 12 }, (_, i) => i + 2).map((pNum) => (
                        <button
                          key={pNum}
                          onClick={() => selectPageAndTurnBook(pNum)}
                          style={{
                            width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontWeight: 600,
                            border: selectedPageIdx === pNum ? `2px solid ${currentTheme.acc}` : '1px solid rgba(0,0,0,0.2)',
                            background: selectedPageIdx === pNum ? currentTheme.acc : '#fff',
                            color: selectedPageIdx === pNum ? '#fff' : '#2c2217'
                          }}
                        >
                          {pNum}
                        </button>
                      ))}
                    </div>

                    {/* Per-Page Caption Editor */}
                    <div style={{ marginBottom: 14, padding: 10, borderRadius: 8, background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}>
                      <label style={{ fontSize: 11.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                        የገጽ {selectedPageIdx} ጽሁፍ / ጥቅስ (Page {selectedPageIdx} Caption):
                      </label>
                      <input
                        type="text"
                        value={currentEditedPage?.caption || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPagesConfig((prev) =>
                            prev.map((p, idx) => (idx === selectedPageIdx - 2 ? { ...p, caption: val } : p))
                          );
                        }}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.2)', fontSize: 12.5 }}
                      />
                    </div>

                    {/* Filter 25 Layouts by Photo Count */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h4 style={{ margin: 0, color: currentTheme.acc }}>25 የገጽ አቀማመጦች · 25 Professional Layouts</h4>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['All', '1 Photo', '2 Photos', '3 Photos', '4+ Photos'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setLayoutCategoryFilter(cat)}
                            style={{
                              padding: '4px 9px', borderRadius: 12, fontSize: 11, cursor: 'pointer',
                              border: '1px solid rgba(0,0,0,0.15)',
                              background: layoutCategoryFilter === cat ? currentTheme.acc : '#fff',
                              color: layoutCategoryFilter === cat ? '#fff' : '#333'
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: 8 }}>
                      {Object.keys(LAYOUT_META)
                        .filter((k) => layoutCategoryFilter === 'All' || LAYOUT_META[k].cat === layoutCategoryFilter)
                        .map((layKey) => {
                          const meta = LAYOUT_META[layKey];
                          const isSelected = currentEditedPage?.layout === layKey;
                          return (
                            <button
                              key={layKey}
                              onClick={() => handleChangePageLayout(layKey)}
                              style={{
                                padding: '10px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                                border: isSelected ? `2px solid ${currentTheme.acc}` : '1px solid rgba(0,0,0,0.12)',
                                background: isSelected ? 'rgba(184,146,74,0.15)' : '#fff'
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 600, color: currentTheme.acc, marginBottom: 3 }}>
                                {meta.count} {meta.count === 1 ? 'Photo' : 'Photos'}
                              </div>
                              <div style={{ fontSize: 11.5, fontWeight: isSelected ? 600 : 400 }}>{meta.name}</div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* TAB 3: INTERACTIVE SLOT PHOTO SWAPPER & CROP */}
                {activeTab === 'slots' && (
                  <div>
                    <h4 style={{ margin: '0 0 8px', color: currentTheme.acc }}>
                      በገጽ {selectedPageIdx} ላይ ያሉ የፎቶ ቦታዎች · Photo Slots on Page {selectedPageIdx}
                    </h4>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      {currentEditedPage.slots.map((photoIdx, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => {
                            setSelectedSlotIdx(sIdx);
                            setSelectedPhotoIdx(photoIdx % photos.length);
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                            borderRadius: 8, cursor: 'pointer',
                            border: selectedSlotIdx === sIdx ? `2px solid ${currentTheme.acc}` : '1px solid rgba(0,0,0,0.15)',
                            background: selectedSlotIdx === sIdx ? 'rgba(184,146,74,0.16)' : '#fff'
                          }}
                        >
                          <img
                            src={photos[photoIdx % photos.length]?.t}
                            alt=""
                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }}
                          />
                          <span style={{ fontSize: 12, fontWeight: 600 }}>ሳጥን #{sIdx + 1} (ፎቶ {photoIdx + 1})</span>
                        </button>
                      ))}
                    </div>

                    <h4 style={{ margin: '10px 0 6px', color: currentTheme.acc }}>
                      ወደ ሳጥን #{selectedSlotIdx + 1} የሚገባ ፎቶ ይምረጡ · Click Any Photo to Assign
                    </h4>
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
                      {photos.map((p, idx) => (
                        <img
                          key={p.id}
                          src={p.t}
                          alt=""
                          onClick={() => handleAssignPhotoToSlot(idx)}
                          style={{
                            width: 58, height: 58, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', flex: 'none',
                            border: selectedPhotoIdx === idx ? `3px solid ${currentTheme.acc}` : '2px solid transparent'
                          }}
                        />
                      ))}
                    </div>

                    <h4 style={{ margin: '12px 0 6px', color: currentTheme.acc }}>
                      ፎቶውን በማውዝ ጎትተው ያስተካክሉ · Drag to Pan &amp; Zoom
                    </h4>
                    <canvas
                      ref={cropCanvasRef}
                      onPointerDown={(e) => {
                        const cc = e.currentTarget;
                        cc.setPointerCapture(e.pointerId);
                        (cc as unknown as { _drag: { x: number; y: number } })._drag = { x: e.clientX, y: e.clientY };
                      }}
                      onPointerMove={(e) => {
                        const cc = e.currentTarget as unknown as { _drag?: { x: number; y: number } };
                        if (!cc._drag) return;
                        const dx = e.clientX - cc._drag.x;
                        const dy = e.clientY - cc._drag.y;
                        cc._drag = { x: e.clientX, y: e.clientY };
                        setPhotos((prev) =>
                          prev.map((item, idx) => {
                            if (idx !== selectedPhotoIdx) return item;
                            const cl = (v: number) => Math.max(0, Math.min(1, v));
                            return {
                              ...item,
                              fx: cl((item.fx ?? 0.5) - dx / 180),
                              fy: cl((item.fy ?? 0.5) - dy / 180)
                            };
                          })
                        );
                      }}
                      onPointerUp={(e) => {
                        (e.currentTarget as unknown as { _drag?: null })._drag = null;
                      }}
                      style={{
                        display: 'block', margin: '8px auto', borderRadius: 10,
                        cursor: 'move', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', touchAction: 'none'
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      <span style={{ fontSize: 12, width: 110 }}>ማጉላት · Zoom</span>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.02}
                        value={photos[selectedPhotoIdx]?.z || 1}
                        onChange={(e) => {
                          const z = parseFloat(e.target.value);
                          setPhotos((prev) =>
                            prev.map((item, idx) => (idx === selectedPhotoIdx ? { ...item, z } : item))
                          );
                        }}
                        style={{ flex: 1, accentColor: currentTheme.acc }}
                      />
                      <button
                        onClick={() =>
                          setPhotos((prev) =>
                            prev.map((item, idx) => (idx === selectedPhotoIdx ? { ...item, fx: 0.5, fy: 0.5, z: 1 } : item))
                          )
                        }
                        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', fontSize: 11.5, cursor: 'pointer' }}
                      >
                        ↺ Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: FRAME & MARGIN SLIDERS */}
                {activeTab === 'adjust' && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', color: currentTheme.acc }}>የገጽ እና የፍሬም ልኬቶች · Page &amp; Frame Styling</h4>
                    {[
                      { k: 'm', label: 'ህዳግ · Page Margin', min: 0.4, max: 1.8, step: 0.05 },
                      { k: 'g', label: 'ክፍተት · Photo Gap', min: 0, max: 2.5, step: 0.05 },
                      { k: 'r', label: 'የጠርዝ ክብነት · Corner Radius', min: 0, max: 35, step: 1 },
                      { k: 'mat', label: 'የፎቶ ፍሬም ውፍረት · Mat Border', min: 0, max: 4, step: 0.1 },
                      { k: 'ps', label: 'የፎቶ ጥላ · Photo Shadow', min: 0, max: 2, step: 0.05 },
                      { k: 'sp', label: 'የመሃል እጥፋት ጥላ · 3D Spine Crease', min: 0, max: 2, step: 0.1 },
                      { k: 'sh', label: 'የመጽሐፍ ጥላ · Book Drop Shadow', min: 0, max: 1.5, step: 0.05 }
                    ].map((item) => (
                      <div key={item.k} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
                        <span style={{ width: 185, fontSize: 12.5 }}>{item.label}</span>
                        <input
                          type="range"
                          min={item.min}
                          max={item.max}
                          step={item.step}
                          value={ls[item.k as keyof LayoutAdjustments]}
                          onChange={(e) =>
                            setLs((prev) => ({ ...prev, [item.k]: parseFloat(e.target.value) }))
                          }
                          style={{ flex: 1, accentColor: currentTheme.acc }}
                        />
                        <em style={{ width: 40, fontSize: 12, textAlign: 'right', fontStyle: 'normal' }}>
                          {ls[item.k as keyof LayoutAdjustments]}
                        </em>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 5: PRINT-READY HIGH-RES PNG EXPORT ENGINE */}
                {activeTab === 'export' && (
                  <div>
                    <h4 style={{ margin: '0 0 8px', color: currentTheme.acc }}>
                      🖨️ ለህትመት የተዘጋጀ High-Resolution PNG ማውጫ (300-DPI Print Engine)
                    </h4>
                    <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5, marginBottom: 14 }}>
                      ይህ ሞተር በ3D መጽሐፉ ላይ የሚታየውን የመሃል እጥፋት ጥላ (Spine Shadow) በራሱ አጥፍቶ፣ ለማተሚያ ቤት (Print Lab) የሚሆን ንጹህና እጅግ ከፍተኛ ጥራት ያለው PNG ያወጣል።
                    </p>

                    {exportStatus && (
                      <div style={{ padding: 12, borderRadius: 8, background: '#fff3cd', color: '#664d03', marginBottom: 14, fontWeight: 600, fontSize: 13 }}>
                        ⏳ {exportStatus}
                      </div>
                    )}

                    {/* Print Resolution Selector */}
                    <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}>
                      <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 8 }}>የህትመት ጥራት ይምረጡ · Print Resolution:</div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <button
                          onClick={() => setExportDpiMode('print300')}
                          style={{
                            flex: 1, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                            border: exportDpiMode === 'print300' ? `2px solid ${currentTheme.acc}` : '1px solid #ccc',
                            background: exportDpiMode === 'print300' ? 'rgba(184,146,74,0.15)' : '#fff'
                          }}
                        >
                          <b>Standard 300 DPI</b>
                          <br />
                          <small>4800 × 3000 px (Spread)</small>
                        </button>
                        <button
                          onClick={() => setExportDpiMode('ultra')}
                          style={{
                            flex: 1, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                            border: exportDpiMode === 'ultra' ? `2px solid ${currentTheme.acc}` : '1px solid #ccc',
                            background: exportDpiMode === 'ultra' ? 'rgba(184,146,74,0.15)' : '#fff'
                          }}
                        >
                          <b>Ultra HD Archival</b>
                          <br />
                          <small>6000 × 3750 px (Spread)</small>
                        </button>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={includeCropMarks}
                          onChange={(e) => setIncludeCropMarks(e.target.checked)}
                        />
                        <span>የማተሚያ ቤት መቁረጫ ምልክት ጨምር (Include Printer Crop &amp; Bleed Marks)</span>
                      </label>
                    </div>

                    {/* Export Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button
                        onClick={handleExportCurrentSpreadPng}
                        style={{
                          padding: '12px 16px', borderRadius: 10, border: 'none',
                          background: currentTheme.acc, color: '#fff', fontWeight: 600, fontSize: 13.5,
                          cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <span>📖 አሁን የተከፈተውን ሙሉ Spread (ግራ + ቀኝ ገጽ በአንድ ላይ) አውርድ</span>
                        <span>Download PNG ⤓</span>
                      </button>

                      <button
                        onClick={() => handleExportSinglePagePng(selectedPageIdx)}
                        style={{
                          padding: '12px 16px', borderRadius: 10, border: `1px solid ${currentTheme.acc}`,
                          background: '#fff', color: '#2c2217', fontWeight: 600, fontSize: 13,
                          cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <span>🖼️ የተመረጠውን ነጠላ ገጽ ብቻ (ገጽ {selectedPageIdx}) በPNG አውርድ</span>
                        <span>Single Page PNG ⤓</span>
                      </button>

                      <button
                        onClick={handleBatchExportAllSpreads}
                        style={{
                          padding: '12px 16px', borderRadius: 10, border: '1px solid #2c2217',
                          background: '#2c2217', color: '#fff', fontWeight: 600, fontSize: 13,
                          cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <span>📦 ሙሉውን አልበም (ሽፋን + ሁሉንም Spreads) በተከታታይ አውርድ</span>
                        <span>Batch Export All ⤓</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 6: COUPLE INFO & UPLOAD PHOTOS */}
                {activeTab === 'info' && (
                  <div>
                    <h4 style={{ margin: '0 0 8px', color: currentTheme.acc }}>ፎቶዎች ጫን · Upload Client Wedding Photos</h4>
                    <label
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '14px', borderRadius: 10, border: `2px dashed ${currentTheme.acc}`,
                        background: 'rgba(184,146,74,0.08)', cursor: 'pointer', fontWeight: 600, fontSize: 13, marginBottom: 16
                      }}
                    >
                      <span>📷 ከኮምፒውተር ወይም ስልክ ፎቶዎችን ይምረጡ (Select Multiple Photos)</span>
                      <input type="file" accept="image/*" multiple hidden onChange={handleUploadPhotos} />
                    </label>

                    <h4 style={{ margin: '10px 0 8px', color: currentTheme.acc }}>የሙሽሮች ስም እና ቀን · Couple Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        type="text"
                        value={bride}
                        onChange={(e) => setBride(e.target.value)}
                        placeholder="ሙሽሪት · Bride Name"
                        style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={groom}
                        onChange={(e) => setGroom(e.target.value)}
                        placeholder="ሙሽራ · Groom Name"
                        style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={weddingDate}
                        onChange={(e) => setWeddingDate(e.target.value)}
                        placeholder="ቀን · Wedding Date"
                        style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={studioBrand}
                        onChange={(e) => setStudioBrand(e.target.value)}
                        placeholder="ስቱዲዮ ስም · Studio Brand"
                        style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Viewer */}
      {lightboxIdx !== null && photos[lightboxIdx] && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(14, 11, 8, 0.94)', backdropFilter: 'blur(14px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <img
            src={photos[lightboxIdx].f || photos[lightboxIdx].m}
            alt="Full view"
            style={{
              maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain',
              border: '8px solid #fff', borderRadius: 2, boxShadow: '0 24px 80px rgba(0,0,0,0.7)'
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((lightboxIdx - 1 + photos.length) % photos.length);
            }}
            style={{
              position: 'absolute', left: 24, width: 46, height: 46, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 22, cursor: 'pointer'
            }}
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx((lightboxIdx + 1) % photos.length);
            }}
            style={{
              position: 'absolute', right: 24, width: 46, height: 46, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 22, cursor: 'pointer'
            }}
          >
            ›
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loadingMsg && (
        <div
          style={{
            position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)',
            zIndex: 90, padding: '8px 18px', borderRadius: 20,
            background: 'rgba(20,15,10,0.85)', color: '#f5e3b8', fontSize: 13
          }}
        >
          {loadingMsg}
        </div>
      )}
    </div>
  );
}