import React from 'react';
import {
  Sparkles,
  Music,
  Video,
  MapPin,
  Newspaper,
  Play,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Radio,
  ExternalLink,
  Volume2,
  Ticket,
  ShoppingBag,
  QrCode,
  Crown,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Star,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { ActiveTab } from '../AppShell';
import { INITIAL_CONCERTS } from '../../data/mockData';

interface HomeScreenProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onPlayTrackQuick: (genreId: string, trackTitle: string) => void;
  onOpenScanner?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onPlayTrackQuick,
  onOpenScanner,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Royal Welcome Hero Banner: BGla Mac */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c1913] via-[#141414] to-[#0d0d0d] border border-[#D4AF37]/50 p-6 sm:p-10 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span>Programme : BGla Mac • Application Android & Site Web</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-['Syne',sans-serif] tracking-tight leading-tight">
              Plateforme <span className="text-[#D4AF37] drop-shadow-md">BGla Mac</span> 🎤
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl leading-relaxed font-medium">
              Plateforme de <strong className="text-white">musique</strong>, <strong className="text-white">clips</strong>, actualités des artistes, <strong className="text-white">concerts</strong> et <strong className="text-white">billetterie en ligne</strong> (Standard, VIP, VVIP) avec vérification QR code à l’entrée.
            </p>

            {/* Core Feature Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-300">
              <span className="px-3 py-1 rounded-full bg-[#1e1e1e] border border-[#333] flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Abonnement artiste : <strong>10 000 FCFA/mois</strong></span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#1e1e1e] border border-[#333] flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-purple-400" />
                <span>Billetterie : <strong>Standard, VIP & VVIP</strong></span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#1e1e1e] border border-[#333] flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scanner vérification à l’entrée</span>
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => onNavigateTab('tiktok')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-current animate-pulse" />
                <span>BGla Tok (Vidéos TikTok & Montage)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('tour')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e2bd44] text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-[#D4AF37]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Ticket className="w-4 h-4 stroke-[2.5]" />
                <span>Billetterie Concerts</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenScanner) onOpenScanner();
                  else onNavigateTab('scanner');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <QrCode className="w-4 h-4 stroke-[2.5]" />
                <span>Scanner d'Entrée</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('dashboard')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D1D1D] hover:bg-[#282828] border border-[#D4AF37]/50 text-[#D4AF37] font-extrabold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#D4AF37]/15 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Artiste</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('music')}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-zinc-800 text-zinc-300 font-medium text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Music className="w-4 h-4 text-[#D4AF37]" />
                <span>Musiques</span>
              </button>
            </div>
          </div>

          {/* Right Highlight Card: Artist subscription & featured headliner */}
          <div className="lg:col-span-4 bg-[#141414]/90 border border-[#2b281d] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-4 h-4" /> Espace Artiste Pro
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                10 000 FCFA/mois
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#D4AF37] shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80"
                  alt="Oude Mill"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Oude Mill</h4>
                <p className="text-[11px] text-zinc-400">Artiste Ambassadeur BGla Mac</p>
                <span className="text-[10px] text-[#D4AF37] font-semibold">
                  World Tour • Stades d'Afrique & Europe
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1b1b1b] border border-[#262626] space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Concert à venir :</span>
                <strong className="text-white">Stade du 26-Mars</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Catégories :</span>
                <span className="text-[#D4AF37] font-semibold">Standard, VIP, VVIP</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Contrôle d’accès :</span>
                <span className="text-emerald-400 font-semibold">QR Code Live</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="w-full py-2 rounded-xl bg-[#242424] hover:bg-[#303030] text-white text-xs font-bold border border-[#3a3a3a] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Accéder au Dashboard Artiste</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars of BGla Mac Platform */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1 */}
        <div
          onClick={() => onNavigateTab('music')}
          className="p-5 rounded-2xl bg-[#151515] border border-[#242424] hover:border-[#D4AF37]/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
              Musiques & Streaming
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Écoutez les titres officiels, singles et albums en haute définition sonore avec lecteur audio complet.
            </p>
          </div>
          <span className="text-[11px] text-[#D4AF37] font-semibold flex items-center gap-1">
            Découvrir le catalogue <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Pillar 2 */}
        <div
          onClick={() => onNavigateTab('tour')}
          className="p-5 rounded-2xl bg-[#151515] border border-[#242424] hover:border-purple-500/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Billetterie en Ligne
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Billets Standard, VIP et VVIP avec prix fixés par les artistes ou organisateurs et paiement Mobile Money instantané.
            </p>
          </div>
          <span className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
            Réserver mes places <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Pillar 3 */}
        <div
          onClick={() => {
            if (onOpenScanner) onOpenScanner();
            else onNavigateTab('scanner');
          }}
          className="p-5 rounded-2xl bg-[#151515] border border-[#242424] hover:border-emerald-500/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Scanner d'Entrée
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Contrôle d'accès en direct avec caméra smartphone/PC, validation instantanée et détection immédiate des billets déjà utilisés.
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            Lancer le scanner <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Pillar 4 */}
        <div
          onClick={() => onNavigateTab('dashboard')}
          className="p-5 rounded-2xl bg-[#151515] border border-[#242424] hover:border-amber-500/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Dashboard Artiste Pro
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Abonnement à 10 000 FCFA/mois : créez vos concerts, fixez vos prix, suivez vos revenus et gérez votre billetterie sans intermédiaire.
            </p>
          </div>
          <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
            Espace artiste <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Architecture & Split 95/5 Banner */}
      <div
        onClick={() => onNavigateTab('architecture')}
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1c1424] via-[#161616] to-[#121212] border border-purple-500/40 hover:border-purple-400 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Architecture & Split 95/5
              </span>
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                [App] → [API Backend] → [Base de données] → [Stripe/PayPal] → [Comptes créateurs]
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1 group-hover:text-purple-200 transition-colors">
              Paiements en Ligne & Reversement Garanti 95% aux Artistes
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl mt-0.5">
              Traçabilité totale : cartes bancaires internationales et Mobile Money (Wave, Orange, Moov) routés avec déduction automatique des 5% de frais plateforme et versement des 95% au créateur.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-black flex items-center gap-1.5 shrink-0 self-start md:self-auto transition-transform group-hover:translate-x-1 cursor-pointer"
        >
          <span>Tester le Flux API</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* BGla Tok Showcase Banner (TikTok Feed & Video Editing) */}
      <div
        onClick={() => onNavigateTab('tiktok')}
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1c1218] via-[#141414] to-[#121212] border border-pink-500/40 hover:border-pink-400 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-pink-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-pink-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Nouveau • BGla Tok (Style TikTok)
              </span>
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                Format 9:16 • Découpage • 10 Shaders Visuels • Punchlines & Synchronisation Audio
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1 group-hover:text-pink-200 transition-colors">
              Regardez les Vidéos Façon TikTok & Créez vos Propres Montages avec Effets
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl mt-0.5">
              Faites défiler le feed vertical, double-cliquez pour liker, commentez en direct et ouvrez le studio de montage pour couper vos clips, appliquer les filtres Or Sahel, VHS 90s, Séisme Bass 808 et publier instantanément.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black flex items-center gap-1.5 shrink-0 self-start md:self-auto transition-transform group-hover:translate-x-1 cursor-pointer"
        >
          <span>Lancer BGla Tok</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Featured Concerts Highlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase font-['Syne',sans-serif]">
              Prochains Concerts & Billetterie BGla Mac
            </h2>
            <p className="text-xs text-zinc-400">
              Choisissez votre catégorie : Standard, VIP ou VVIP.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('tour')}
            className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            <span>Voir toutes les dates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_CONCERTS.slice(0, 2).map((concert) => (
            <div
              key={concert.id}
              className="p-5 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#383838] transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#D4AF37] uppercase">{concert.artistName}</span>
                  <h3 className="text-sm font-bold text-white">{concert.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{concert.stadium} • {concert.city} ({concert.country})</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {concert.status}
                </span>
              </div>

              {/* Tiers Pricing row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#202020] text-center">
                <div className="p-2 rounded-lg bg-[#181818] border border-emerald-500/20">
                  <span className="text-[9px] text-zinc-400 block uppercase">Standard</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {concert.pricing.standard.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#181818] border border-amber-500/20">
                  <span className="text-[9px] text-zinc-400 block uppercase">VIP</span>
                  <span className="text-xs font-bold text-[#D4AF37] font-mono">
                    {concert.pricing.vip.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#181818] border border-purple-500/20">
                  <span className="text-[9px] text-zinc-400 block uppercase">VVIP</span>
                  <span className="text-xs font-bold text-purple-400 font-mono">
                    {concert.pricing.vvip.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab('tour')}
                className="w-full py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Acheter mes billets (QR Code)</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
