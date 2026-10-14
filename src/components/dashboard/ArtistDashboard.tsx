import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Ticket,
  Music,
  Video,
  Calendar,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Users,
  Eye,
  Crown,
  Sparkles,
  ExternalLink,
  Edit3,
  Trash2,
  Download,
  Share2,
  Smartphone,
  CreditCard,
  Flame,
  Check,
  Zap,
  ArrowDownLeft,
  Building2,
} from 'lucide-react';
import { ConcertEvent, ArtistProfile, ArtistTrack, PaymentProvider, CreatorAccountData, PayoutItem } from '../../types';
import { INITIAL_ARTIST, INITIAL_CONCERTS, INITIAL_TRACKS } from '../../data/mockData';
import { apiClient } from '../../utils/apiClient';

interface ArtistDashboardProps {
  onOpenScanner: () => void;
  onConcertCreated?: (concert: ConcertEvent) => void;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({
  onOpenScanner,
  onConcertCreated,
}) => {
  const [artist, setArtist] = useState<ArtistProfile>(INITIAL_ARTIST);
  const [concerts, setConcerts] = useState<ConcertEvent[]>(INITIAL_CONCERTS);
  const [tracks, setTracks] = useState<ArtistTrack[]>(INITIAL_TRACKS);

  // Live Creator Account data from server database
  const [creatorData, setCreatorData] = useState<CreatorAccountData | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(500000);
  const [payoutMethod, setPayoutMethod] = useState<'stripe_connect' | 'paypal' | 'wave'>('stripe_connect');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');

  // Subscription Renewal Modal State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewProvider, setRenewProvider] = useState<PaymentProvider>('orange_money');
  const [renewPhone, setRenewPhone] = useState('');
  const [isProcessingRenew, setIsProcessingRenew] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState(false);

  const loadCreator = async () => {
    try {
      const data = await apiClient.fetchCreator('artist-oude-mill');
      setCreatorData(data);
    } catch (e) {
      console.warn('Could not load creator data:', e);
    }
  };

  useEffect(() => {
    loadCreator();
  }, []);

  // Create Concert Modal State
  const [isCreateConcertOpen, setIsCreateConcertOpen] = useState(false);
  const [newConcertTitle, setNewConcertTitle] = useState('');
  const [newConcertStadium, setNewConcertStadium] = useState('');
  const [newConcertCity, setNewConcertCity] = useState('');
  const [newConcertCountry, setNewConcertCountry] = useState('Mali 🇲🇱');
  const [newConcertDate, setNewConcertDate] = useState('');
  const [newConcertTime, setNewConcertTime] = useState('20h00');
  const [newConcertCapacity, setNewConcertCapacity] = useState('25 000 places');

  // Custom Pricing set by the artist in FCFA
  const [priceStandardFCFA, setPriceStandardFCFA] = useState<number>(10000);
  const [priceVipFCFA, setPriceVipFCFA] = useState<number>(25000);
  const [priceVvipFCFA, setPriceVvipFCFA] = useState<number>(50000);

  // Quotas per tier
  const [quotaStandard, setQuotaStandard] = useState<number>(20000);
  const [quotaVip, setQuotaVip] = useState<number>(4000);
  const [quotaVvip, setQuotaVvip] = useState<number>(1000);

  const [newConcertHighlights, setNewConcertHighlights] = useState('');

  // Active dashboard tab including creator finances & 95/5 split
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'music' | 'subscription' | 'finances'>('overview');

  // Calculate live aggregates
  const totalRevenueFCFA = creatorData?.totalGrossFCFA ?? concerts.reduce((acc, c) => {
    const revStd = c.sold.standard * c.pricing.standard;
    const revVip = c.sold.vip * c.pricing.vip;
    const revVvip = c.sold.vvip * c.pricing.vvip;
    return acc + revStd + revVip + revVvip;
  }, 0);

  const totalTicketsSold = concerts.reduce((acc, c) => {
    return acc + c.sold.standard + c.sold.vip + c.sold.vvip;
  }, 0);

  // Handle subscription payment renewal (10 000 FCFA / month) via server API
  const handleRenewSubscription = async () => {
    if (!renewPhone.trim()) {
      alert('Veuillez renseigner votre numéro de téléphone de paiement.');
      return;
    }
    setIsProcessingRenew(true);
    try {
      await apiClient.renewSubscription('artist-oude-mill', renewProvider);
      setIsProcessingRenew(false);
      setRenewSuccess(true);
      setArtist((prev) => ({
        ...prev,
        subscriptionStatus: 'active',
        subscriptionRenewsAt: 'Dans 30 jours (Renouvelé)',
      }));
      loadCreator();
      setTimeout(() => {
        setRenewSuccess(false);
        setIsRenewModalOpen(false);
      }, 2000);
    } catch (e: any) {
      setIsProcessingRenew(false);
      alert(e?.message || 'Erreur lors du renouvellement');
    }
  };

  // Handle Creator Payout / Withdrawal (Stripe Connect / PayPal / Wave)
  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0) {
      alert('Montant de virement invalide.');
      return;
    }
    setIsProcessingPayout(true);
    try {
      const res = await apiClient.requestPayout('artist-oude-mill', payoutAmount, payoutMethod);
      if (res.success) {
        setPayoutSuccessMsg(`Virement de ${payoutAmount.toLocaleString('fr-FR')} FCFA validé avec succès vers ${payoutMethod.toUpperCase()} !`);
        loadCreator();
        setTimeout(() => {
          setIsPayoutModalOpen(false);
          setPayoutSuccessMsg('');
        }, 2200);
      }
    } catch (err: any) {
      alert(err?.message || 'Erreur lors du virement');
    } finally {
      setIsProcessingPayout(false);
    }
  };

  // Handle new concert creation with custom prices
  const handleCreateConcertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcertTitle || !newConcertStadium || !newConcertDate) {
      alert('Veuillez remplir le titre, le lieu et la date du concert.');
      return;
    }

    const created: ConcertEvent = {
      id: 'concert-' + Date.now(),
      title: newConcertTitle,
      artistName: artist.name,
      artistAvatar: artist.avatar,
      stadium: newConcertStadium,
      city: newConcertCity || 'Bamako',
      country: newConcertCountry,
      date: newConcertDate,
      time: newConcertTime,
      status: 'Billetterie Ouverte',
      soldOut: false,
      capacity: newConcertCapacity,
      pricing: {
        standard: Number(priceStandardFCFA),
        vip: Number(priceVipFCFA),
        vvip: Number(priceVvipFCFA),
      },
      quotas: {
        standard: Number(quotaStandard),
        vip: Number(quotaVip),
        vvip: Number(quotaVvip),
      },
      sold: {
        standard: 0,
        vip: 0,
        vvip: 0,
      },
      highlights: newConcertHighlights || 'Concert exceptionnel BGla Mac avec scénographie moderne et show lumière.',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    };

    setConcerts([created, ...concerts]);
    onConcertCreated?.(created);
    setIsCreateConcertOpen(false);
    alert(`Concert "${newConcertTitle}" créé avec succès ! Prix fixés : Standard ${priceStandardFCFA} FCFA, VIP ${priceVipFCFA} FCFA, VVIP ${priceVvipFCFA} FCFA.`);
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Artist Banner & Subscription Badge */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#171717] via-[#1c1a14] to-[#171717] border border-[#2b281d] p-5 sm:p-7 shadow-2xl overflow-hidden">
        {/* Subtle gold decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20 shrink-0">
              <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-center text-[9px] font-black text-[#D4AF37]">
                PRO
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-['Syne',sans-serif]">
                  {artist.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37] text-black uppercase tracking-wider">
                  Artiste BGla Mac Pro
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Abonnement Actif
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-xl">{artist.tagline}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1">
                <span>{artist.genre}</span>
                <span>•</span>
                <span className="text-[#D4AF37] font-semibold">
                  Abonnement : <strong>10 000 FCFA / mois</strong>
                </span>
                <span>•</span>
                <span className="text-zinc-500">Renouvellement : {artist.subscriptionRenewsAt}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenScanner}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>Scanner Entrée Concert</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateConcertOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold text-xs shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Créer un Concert</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRenewModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2c2c2c] text-white border border-[#333] text-xs font-bold transition-all"
            >
              Gérer Abonnement (10k FCFA)
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262626] pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview' as const, label: 'Vue d’Ensemble & Revenus', icon: TrendingUp },
          { id: 'finances' as const, label: 'Compte Créateur & Split 95/5', icon: DollarSign },
          { id: 'events' as const, label: `Concerts & Billetterie (${concerts.length})`, icon: Calendar },
          { id: 'music' as const, label: `Morceaux & Streams (${tracks.length})`, icon: Music },
          { id: 'subscription' as const, label: 'Abonnement 10 000 FCFA', icon: Crown },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-["Syne",sans-serif]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#151515] border border-[#262626] space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Revenus Billetterie</span>
                <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {totalRevenueFCFA.toLocaleString('fr-FR')} <span className="text-xs text-[#D4AF37]">FCFA</span>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> +18.4% ce mois-ci
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#151515] border border-[#262626] space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Billets Émis / Vendus</span>
                <Ticket className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {totalTicketsSold.toLocaleString('fr-FR')}
              </div>
              <div className="text-[11px] text-zinc-400">
                Standard, VIP & VVIP cumulés
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#151515] border border-[#262626] space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Streams Musique</span>
                <Music className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {artist.totalStreams.toLocaleString('fr-FR')}
              </div>
              <div className="text-[11px] text-cyan-400 font-semibold">
                Sur BGla Mac Audio Player
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#151515] border border-[#262626] space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Abonnement Artiste</span>
                <Crown className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-black text-[#D4AF37] font-mono">
                10 000 <span className="text-xs">FCFA/mois</span>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Actif jusqu'au {artist.subscriptionRenewsAt}
              </div>
            </div>
          </div>

          {/* Breakdown by Tier (Standard, VIP, VVIP) */}
          <div className="p-5 rounded-2xl bg-[#151515] border border-[#262626] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase font-['Syne',sans-serif] tracking-wide">
                  Répartition des Ventes par Catégorie de Billet
                </h3>
                <p className="text-xs text-zinc-400">
                  Prix fixés librement par l'artiste ou l'organisateur en FCFA
                </p>
              </div>
              <span className="text-xs font-mono text-[#D4AF37] font-bold">Plateforme BGla Mac</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Standard */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-300">Catégorie Standard</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Fosse / Gradin</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {concerts.reduce((a, c) => a + c.sold.standard, 0).toLocaleString('fr-FR')} <span className="text-xs text-zinc-400">places vendues</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Prix moyen fixé : <strong>10 000 FCFA</strong>
                </p>
              </div>

              {/* VIP */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-amber-300">Catégorie VIP</span>
                  <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold">Siège + Coupe-file</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {concerts.reduce((a, c) => a + c.sold.vip, 0).toLocaleString('fr-FR')} <span className="text-xs text-zinc-400">places vendues</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Prix moyen fixé : <strong>25 000 FCFA</strong>
                </p>
              </div>

              {/* VVIP */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-purple-300">Catégorie VVIP</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">Backstage + Meet & Greet</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {concerts.reduce((a, c) => a + c.sold.vvip, 0).toLocaleString('fr-FR')} <span className="text-xs text-zinc-400">places vendues</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Prix moyen fixé : <strong>50 000 FCFA</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Quick link to Concert list */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171717] to-[#1f1d16] border border-[#2a271d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Équipe d’Accueil & Vigiles à l’Entrée</h4>
                <p className="text-xs text-zinc-400">
                  Ouvrez le scanner de billets pour vérifier les spectateurs à l'entrée avec caméra ou simulation.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              Lancer le Scanner d'Entrée
            </button>
          </div>
        </div>
      )}

      {/* Tab: Events & Concerts Management */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white uppercase font-['Syne',sans-serif]">
                Mes Concerts & Tarification Libre
              </h2>
              <p className="text-xs text-zinc-400">
                Fixez vos prix Standard, VIP et VVIP pour chaque événement.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateConcertOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black text-xs font-extrabold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nouveau Concert</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {concerts.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#383838] transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{c.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        {c.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span>{c.stadium} • {c.city}, {c.country}</span>
                      <span>•</span>
                      <span>{c.date} ({c.time})</span>
                      <span>•</span>
                      <span>Jauge : {c.capacity}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenScanner}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scanner ce concert</span>
                    </button>
                  </div>
                </div>

                {/* Pricing Grid fixed by artist */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#222]">
                  <div className="p-2.5 rounded-xl bg-[#1c1c1c] border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-zinc-400 block">Standard (Fixé)</span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      {c.pricing.standard.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      {c.sold.standard} / {c.quotas.standard} vendus
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#1c1c1c] border border-amber-500/20 text-center">
                    <span className="text-[10px] text-zinc-400 block">VIP (Fixé)</span>
                    <span className="text-sm font-extrabold text-[#D4AF37] font-mono">
                      {c.pricing.vip.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      {c.sold.vip} / {c.quotas.vip} vendus
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#1c1c1c] border border-purple-500/20 text-center">
                    <span className="text-[10px] text-zinc-400 block">VVIP (Fixé)</span>
                    <span className="text-sm font-extrabold text-purple-400 font-mono">
                      {c.pricing.vvip.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      {c.sold.vvip} / {c.quotas.vvip} vendus
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Music & Tracks */}
      {activeTab === 'music' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white uppercase font-['Syne',sans-serif]">
                Catalogue Musical & Streaming
              </h2>
              <p className="text-xs text-zinc-400">
                Titres distribués sur la plateforme BGla Mac avec écoutes certifiées.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tracks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl bg-[#151515] border border-[#262626] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.title}</h4>
                    <p className="text-[11px] text-zinc-400">{t.artist} • {t.genre}</p>
                    <span className="text-[10px] text-[#D4AF37] font-semibold">
                      {t.streams.toLocaleString('fr-FR')} streams
                    </span>
                  </div>
                </div>
                <div className="text-xs font-mono text-zinc-400">{t.duration}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Subscription Details (10 000 FCFA / month) */}
      {activeTab === 'subscription' && (
        <div className="p-6 rounded-2xl bg-[#151515] border border-[#2b271d] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-black text-white uppercase font-['Syne',sans-serif]">
                  Abonnement Artiste BGla Mac Pro
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Le programme BGla Mac offre aux artistes une autonomie totale sur leur musique et billetterie.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1c1c1c] border border-[#D4AF37]/40 text-center shrink-0">
              <span className="text-[10px] text-zinc-400 block uppercase">Tarif Abonnement</span>
              <span className="text-xl font-black text-[#D4AF37] font-mono">10 000 FCFA</span>
              <span className="text-[10px] text-zinc-500 block">par mois</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#282828] space-y-2">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider text-[#D4AF37]">
                Avantages Inclus dans le Programme :
              </h4>
              <ul className="text-xs text-zinc-300 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Publication illimitée de morceaux & clips en streaming</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Billetterie en ligne personnalisée (Standard, VIP, VVIP)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Paiements mobiles directs (Orange Money, Wave, Moov, MTN, Carte)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Accès au Scanner d’Entrée anti-fraude avec détection de doublons</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tableau de bord financier & rapports de billetterie</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#282828] space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                État de Votre Souscription :
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Statut :</span>
                  <span className="text-emerald-400 font-bold">Actif • À jour</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Tarif :</span>
                  <span className="text-white font-mono">10 000 FCFA / mois</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Prochaine Échéance :</span>
                  <span className="text-[#D4AF37] font-semibold">{artist.subscriptionRenewsAt}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>ID Souscription :</span>
                  <span className="font-mono text-zinc-300">BGLA-PRO-ARTIST-2026-99</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRenewModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black text-xs font-black transition-all cursor-pointer"
              >
                Renouveler ou Régler l’Abonnement (10 000 FCFA)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Creator Finances & 95/5 Split */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1c1912] via-[#151515] to-[#121212] border border-[#D4AF37]/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase mb-2">
                  <Zap className="w-3.5 h-3.5" />
                  Règle Financière : Split 95/5 Direct
                </div>
                <h3 className="text-xl font-black text-white font-['Syne',sans-serif]">
                  Compte Créateur & Revenus Certifiés
                </h3>
                <p className="text-xs text-zinc-400 max-w-2xl mt-1">
                  Sur BGla Mac, 95% des recettes de chaque billet vous reviennent directement. 5% couvrent l'infrastructure de streaming, la sécurité des billets et le contrôle d'accès par QR code.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Demander un Virement Immédiat</span>
              </button>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                  Solde Disponible
                </span>
                <strong className="text-xl font-black text-white font-mono block mt-0.5">
                  {(creatorData?.balanceFCFA ?? 3825000).toLocaleString('fr-FR')} <span className="text-xs text-[#D4AF37]">FCFA</span>
                </strong>
                <span className="text-[10px] text-emerald-400">Prêt à virer</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Total Brut Généré (100%)
                </span>
                <strong className="text-xl font-black text-white font-mono block mt-0.5">
                  {(creatorData?.totalGrossFCFA ?? totalRevenueFCFA).toLocaleString('fr-FR')} <span className="text-xs text-zinc-400">FCFA</span>
                </strong>
                <span className="text-[10px] text-zinc-500">Volume billetterie</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-[#D4AF37]/20">
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold block">
                  Part Créateur (95%)
                </span>
                <strong className="text-xl font-black text-[#D4AF37] font-mono block mt-0.5">
                  {(creatorData?.totalNetCreatorFCFA ?? Math.round(totalRevenueFCFA * 0.95)).toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
                </strong>
                <span className="text-[10px] text-amber-300/80">95% net reversé</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  Commission Plateforme (5%)
                </span>
                <strong className="text-xl font-black text-zinc-300 font-mono block mt-0.5">
                  {(creatorData?.totalPlatformFeesFCFA ?? Math.round(totalRevenueFCFA * 0.05)).toLocaleString('fr-FR')} <span className="text-xs text-zinc-500">FCFA</span>
                </strong>
                <span className="text-[10px] text-zinc-500">5% frais techniques</span>
              </div>
            </div>
          </div>

          {/* 3 Linked Payment Rails */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stripe Connect */}
            <div className="p-4 rounded-2xl bg-[#151515] border border-[#2a2a2a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#635bff]/20 flex items-center justify-center text-[#635bff] font-black text-xs">
                    S
                  </div>
                  <h4 className="font-bold text-white text-xs">Stripe Connect</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                  Connecté
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Compte Express connecté pour la réception des cartes bancaires Visa et Mastercard internationales avec transfert instantané.
              </p>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[10px] font-mono text-zinc-300 space-y-1">
                <div>ID: {creatorData?.stripeConnect.accountId || 'acct_1OuDeMiLL955BKO'}</div>
                <div className="text-emerald-400">Charges & Payouts : Actifs</div>
              </div>
            </div>

            {/* PayPal */}
            <div className="p-4 rounded-2xl bg-[#151515] border border-[#2a2a2a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0070ba]/20 flex items-center justify-center text-[#0070ba] font-black text-xs">
                    P
                  </div>
                  <h4 className="font-bold text-white text-xs">PayPal Marketplace</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                  Vérifié
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Paiements diaspora et internationaux via PayPal avec virement automatique par l'API Payouts.
              </p>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[10px] font-mono text-zinc-300 space-y-1">
                <div>Compte: {creatorData?.paypalAccount.email || 'payouts@oudemill-music.com'}</div>
                <div className="text-emerald-400">Statut: Business Marchand</div>
              </div>
            </div>

            {/* Mobile Money Mali */}
            <div className="p-4 rounded-2xl bg-[#151515] border border-[#2a2a2a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-xs">
                    W
                  </div>
                  <h4 className="font-bold text-white text-xs">Wave & Mobile Money</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 text-[10px] font-bold">
                  Actif
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Portefeuille Wave & Orange Money Mali pour virements directs sans frais vers le compte de l'artiste.
              </p>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[10px] font-mono text-zinc-300 space-y-1">
                <div>Tél: {creatorData?.mobileMoney.phoneNumber || '+223 76 00 11 22'}</div>
                <div className="text-cyan-400">{creatorData?.mobileMoney.holderName || 'Oumar Dembélé'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Payout */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#141414] border border-[#2c2c2c] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <h3 className="text-base font-black text-white uppercase font-['Syne',sans-serif]">
                  Demande de Virement Immédiat
                </h3>
                <p className="text-xs text-zinc-400">
                  Transférez vos 95% de recettes vers votre compte Stripe, PayPal ou Wave.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1.5 rounded-lg bg-[#222] text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {payoutSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-bold">{payoutSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handlePayoutSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">
                    Montant à retirer (FCFA) - Solde dispo : {(creatorData?.balanceFCFA ?? 3825000).toLocaleString('fr-FR')} FCFA
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(500000)}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${
                        payoutAmount === 500000 ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-[#1c1c1c] text-zinc-300 border-[#2a2a2a]'
                      }`}
                    >
                      500 000
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(1000000)}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${
                        payoutAmount === 1000000 ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-[#1c1c1c] text-zinc-300 border-[#2a2a2a]'
                      }`}
                    >
                      1 000 000
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(creatorData?.balanceFCFA ?? 3825000)}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${
                        payoutAmount === (creatorData?.balanceFCFA ?? 3825000)
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                          : 'bg-[#1c1c1c] text-zinc-300 border-[#2a2a2a]'
                      }`}
                    >
                      Tout Virer
                    </button>
                  </div>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    max={creatorData?.balanceFCFA ?? 3825000}
                    min={10000}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Destination du Virement</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('stripe_connect')}
                      className={`p-2.5 rounded-xl border text-left ${
                        payoutMethod === 'stripe_connect' ? 'border-[#635bff] bg-[#635bff]/15 text-white' : 'border-[#282828] bg-[#1a1a1a] text-zinc-400'
                      }`}
                    >
                      <div className="font-bold text-xs">Stripe Connect</div>
                      <div className="text-[10px] text-zinc-500">Compte acct_...</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('paypal')}
                      className={`p-2.5 rounded-xl border text-left ${
                        payoutMethod === 'paypal' ? 'border-[#0070ba] bg-[#0070ba]/15 text-white' : 'border-[#282828] bg-[#1a1a1a] text-zinc-400'
                      }`}
                    >
                      <div className="font-bold text-xs">PayPal</div>
                      <div className="text-[10px] text-zinc-500">Payouts API</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('wave')}
                      className={`p-2.5 rounded-xl border text-left ${
                        payoutMethod === 'wave' ? 'border-cyan-400 bg-cyan-500/15 text-white' : 'border-[#282828] bg-[#1a1a1a] text-zinc-400'
                      }`}
                    >
                      <div className="font-bold text-xs">Wave Mali</div>
                      <div className="text-[10px] text-zinc-500">+223 76...</div>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#222] text-zinc-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingPayout}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayout ? 'Traitement...' : 'Confirmer le Virement'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Concert with Custom Standard/VIP/VVIP Prices */}
      {isCreateConcertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#121212] border border-[#2c2c2c] rounded-2xl shadow-2xl overflow-hidden my-auto p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <h3 className="text-base font-black text-white uppercase font-['Syne',sans-serif]">
                  Créer un Concert & Fixer les Tarifs
                </h3>
                <p className="text-xs text-zinc-400">
                  Définissez librement les prix en FCFA pour Standard, VIP et VVIP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateConcertOpen(false)}
                className="p-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConcertSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-bold">Nom / Titre du Concert</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Oude Mill Live - Le Grand Show de Bamako"
                  value={newConcertTitle}
                  onChange={(e) => setNewConcertTitle(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Stade / Salle</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Stade du 26-Mars"
                    value={newConcertStadium}
                    onChange={(e) => setNewConcertStadium(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Ville & Pays</label>
                  <input
                    type="text"
                    placeholder="Ex : Bamako, Mali 🇲🇱"
                    value={newConcertCity}
                    onChange={(e) => setNewConcertCity(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Date de l’Événement</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : 10 Mars 2027"
                    value={newConcertDate}
                    onChange={(e) => setNewConcertDate(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Heure de Début</label>
                  <input
                    type="text"
                    placeholder="Ex : 20h30"
                    value={newConcertTime}
                    onChange={(e) => setNewConcertTime(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Fixation libre des prix Standard, VIP, VVIP */}
              <div className="p-3.5 rounded-xl bg-[#171717] border border-[#2a2a2a] space-y-3">
                <span className="text-[11px] font-extrabold uppercase text-[#D4AF37] tracking-wider block">
                  Tarification Billetterie (Fixée par vous en FCFA) :
                </span>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-emerald-400 font-bold">Prix Standard</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={priceStandardFCFA}
                      onChange={(e) => setPriceStandardFCFA(Number(e.target.value))}
                      className="w-full bg-[#121212] border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                    <span className="text-[10px] text-zinc-500 block">Quota :</span>
                    <input
                      type="number"
                      value={quotaStandard}
                      onChange={(e) => setQuotaStandard(Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#2c2c2c] rounded-lg px-2 py-1 text-zinc-300 font-mono text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#D4AF37] font-bold">Prix VIP</label>
                    <input
                      type="number"
                      required
                      min={2000}
                      step={1000}
                      value={priceVipFCFA}
                      onChange={(e) => setPriceVipFCFA(Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#D4AF37]/40 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                    <span className="text-[10px] text-zinc-500 block">Quota :</span>
                    <input
                      type="number"
                      value={quotaVip}
                      onChange={(e) => setQuotaVip(Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#2c2c2c] rounded-lg px-2 py-1 text-zinc-300 font-mono text-[11px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-purple-400 font-bold">Prix VVIP</label>
                    <input
                      type="number"
                      required
                      min={5000}
                      step={1000}
                      value={priceVvipFCFA}
                      onChange={(e) => setPriceVvipFCFA(Number(e.target.value))}
                      className="w-full bg-[#121212] border border-purple-500/40 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                    <span className="text-[10px] text-zinc-500 block">Quota :</span>
                    <input
                      type="number"
                      value={quotaVvip}
                      onChange={(e) => setQuotaVvip(Number(e.target.value))}
                      className="w-full bg-[#121212] border border-[#2c2c2c] rounded-lg px-2 py-1 text-zinc-300 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateConcertOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#222] hover:bg-[#333] text-zinc-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold shadow-md shadow-[#D4AF37]/20"
                >
                  Publier le Concert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Renew 10 000 FCFA Artist Subscription */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#121212] border border-[#2c2c2c] rounded-2xl shadow-2xl overflow-hidden my-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-black text-white uppercase font-['Syne',sans-serif]">
                  Abonnement Artiste BGla Mac
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRenewModalOpen(false)}
                className="p-1 rounded-lg bg-[#222] text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {renewSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-white">Abonnement Renouvelé avec Succès !</h4>
                <p className="text-xs text-zinc-400">
                  Votre statut BGla Mac Pro est actif pour les 30 prochains jours. Montant prélevé : 10 000 FCFA.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Tarif Mensuel Fixe</span>
                    <strong className="text-white text-sm">Programme BGla Mac Pro</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#D4AF37] font-mono">10 000 FCFA</span>
                    <span className="text-[10px] text-zinc-500 block">/ mois</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">Choisir le Mode de Règlement :</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'orange_money' as const, name: 'Orange Money', color: 'border-orange-500/40 text-orange-400' },
                      { id: 'wave' as const, name: 'Wave Mali / CI', color: 'border-cyan-500/40 text-cyan-400' },
                      { id: 'moov_money' as const, name: 'Moov Money', color: 'border-blue-500/40 text-blue-400' },
                      { id: 'mtn_momo' as const, name: 'MTN MoMo', color: 'border-yellow-500/40 text-yellow-400' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setRenewProvider(m.id)}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                          renewProvider === m.id
                            ? 'bg-[#222] border-[#D4AF37] text-white shadow-sm'
                            : 'bg-[#161616] border-[#262626] text-zinc-400'
                        }`}
                      >
                        <span className="block text-xs">{m.name}</span>
                        <span className="text-[10px] text-zinc-500">Paiement Mobile Instantané</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold block">Numéro de Téléphone :</label>
                  <input
                    type="tel"
                    placeholder="+223 76 12 34 56 ou +225 07..."
                    value={renewPhone}
                    onChange={(e) => setRenewPhone(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="button"
                  disabled={isProcessingRenew}
                  onClick={handleRenewSubscription}
                  className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold text-xs shadow-lg shadow-[#D4AF37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingRenew ? (
                    <span>Traitement du paiement en cours...</span>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Confirmer le Paiement (10 000 FCFA)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
