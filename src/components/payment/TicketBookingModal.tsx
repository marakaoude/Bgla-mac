import React, { useState } from 'react';
import {
  Ticket,
  ShieldCheck,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Download,
  Share2,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
  Flame,
  Users,
  Crown,
  Star,
  Check,
  Zap,
} from 'lucide-react';
import { PaymentProvider, PurchasedTicket, TicketTier, SplitDetail } from '../../types';
import { QRCodeSVG } from './QRCodeSVG';
import { apiClient } from '../../utils/apiClient';

interface TicketBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  concert: {
    id: string;
    stadium: string;
    city: string;
    country: string;
    date: string;
    title?: string;
    artistName?: string;
    pricing?: {
      standard: number;
      vip: number;
      vvip: number;
    };
  } | null;
  onTicketPurchased: (ticket: PurchasedTicket) => void;
}

const PAYMENT_METHODS: {
  id: PaymentProvider;
  name: string;
  desc: string;
  badge: string;
  color: string;
  prefix: string;
}[] = [
  {
    id: 'stripe_connect',
    name: 'Carte Bancaire (Stripe Connect)',
    desc: 'Visa / Mastercard internationale avec virement direct 95/5',
    badge: 'Split 95/5 Direct',
    color: '#635bff',
    prefix: '+33',
  },
  {
    id: 'paypal',
    name: 'PayPal (Marketplace)',
    desc: 'Paiement compte PayPal avec split automatisé au créateur',
    badge: 'PayPal 95/5',
    color: '#0070ba',
    prefix: '+33',
  },
  {
    id: 'wave',
    name: 'Wave (Mali & Côte d’Ivoire)',
    desc: 'Paiement sans frais instantané via l’application Wave',
    badge: 'Zéro Frais • 95% Artiste',
    color: '#1dc4f7',
    prefix: '+223',
  },
  {
    id: 'orange_money',
    name: 'Orange Money (*144#)',
    desc: 'Validation sécurisée par code USSD instantané',
    badge: 'Mali & Sous-région',
    color: '#ff7900',
    prefix: '+223',
  },
  {
    id: 'moov_money',
    name: 'Moov Africa Money (*166#)',
    desc: 'Paiement direct sécurisé Moov Money',
    badge: 'Mali / CI / Togo',
    color: '#005bac',
    prefix: '+223',
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money (MoMo)',
    desc: 'Règlement direct par compte MTN MoMo',
    badge: 'Afrique de l’Ouest',
    color: '#eab308',
    prefix: '+225',
  },
];

