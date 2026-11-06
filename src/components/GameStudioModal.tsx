import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Rocket,
  Gamepad2,
  Zap,
  UserCheck,
  Shield,
  Palette,
  Flame,
  Check,
} from 'lucide-react';
import { ArcadeHeroProfile } from '../types';

interface GameStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAiToCreateGame?: (prompt: string) => void;
}

type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export const GameStudioModal: React.FC<GameStudioModalProps> = ({
  isOpen,
  onClose,
  onAskAiToCreateGame,
}) => {
  const [activeTab, setActiveTab] = useState<'arcade' | 'heroEditor' | 'generator'>('arcade');
  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gamePrompt, setGamePrompt] = useState('');
  const [customGameNotice, setCustomGameNotice] = useState<string | null>(null);

  // Hero profile for "Editează-mă în joc"
  const [heroProfile, setHeroProfile] = useState<ArcadeHeroProfile>(() => {
    try {
      const saved = localStorage.getItem('rares_arcade_hero_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      name: 'Rareș',
      skin: 'rares-cyber',
      laserColor: '#38bdf8',
      specialPower: 'rapid-blaster',
      avatarEmoji: '⚡',
    };
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const previewAnimFrameIdRef = useRef<number | null>(null);

  // Persist Hero Profile
  useEffect(() => {
    try {
      localStorage.setItem('rares_arcade_hero_profile', JSON.stringify(heroProfile));
    } catch (e) {
      // fallback
    }
  }, [heroProfile]);

  // Load High Score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rares_game_highscore_cosmoshooter');
      if (saved) setHighScore(parseInt(saved, 10));
      else setHighScore(0);
    } catch (e) {
      // fallback
    }
  }, []);

  const updateHighScore = useCallback(
    (newScore: number) => {
      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem('rares_game_highscore_cosmoshooter', String(newScore));
        } catch (e) {
          // ignore
        }
      }
    },
    [highScore]
  );

  // Procedural Web Audio Synth sound effects
  const playSound = useCallback(
    (type: 'laser' | 'hit' | 'explosion' | 'powerup' | 'gameover') => {
      if (!soundEnabled) return;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!audioCtxRef.current && AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'laser') {
          osc.type = heroProfile.specialPower === 'mega-beam' ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'hit') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === 'explosion') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'powerup') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(950, now + 0.22);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
        } else if (type === 'gameover') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(240, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.55);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
          osc.start(now);
          osc.stop(now + 0.55);
        }
      } catch (e) {
        // Audio might fail if user didn't interact
      }
    },
    [soundEnabled, heroProfile.specialPower]
  );

  // Helper: Draw custom Hero Sprite on any canvas context
  const drawHeroSprite = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, hero: ArcadeHeroProfile) => {
      ctx.save();
      ctx.translate(x, y);

      const color = hero.laserColor;

      if (hero.skin === 'rares-cyber') {
        // Humanoid Cyber Hero (Rareș)
        // Jetpack thruster flame
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(-5, 12);
        ctx.lineTo(0, 20 + Math.random() * 6);
        ctx.lineTo(5, 12);
        ctx.closePath();
        ctx.fill();

        // Flowing Cyber Cape
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(-9, -2);
        ctx.lineTo(-14, 15);
        ctx.lineTo(0, 10);
        ctx.lineTo(14, 15);
        ctx.lineTo(9, -2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Torso / Cyber Armor
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-8, -6, 16, 18);
        ctx.fillStyle = color;
        ctx.fillRect(-5, -3, 10, 10);

        // Cyber Helmet & Visor
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.arc(0, -12, 8, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Neon Visor
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillRect(-6, -14, 12, 4);
        ctx.shadowBlur = 0;

        // Dual Blaster Arms
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(-12, -4, 4, 14);
        ctx.fillRect(8, -4, 4, 14);

        // Blaster tips
        ctx.fillStyle = color;
        ctx.fillRect(-12, -8, 4, 4);
        ctx.fillRect(8, -8, 4, 4);
      } else if (hero.skin === 'pixel-rares') {
        // Pixel Retro Hero
        ctx.fillStyle = color;
        // Head
        ctx.fillRect(-6, -16, 12, 10);
        // Golden visor / eyes
        ctx.fillStyle = '#fde047';
        ctx.fillRect(-4, -13, 8, 3);
        // Body
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(-8, -6, 16, 14);
        // Shield
        ctx.fillStyle = color;
        ctx.fillRect(-14, -2, 5, 10);
        // Energy Sword
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(9, -12, 4, 18);
      } else if (hero.skin === 'neon-mecha') {
        // Titanium Titan Mecha
        ctx.fillStyle = '#334155';
        ctx.fillRect(-16, -10, 32, 22);

        // Glowing reactor core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 1, 6, 0, Math.PI * 2);
        ctx.fill();

        // Shoulder Cannons
        ctx.fillStyle = color;
        ctx.fillRect(-18, -16, 6, 14);
        ctx.fillRect(12, -16, 6, 14);

        // Head sensor
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(-3, -16, 6, 5);
      } else {
        // Quantum Fighter Starship with Hero Crest
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-18, 14);
        ctx.lineTo(18, 14);
        ctx.closePath();
        ctx.fill();

        // Wing accents
        ctx.fillStyle = color;
        ctx.fillRect(-16, 8, 4, 8);
        ctx.fillRect(12, 8, 4, 8);

        // Cockpit
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, -2, 6, 0, Math.PI * 2);
        ctx.fill();

        // Thruster flame
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(-6, 14);
        ctx.lineTo(0, 24 + Math.random() * 6);
        ctx.lineTo(6, 14);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    },
    []
  );

  // Live Hero Preview Animation in Hero Editor Tab
  useEffect(() => {
    if (activeTab !== 'heroEditor') {
      if (previewAnimFrameIdRef.current) cancelAnimationFrame(previewAnimFrameIdRef.current);
      return;
    }

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const loop = () => {
      time += 0.05;
      ctx.fillStyle = '#08090d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Hovering hero sprite
      const floatY = canvas.height / 2 + Math.sin(time * 2) * 8;
      drawHeroSprite(ctx, canvas.width / 2, floatY, heroProfile);

      // Hero name banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${heroProfile.name} ${heroProfile.avatarEmoji}`, canvas.width / 2, canvas.height - 22);

      previewAnimFrameIdRef.current = requestAnimationFrame(loop);
    };

    previewAnimFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (previewAnimFrameIdRef.current) cancelAnimationFrame(previewAnimFrameIdRef.current);
    };
  }, [activeTab, heroProfile, drawHeroSprite]);

  // Main 60FPS Arcade Game Engine loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'arcade' || gameState !== 'playing') {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Keys pressed state
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'Escape') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Initial Lives & Speed based on Hero Special Power
    const initialLives = heroProfile.specialPower === 'shield-overcharge' ? 4 : 3;
    const heroSpeed = heroProfile.specialPower === 'quantum-speed' ? 8.5 : 6;
    const shootDelay = heroProfile.specialPower === 'rapid-blaster' ? 115 : 180;
    const isMegaBeam = heroProfile.specialPower === 'mega-beam';

    let player = {
      x: canvas.width / 2,
      y: canvas.height - 50,
      width: 32,
      height: 32,
      speed: heroSpeed,
      lives: initialLives,
      lastShoot: 0,
    };

    let bullets: Array<{ x: number; y: number; speed: number }> = [];
    let enemies: Array<{ x: number; y: number; width: number; height: number; speed: number; hp: number; color: string }> = [];
    let particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = [];
    let stars: Array<{ x: number; y: number; size: number; speed: number }> = [];

    // Background stars
    for (let i = 0; i < 75; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5,
      });
    }

    let currentScore = 0;
    let spawnTimer = 0;
    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Clear canvas
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render & update stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Player Movement
      if (keys['KeyA'] || keys['ArrowLeft']) player.x -= player.speed;
      if (keys['KeyD'] || keys['ArrowRight']) player.x += player.speed;
      if (keys['KeyW'] || keys['ArrowUp']) player.y -= player.speed;
      if (keys['KeyS'] || keys['ArrowDown']) player.y += player.speed;

      // Constrain inside bounds
      player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
      player.y = Math.max(40, Math.min(canvas.height - 20, player.y));

      // Player Shooting
      if (keys['Space'] && time - player.lastShoot > shootDelay) {
        if (isMegaBeam) {
          bullets.push({ x: player.x, y: player.y - 18, speed: 12 });
        } else {
          bullets.push({ x: player.x - 7, y: player.y - 15, speed: 10 });
          bullets.push({ x: player.x + 7, y: player.y - 15, speed: 10 });
        }
        playSound('laser');
        player.lastShoot = time;
      }

      // Update & Draw Bullets
      ctx.fillStyle = heroProfile.laserColor;
      ctx.shadowColor = heroProfile.laserColor;
      ctx.shadowBlur = isMegaBeam ? 12 : 8;
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y -= b.speed;
        const bWidth = isMegaBeam ? 7 : 4;
        const bHeight = isMegaBeam ? 18 : 12;
        ctx.fillRect(b.x - bWidth / 2, b.y - bHeight / 2, bWidth, bHeight);
        if (b.y < -10) bullets.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // Spawn Enemies
      spawnTimer += dt;
      if (spawnTimer > 0.75) {
        spawnTimer = 0;
        const colors = ['#f43f5e', '#a855f7', '#fbbf24', '#06b6d4'];
        enemies.push({
          x: Math.random() * (canvas.width - 60) + 30,
          y: -30,
          width: 28,
          height: 28,
          speed: Math.random() * 2 + 2.5,
          hp: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Update Enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;

        // Draw Enemy Ship
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y + enemy.height);
        ctx.lineTo(enemy.x - enemy.width / 2, enemy.y);
        ctx.lineTo(enemy.x + enemy.width / 2, enemy.y);
        ctx.closePath();
        ctx.fill();

        // Check bullet collisions
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (
            Math.abs(b.x - enemy.x) < enemy.width / 2 + 5 &&
            Math.abs(b.y - enemy.y) < enemy.height / 2 + 8
          ) {
            bullets.splice(j, 1);
            enemy.hp -= 1;
            if (enemy.hp <= 0) {
              playSound('explosion');
              currentScore += 100;
              setScore(currentScore);
              updateHighScore(currentScore);

              // Particles
              for (let p = 0; p < 12; p++) {
                particles.push({
                  x: enemy.x,
                  y: enemy.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 1.0,
                  color: enemy.color,
                });
              }
              enemies.splice(i, 1);
              break;
            }
          }
        }

        // Check player collision
        if (
          Math.abs(player.x - enemy.x) < 24 &&
          Math.abs(player.y - enemy.y) < 24
        ) {
          enemies.splice(i, 1);
          playSound('hit');
          player.lives -= 1;

          // Screen flash
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (player.lives <= 0) {
            playSound('gameover');
            setGameState('gameover');
            return;
          }
        }

        // Offscreen remove
        if (enemy.y > canvas.height + 40) {
          enemies.splice(i, 1);
        }
      }

      // Update Particles
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= dt * 2;
        if (pt.life <= 0) {
          particles.splice(p, 1);
        } else {
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = Math.max(0, pt.life);
          ctx.fillRect(pt.x, pt.y, 3, 3);
          ctx.globalAlpha = 1.0;
        }
      }

      // Draw the customized Player / Hero Character
      drawHeroSprite(ctx, player.x, player.y, heroProfile);

      // HUD overlay: Hero Name, Lives & Score
      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 12px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`EROU: ${heroProfile.name.toUpperCase()} ${heroProfile.avatarEmoji}`, 16, 24);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`SCOR: ${currentScore}`, 16, 42);

      ctx.fillStyle = '#f3f4f6';
      ctx.textAlign = 'right';
      ctx.fillText(`VIEȚI: ${'❤️'.repeat(Math.max(0, player.lives))}`, canvas.width - 16, 24);
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`PUTERE: ${heroProfile.specialPower.toUpperCase()}`, canvas.width - 16, 42);

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isOpen, activeTab, gameState, playSound, updateHighScore, drawHeroSprite, heroProfile]);

  const startGame = () => {
    setScore(0);
    setGameState('playing');
  };

  const handleGenerateGameFromPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamePrompt.trim()) return;

    setCustomGameNotice(`Jocul cu eroul "${heroProfile.name}" a fost generat și calibrat de rares.ro.ai!`);
    onAskAiToCreateGame?.(
      `Creează și configurează un joc interactiv în care personajul principal sunt eu (${heroProfile.name}). Cerință: "${gamePrompt}". Asigură-te că personajul meu are abilități speciale, comenzi responsive și efecte sonore!`
    );
    setActiveTab('arcade');
    setGameState('playing');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#090b10] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-4 py-3 border-b border-neutral-800 bg-[#0d0f14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Gamepad2 size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                rares.ro.ai Game Studio
                <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Arcade Live
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Editează-te direct în jocuri arcade sau creează jocuri noi cu AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title={soundEnabled ? 'Dezactivează sunetul' : 'Activează sunetul'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Studio Navigation with 3 Tabs */}
        <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('arcade')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'arcade'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Rocket size={14} className="text-pink-400" />
              <span>Joacă Arcade</span>
            </button>

            {/* NEW TAB: Editează-mă în Joc */}
            <button
              onClick={() => setActiveTab('heroEditor')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'heroEditor'
                  ? 'bg-purple-900/60 border border-purple-500/40 text-purple-200 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <UserCheck size={14} className="text-purple-400" />
              <span>Editează-mă în Joc</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Creează Joc cu AI</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Trophy size={13} className="text-amber-400" />
              <span className="text-[11px] font-mono font-bold text-amber-300">
                BEST: {highScore}
              </span>
            </div>
          </div>
        </div>

        {/* Tab 1: Arcade Viewport */}
        {activeTab === 'arcade' && (
          <div className="relative flex-1 bg-black flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden min-h-[380px] sm:min-h-[460px]">
            {/* Canvas Viewport */}
            <canvas
              ref={canvasRef}
              width={680}
              height={440}
              className="max-w-full max-h-[60vh] rounded-xl border border-neutral-800 shadow-2xl bg-[#07090e]"
            />

            {/* Title Screen Overlay */}
            {gameState === 'title' && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-xl shadow-purple-600/30 ring-1 ring-white/20 animate-pulse">
                  <Rocket size={32} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider mb-2 font-mono">
                  COSMO SHOOTER 2026
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mb-4 leading-relaxed">
                  Controlează eroul <strong className="text-purple-300">{heroProfile.name}</strong> în lupta cosmică!
                </p>

                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('heroEditor')}
                    className="px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck size={14} className="text-purple-400" />
                    <span>Costum activ: {heroProfile.name} ({heroProfile.skin})</span>
                  </button>
                </div>

                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-pink-600/30 transition-all cursor-pointer flex items-center gap-2 group"
                >
                  <Play size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  <span>START JOC (Space / Click)</span>
                </button>

                <p className="text-[11px] text-neutral-500 font-mono mt-4">
                  WASD / Săgeți: Mișcare · Spațiu: Foc · Esc: Pauză
                </p>
              </div>
            )}

            {/* Game Over Modal */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-red-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                <h2 className="text-3xl font-black text-red-400 font-mono tracking-widest mb-2 animate-bounce">
                  GAME OVER
                </h2>
                <p className="text-sm text-neutral-200 mb-1">
                  Eroul <span className="font-bold text-white">{heroProfile.name}</span> a obținut:{' '}
                  <span className="font-bold text-white text-lg">{score}</span> puncte
                </p>
                {score >= highScore && score > 0 && (
                  <p className="text-xs text-amber-400 font-semibold mb-6 flex items-center gap-1">
                    <Trophy size={14} /> Nou record personal!
                  </p>
                )}

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={startGame}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>Joacă din nou</span>
                  </button>
                  <button
                    onClick={() => setGameState('title')}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
                  >
                    Meniu Principal
                  </button>
                </div>
              </div>
            )}

            {/* Pause Modal */}
            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                <h2 className="text-2xl font-bold text-white font-mono mb-4">JOCUL ESTE ÎN PAUZĂ</h2>
                <button
                  onClick={() => setGameState('playing')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Play size={14} />
                  <span>Continuă</span>
                </button>
              </div>
            )}

            {/* Mobile Touch Controls Overlay */}
            {gameState === 'playing' && (
              <div className="w-full max-w-lg flex items-center justify-between pt-2 px-4 sm:hidden">
                <div className="flex items-center gap-2">
                  <button
                    onTouchStart={() => {
                      const e = new KeyboardEvent('keydown', { code: 'ArrowLeft' });
                      window.dispatchEvent(e);
                    }}
                    onTouchEnd={() => {
                      const e = new KeyboardEvent('keyup', { code: 'ArrowLeft' });
                      window.dispatchEvent(e);
                    }}
                    className="w-12 h-12 rounded-xl bg-neutral-800 text-white font-bold active:bg-neutral-700"
                  >
                    ◀
                  </button>
                  <button
                    onTouchStart={() => {
                      const e = new KeyboardEvent('keydown', { code: 'ArrowRight' });
                      window.dispatchEvent(e);
                    }}
                    onTouchEnd={() => {
                      const e = new KeyboardEvent('keyup', { code: 'ArrowRight' });
                      window.dispatchEvent(e);
                    }}
                    className="w-12 h-12 rounded-xl bg-neutral-800 text-white font-bold active:bg-neutral-700"
                  >
                    ▶
                  </button>
                </div>
                <button
                  onTouchStart={() => {
                    const e = new KeyboardEvent('keydown', { code: 'Space' });
                    window.dispatchEvent(e);
                  }}
                  onTouchEnd={() => {
                    const e = new KeyboardEvent('keyup', { code: 'Space' });
                    window.dispatchEvent(e);
                  }}
                  className="w-16 h-12 rounded-xl bg-pink-600 text-white font-bold active:bg-pink-500"
                >
                  FOC
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: "Editează-mă în Joc" (Hero Customizer) */}
        {activeTab === 'heroEditor' && (
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-neutral-900 border border-purple-500/30 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck size={16} className="text-purple-400" />
                  <span>Editor Erou Arcade: Editează-te direct în joc!</span>
                </h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  Personalizează-ți personajul arcade! Alege-ți numele, costumul de erou, culoarea laserelor și super-abilitatea cu care vei juca.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left Column: Editor controls */}
              <div className="md:col-span-2 space-y-4">
                {/* 1. Name Input */}
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                    Numele tău în joc (Hero Pilot):
                  </label>
                  <input
                    type="text"
                    value={heroProfile.name}
                    onChange={(e) => setHeroProfile({ ...heroProfile, name: e.target.value })}
                    placeholder="Ex: Rareș"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>

                {/* 2. Character Skin */}
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                    Model Personaj & Costum Erou:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: 'rares-cyber',
                        title: 'Rareș Cyber Hero',
                        desc: 'Armură cu vizor neon, pelerină și propulsoare',
                        icon: '⚡',
                      },
                      {
                        id: 'pixel-rares',
                        title: 'Pixel Rareș',
                        desc: 'Erou 8-bit retro cu sabie de energie și scut',
                        icon: '👾',
                      },
                      {
                        id: 'quantum-ship',
                        title: 'Quantum Fighter',
                        desc: 'Interceptor stelar marcat cu inițialele tale',
                        icon: '🚀',
                      },
                      {
                        id: 'neon-mecha',
                        title: 'Titan Mecha',
                        desc: 'Robot masiv cu tunuri laser pe umeri',
                        icon: '🤖',
                      },
                    ].map((skin) => (
                      <button
                        key={skin.id}
                        type="button"
                        onClick={() =>
                          setHeroProfile({
                            ...heroProfile,
                            skin: skin.id as any,
                            avatarEmoji: skin.icon,
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          heroProfile.skin === skin.id
                            ? 'bg-purple-950/40 border-purple-500 text-white shadow-xs ring-1 ring-purple-500/30'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{skin.icon}</span>
                          <span className="text-xs font-bold truncate">{skin.title}</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">{skin.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Laser & Energy Color */}
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                    Culoare Lasere & Energie:
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { color: '#38bdf8', label: 'Cyan Neon' },
                      { color: '#facc15', label: 'Auriu Electric' },
                      { color: '#f43f5e', label: 'Rubin Neon' },
                      { color: '#10b981', label: 'Smarald' },
                      { color: '#a855f7', label: 'Violet Cyber' },
                    ].map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => setHeroProfile({ ...heroProfile, laserColor: item.color })}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          heroProfile.laserColor === item.color
                            ? 'border-white bg-neutral-800 text-white font-semibold'
                            : 'border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[11px] hidden sm:inline">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Special Super Power */}
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                    Super-Abilitate Activă:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: 'rapid-blaster',
                        name: 'Turbo Blaster',
                        desc: 'Cadenta de tragere cu 50% mai rapidă',
                        icon: Zap,
                      },
                      {
                        id: 'shield-overcharge',
                        name: 'Scut Supraîncărcat',
                        desc: 'Începi jocul cu 4 vieți în loc de 3',
                        icon: Shield,
                      },
                      {
                        id: 'mega-beam',
                        name: 'Mega Laser Proiectil',
                        desc: 'Lasere duble groase cu rază mare',
                        icon: Flame,
                      },
                      {
                        id: 'quantum-speed',
                        name: 'Viteză Cuantică',
                        desc: 'Manevrabilitate și deplasare +35%',
                        icon: Rocket,
                      },
                    ].map((power) => {
                      const Icon = power.icon;
                      const isSelected = heroProfile.specialPower === power.id;
                      return (
                        <button
                          key={power.id}
                          type="button"
                          onClick={() => setHeroProfile({ ...heroProfile, specialPower: power.id as any })}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-800 border-purple-500 text-white ring-1 ring-purple-500/30'
                              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                              <Icon size={14} className="text-purple-400" />
                              <span>{power.name}</span>
                            </div>
                            {isSelected && <Check size={12} className="text-emerald-400" />}
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{power.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Animated Hero Preview */}
              <div className="flex flex-col items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <div className="w-full text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    Previzualizare Live Erou
                  </span>
                </div>

                <div className="my-3">
                  <canvas
                    ref={previewCanvasRef}
                    width={220}
                    height={200}
                    className="rounded-xl border border-neutral-800 bg-[#07080d]"
                  />
                </div>

                <div className="w-full space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('arcade');
                      setGameState('playing');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play size={14} />
                    <span>Salvează & Joacă cu {heroProfile.name}!</span>
                  </button>

                  <p className="text-[10px] text-center text-neutral-500">
                    Toate modificările se aplică instantaneu în jocul arcade!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Create Game with AI Prompt */}
        {activeTab === 'generator' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-neutral-900 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                <Zap size={16} className="text-purple-400" />
                <span>Generatorul de Jocuri rares.ro.ai</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Descrie orice joc pe care dorești să îl creezi. AI-ul va genera codul complet, logica de joc și te va plasa pe tine (<strong className="text-purple-300">{heroProfile.name}</strong>) ca personaj principal!
              </p>
            </div>

            <form onSubmit={handleGenerateGameFromPrompt} className="space-y-3">
              <label className="font-semibold text-xs text-neutral-200 block">
                Ce fel de joc dorești să creezi cu eroul {heroProfile.name}?
              </label>
              <div className="relative">
                <textarea
                  value={gamePrompt}
                  onChange={(e) => setGamePrompt(e.target.value)}
                  placeholder={`Ex: Creează un joc arcade 2D unde personajul ${heroProfile.name} evită lasere roșii și colectează sfere de energie...`}
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              {/* Sample game prompts chips featuring Hero */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  `🚀 Luptă cosmică cu ${heroProfile.name} și lasere aurii`,
                  `🧱 Breakout cyberpunk apărat de ${heroProfile.name}`,
                  `⚡ Runner neon cu ${heroProfile.name} sărind peste obstacole`,
                  `🛡️ Misiune de salvare galaxie cu ${heroProfile.name}`,
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGamePrompt(chip)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!gamePrompt.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Generează Jocul cu {heroProfile.name}</span>
                </button>
              </div>
            </form>

            {customGameNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Sparkles size={14} />
                <span>{customGameNotice}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer controls hint */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span>
            Pilot activ: <strong className="text-white">{heroProfile.name}</strong> ({heroProfile.skin}) · Web Audio Synth FX
          </span>
          <span className="font-mono">WASD / Săgeți: Mișcare · Spațiu: Foc</span>
        </div>
      </div>
    </div>
  );
};