export const TicketBookingModal: React.FC<TicketBookingModalProps> = ({
  isOpen,
  onClose,
  concert,
  onTicketPurchased,
}) => {
  const [step, setStep] = useState<'category' | 'details' | 'payment' | 'processing' | 'confirmed'>('category');
  const [selectedTier, setSelectedTier] = useState<TicketTier>('vip');
  const [selectedMethod, setSelectedMethod] = useState<PaymentProvider>('stripe_connect');
  const [quantity, setQuantity] = useState<number>(1);

  // Buyer Info
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');

  // Resulting Ticket & Certified Split
  const [confirmedTicket, setConfirmedTicket] = useState<PurchasedTicket | null>(null);
  const [serverSplit, setServerSplit] = useState<SplitDetail | null>(null);

  if (!isOpen || !concert) return null;

  // Prices fixed by artists or organizers (fallback defaults if not passed)
  const priceStd = concert.pricing?.standard ?? 10000;
  const priceVip = concert.pricing?.vip ?? 25000;
  const priceVvip = concert.pricing?.vvip ?? 50000;

  const TIERS_CONFIG = [
    {
      tier: 'standard' as TicketTier,
      name: 'Billet Standard (Fosse / Gradin)',
      priceFCFA: priceStd,
      color: '#10b981',
      icon: Users,
      badge: 'Tarif Organisateur',
      perks: [
        'Accès général Pelouse ou Gradin',
        'Au cœur de la ferveur du public',
        'Accès buvettes & points de restauration',
      ],
    },
    {
      tier: 'vip' as TicketTier,
      name: 'Billet VIP (Tribune Privilège)',
      priceFCFA: priceVip,
      color: '#D4AF37',
      icon: Star,
      badge: 'Populaire',
      perks: [
        'Siège réservé et numéroté avec excellente visibilité',
        'Accès coupe-file prioritaire à l’entrée',
        '1 Boisson de bienvenue offerte au Bar VIP',
        'Vue panoramique sur la scène et les écrans géants',
      ],
    },
    {
      tier: 'vvip' as TicketTier,
      name: 'Pass VVIP Prestige + Backstage',
      priceFCFA: priceVvip,
      color: '#a855f7',
      icon: Crown,
      badge: 'Exclusif',
      perks: [
        'Accès complet aux loges & Backstage',
        'Rencontre & Photo exclusive avec l’artiste',
        'Espace Lounge privé avec Champagne & Cocktail',
        'Accès Tapis Rouge dédié & Pack Merch officiel offert',
      ],
    },
  ];

  const currentTierConfig = TIERS_CONFIG.find((t) => t.tier === selectedTier) || TIERS_CONFIG[1];
  const unitPriceFCFA = currentTierConfig.priceFCFA;
  const totalFCFA = unitPriceFCFA * quantity;

  const handleStartPayment = async () => {
    if (!buyerName.trim()) {
      alert('Veuillez entrer votre nom complet.');
      return;
    }
    if (!buyerPhone.trim()) {
      alert('Veuillez entrer votre numéro de téléphone pour la réception du billet.');
      return;
    }

    setStep('processing');

    try {
      // Real API Call to Backend: [App] -> [API Backend] -> [Base de données] -> [Stripe/PayPal 95/5] -> [Comptes créateurs]
      const res = await apiClient.processCheckout({
        type: 'ticket_purchase',
        creatorId: 'artist-oude-mill',
        amountFCFA: totalFCFA,
        paymentProvider: selectedMethod,
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        buyerEmail: buyerEmail.trim() || undefined,
        itemDescription: `${quantity}x ${currentTierConfig.name} - ${concert.title || concert.stadium}`,
        concert: {
          id: concert.id,
          title: concert.title || 'Concert BGla Mac Live',
          artistName: concert.artistName || 'Oude Mill',
          stadium: concert.stadium,
          city: concert.city,
          country: concert.country,
          date: concert.date,
          tier: selectedTier,
        },
      });

      if (res.ticket) {
        setConfirmedTicket(res.ticket);
        setServerSplit(res.split);
        onTicketPurchased(res.ticket);

        // Save to localStorage for instant local access
        try {
          const existing = JSON.parse(localStorage.getItem('bgla_mac_tickets') || '[]');
          localStorage.setItem('bgla_mac_tickets', JSON.stringify([res.ticket, ...existing]));
        } catch (e) {
          console.error(e);
        }
      }

      setStep('confirmed');
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Erreur lors du traitement: ' + (err?.message || 'Vérifiez votre connexion'));
      setStep('payment');
    }
  };

  const handleDownloadTicket = () => {
    if (!confirmedTicket) return;
    const textContent = `========================================
BILLET ÉLECTRONIQUE BGLA MAC
Événement : ${confirmedTicket.concertTitle}
Artiste : ${confirmedTicket.artistName}
Lieu : ${confirmedTicket.stadiumName} (${confirmedTicket.city}, ${confirmedTicket.country})
Date : ${confirmedTicket.concertDate}
----------------------------------------
Spectateur : ${confirmedTicket.buyerName}
Téléphone : ${confirmedTicket.buyerPhone}
Catégorie : ${confirmedTicket.categoryName} (${confirmedTicket.tier.toUpperCase()})
Tarif réglé : ${confirmedTicket.priceFCFA.toLocaleString('fr-FR')} FCFA
Moyen de paiement : ${confirmedTicket.paymentMethod.toUpperCase()}
Référence transaction : ${confirmedTicket.transactionRef}
Porte d’accès : ${confirmedTicket.gateNumber}
Emplacement : ${confirmedTicket.seatNumber}
Code QR Hash : ${confirmedTicket.qrHash}
========================================
Valable pour une seule entrée. Contrôlé par scanner à l'entrée.`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Billet_BGlaMac_${confirmedTicket.transactionRef}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="relative w-full max-w-xl bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#222222] bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-300 p-0.5 flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <div className="w-full h-full bg-[#101010] rounded-[10px] flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase font-['Syne',sans-serif]">
                  Billetterie BGla Mac
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Standard • VIP • VVIP
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {concert.stadium} • {concert.city} ({concert.date})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#222] hover:bg-[#333] text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* STEP 1: Select Tier (Standard, VIP, VVIP) */}
          {step === 'category' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Choisissez votre Catégorie de Billet</h3>
                <p className="text-xs text-zinc-400">
                  Tarifs officiels fixés par l’artiste ou l’organisateur en FCFA.
                </p>
              </div>

              <div className="space-y-2.5">
                {TIERS_CONFIG.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedTier === cat.tier;

                  return (
                    <div
                      key={cat.tier}
                      onClick={() => setSelectedTier(cat.tier)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#1b1b1b] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                          : 'bg-[#151515] border-[#242424] hover:border-[#383838]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              cat.tier === 'vvip'
                                ? 'bg-purple-500/20 text-purple-300'
                                : cat.tier === 'vip'
                                ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-white uppercase font-['Syne',sans-serif]">
                                {cat.name}
                              </h4>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                  cat.tier === 'vvip'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : cat.tier === 'vip'
                                    ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {cat.badge}
                              </span>
                            </div>
                            <div className="text-sm font-black text-white font-mono mt-0.5">
                              {cat.priceFCFA.toLocaleString('fr-FR')} <span className="text-xs text-[#D4AF37]">FCFA</span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                              : 'border-zinc-700 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Perks */}
                      <ul className="mt-2.5 pt-2 border-t border-[#222] text-[11px] text-zinc-400 space-y-1">
                        {cat.perks.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Quantity selector */}
              <div className="p-3 bg-[#161616] rounded-xl border border-[#262626] flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-bold">Nombre de billets :</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-[#222] hover:bg-[#333] text-white font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-sm font-extrabold text-white font-mono w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(8, quantity + 1))}
                    className="w-8 h-8 rounded-lg bg-[#222] hover:bg-[#333] text-white font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Total à payer</span>
                  <span className="text-lg font-black text-[#D4AF37] font-mono">
                    {totalFCFA.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold text-xs shadow-lg shadow-[#D4AF37]/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Buyer details & Payment method */}
          {step === 'details' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white">Vos Coordonnées & Paiement Mobile</h3>
                <p className="text-xs text-zinc-400">
                  Le billet avec QR code sera lié à ces informations pour le contrôle à l’entrée.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold">Nom et Prénom du Porteur *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Oumar Diallo"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-300 font-bold">Numéro de Téléphone (Mobile Money) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex : +223 76 12 34 56"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-[#181818] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-300 font-bold">Email (Optionnel)</label>
                    <input
                      type="email"
                      placeholder="Ex : oumar@gmail.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full bg-[#181818] border border-[#2c2c2c] rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Mobile Money methods */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-zinc-300 font-bold block">Sélectionnez le mode de paiement en ligne :</label>
                  <div className="space-y-2">
                    {PAYMENT_METHODS.map((m) => {
                      const isSelected = selectedMethod === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMethod(m.id)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#1c1c1c] border-[#D4AF37]'
                              : 'bg-[#151515] border-[#262626] hover:border-[#333]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{m.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                                  {m.badge}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-400 block">{m.desc}</span>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-zinc-700'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Split 95/5 transparency banner */}
              <div className="p-3 rounded-xl bg-[#161616] border border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="text-zinc-300 font-semibold">Garantie Split 95/5 BGla Mac</span>
                </div>
                <div className="text-[11px] font-mono flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">
                    95% Artiste ({Math.round(totalFCFA * 0.95).toLocaleString('fr-FR')} FCFA)
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">
                    5% Plateforme ({Math.round(totalFCFA * 0.05).toLocaleString('fr-FR')} FCFA)
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('category')}
                  className="px-4 py-2 rounded-xl bg-[#222] hover:bg-[#333] text-zinc-300 text-xs font-bold"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold text-xs shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Payer {totalFCFA.toLocaleString('fr-FR')} FCFA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Processing Payment simulation */}
          {step === 'processing' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin mx-auto" />
              <div>
                <h3 className="text-base font-black text-white font-['Syne',sans-serif]">
                  Paiement en ligne sécurisé...
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Communication avec la passerelle {selectedMethod.toUpperCase()} pour {totalFCFA.toLocaleString('fr-FR')} FCFA.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmed Ticket with QR Code */}
          {step === 'confirmed' && confirmedTicket && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <strong>Billet Confirmé & Payé avec succès !</strong>
                  <p className="text-[11px] text-emerald-400/80">
                    Présentez ce QR code à l'entrée du concert pour le contrôle d'accès.
                  </p>
                </div>
              </div>

              {/* Digital Pass Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-[#181818] to-[#121212] border-2 border-[#D4AF37]/60 shadow-2xl space-y-4">
                <div className="flex items-start justify-between border-b border-[#2a2a2a] pb-3">
                  <div>
                    <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block">
                      BGla Mac Pass Officiel
                    </span>
                    <h3 className="text-base font-black text-white font-['Syne',sans-serif]">
                      {confirmedTicket.concertTitle}
                    </h3>
                    <p className="text-xs text-zinc-400">{confirmedTicket.stadiumName} • {confirmedTicket.city}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      confirmedTicket.tier === 'vvip'
                        ? 'bg-purple-500 text-white'
                        : confirmedTicket.tier === 'vip'
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-emerald-500 text-black'
                    }`}
                  >
                    {confirmedTicket.tier.toUpperCase()}
                  </span>
                </div>

                {/* QR Code and Info */}
                <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
                  <div className="p-3 bg-[#101010] rounded-xl border border-[#333] shadow-inner shrink-0">
                    <QRCodeSVG
                      value={confirmedTicket.qrHash}
                      size={135}
                      fgColor={confirmedTicket.tier === 'vvip' ? '#c084fc' : '#D4AF37'}
                      bgColor="#101010"
                    />
                    <div className="text-[9px] font-mono text-zinc-500 text-center mt-1.5 truncate max-w-[135px]">
                      {confirmedTicket.transactionRef}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs flex-1 w-full">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-[#1c1c1c] p-2 rounded-lg">
                        <span className="text-[9px] text-zinc-500 block">Spectateur</span>
                        <strong className="text-white truncate block">{confirmedTicket.buyerName}</strong>
                      </div>
                      <div className="bg-[#1c1c1c] p-2 rounded-lg">
                        <span className="text-[9px] text-zinc-500 block">Porte d’Entrée</span>
                        <strong className="text-white truncate block">{confirmedTicket.gateNumber}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-[#1c1c1c] p-2 rounded-lg">
                        <span className="text-[9px] text-zinc-500 block">Emplacement</span>
                        <strong className="text-white truncate block">{confirmedTicket.seatNumber}</strong>
                      </div>
                      <div className="bg-[#1c1c1c] p-2 rounded-lg">
                        <span className="text-[9px] text-zinc-500 block">Montant Réglé</span>
                        <strong className="text-[#D4AF37] font-mono block">
                          {confirmedTicket.priceFCFA.toLocaleString('fr-FR')} FCFA
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadTicket}
                  className="flex-1 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333] text-white font-bold text-xs border border-[#383838] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#D4AF37]" />
                  <span>Télécharger le Billet (Fichier Pass)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold text-xs transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
