import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Ticket,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  QrCode,
  Download,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Crown,
  Star,
  DollarSign,
} from 'lucide-react';
import { PurchasedTicket, ConcertEvent } from '../../types';
import { TicketBookingModal } from '../payment/TicketBookingModal';
import { QRCodeSVG } from '../payment/QRCodeSVG';
import { TicketScannerModal } from '../scanner/TicketScannerModal';
import { INITIAL_CONCERTS, PRE_SEEDED_TICKETS } from '../../data/mockData';

interface TourScreenProps {
  onSelectStadiumForVideo: (stadiumName: string) => void;
  onOpenScanner?: () => void;
}

export const TourScreen: React.FC<TourScreenProps> = ({
  onSelectStadiumForVideo,
  onOpenScanner,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dates' | 'my-tickets'>('dates');
  const [bookingConcert, setBookingConcert] = useState<ConcertEvent | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Stored tickets in state / localStorage
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>(() => {
    try {
      const saved = localStorage.getItem('bgla_mac_tickets');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PRE_SEEDED_TICKETS;
  });

  const handleTicketPurchased = (newTicket: PurchasedTicket) => {
    const updated = [newTicket, ...purchasedTickets];
    setPurchasedTickets(updated);
    try {
      localStorage.setItem('bgla_mac_tickets', JSON.stringify(updated));
    } catch {
      // fallback
    }
    setActiveSubTab('my-tickets');
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Banner Billetterie BGla Mac */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#171717] via-[#1a1811] to-[#171717] border border-[#2b281d] p-5 sm:p-7 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37] text-black uppercase tracking-wider">
                Programme BGla Mac
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Standard • VIP • VVIP
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Syne',sans-serif]">
              Concerts & Billetterie en Ligne
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl">
              Achetez vos billets avec paiement Mobile Money (Wave, Orange Money, Moov, MTN, Carte). Prix fixés directement par les artistes et organisateurs, avec billet numérique sécurisé et QR code unique.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onOpenScanner) onOpenScanner();
                else setIsScannerOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>Scanner d’Entrée (Contrôle d’Accès)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs: Concerts vs Mes Billets */}
      <div className="flex items-center justify-between border-b border-[#262626] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('dates')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'dates'
                ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-["Syne",sans-serif]'
                : 'text-zinc-400 hover:text-white hover:bg-[#1b1b1b]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Dates de Concerts ({INITIAL_CONCERTS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('my-tickets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'my-tickets'
                ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-["Syne",sans-serif]'
                : 'text-zinc-400 hover:text-white hover:bg-[#1b1b1b]'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Mes Billets QR Code ({purchasedTickets.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Billets cryptés anti-contrefaçon</span>
        </div>
      </div>

      {/* SUBTAB 1: DATES & BILLETTERIE */}
      {activeSubTab === 'dates' && (
        <div className="grid grid-cols-1 gap-4">
          {INITIAL_CONCERTS.map((concert) => (
            <div
              key={concert.id}
              className="p-5 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#333] transition-all space-y-4"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-[#D4AF37] font-['Syne',sans-serif]">
                      {concert.artistName}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <h3 className="text-base font-bold text-white">{concert.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {concert.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1 font-semibold text-zinc-200">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> {concert.stadium} ({concert.city}, {concert.country})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" /> {concert.date} ({concert.time})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-zinc-500" /> Jauge : {concert.capacity}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 pt-1 line-clamp-2">{concert.highlights}</p>
                </div>

                {/* Right button action */}
                <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => setBookingConcert(concert)}
                    className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#e0bc45] text-black font-extrabold text-xs shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 stroke-[2.5]" />
                    <span>Réserver mes Billets</span>
                  </button>
                </div>
              </div>

              {/* 3 Categories Pricing Cards (Standard, VIP, VVIP) */}
              <div className="pt-3 border-t border-[#202020] grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Standard */}
                <div
                  onClick={() => setBookingConcert(concert)}
                  className="p-3 rounded-xl bg-[#181818] border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-emerald-400 uppercase">Standard</span>
                    <span className="text-[10px] text-zinc-500">Fosse / Gradin</span>
                  </div>
                  <div className="text-base font-black text-white font-mono">
                    {concert.pricing.standard.toLocaleString('fr-FR')} <span className="text-xs text-[#D4AF37]">FCFA</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Accès général live</span>
                </div>

                {/* VIP */}
                <div
                  onClick={() => setBookingConcert(concert)}
                  className="p-3 rounded-xl bg-[#181818] border border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-[#D4AF37] uppercase flex items-center gap-1">
                      <Star className="w-3 h-3" /> VIP
                    </span>
                    <span className="text-[10px] text-[#D4AF37]/80">Siège + Coupe-file</span>
                  </div>
                  <div className="text-base font-black text-white font-mono">
                    {concert.pricing.vip.toLocaleString('fr-FR')} <span className="text-xs text-[#D4AF37]">FCFA</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Tribune assise numérotée</span>
                </div>

                {/* VVIP */}
                <div
                  onClick={() => setBookingConcert(concert)}
                  className="p-3 rounded-xl bg-[#181818] border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-purple-400 uppercase flex items-center gap-1">
                      <Crown className="w-3 h-3" /> VVIP
                    </span>
                    <span className="text-[10px] text-purple-400/80">Backstage & Rencontre</span>
                  </div>
                  <div className="text-base font-black text-white font-mono">
                    {concert.pricing.vvip.toLocaleString('fr-FR')} <span className="text-xs text-[#D4AF37]">FCFA</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">Cocktail lounge + Tapis rouge</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: MES BILLETS AVEC QR CODE */}
      {activeSubTab === 'my-tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Mes Billets Numériques</h2>
              <p className="text-xs text-zinc-400">
                Chaque billet dispose d'un QR code unique vérifiable instantanément aux guichets par le scanner BGla Mac.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchasedTickets.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#181818] to-[#121212] border-2 border-[#D4AF37]/40 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between border-b border-[#262626] pb-3">
                  <div>
                    <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block">
                      Billet Électronique BGla Mac
                    </span>
                    <h3 className="text-sm font-black text-white font-['Syne',sans-serif]">
                      {t.concertTitle}
                    </h3>
                    <p className="text-xs text-zinc-400">{t.stadiumName} • {t.city}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      t.status === 'used'
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                        : t.tier === 'vvip'
                        ? 'bg-purple-500 text-white'
                        : t.tier === 'vip'
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-emerald-500 text-black'
                    }`}
                  >
                    {t.status === 'used' ? 'Déjà Composté' : t.tier.toUpperCase()}
                  </span>
                </div>

                {/* QR Code section */}
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#0e0e0e] rounded-xl border border-[#2e2e2e] shrink-0">
                    <QRCodeSVG
                      value={t.qrHash}
                      size={110}
                      fgColor={t.tier === 'vvip' ? '#c084fc' : '#D4AF37'}
                      bgColor="#0e0e0e"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs flex-1">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Titulaire :</span>
                      <strong className="text-white text-xs block">{t.buyerName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Porte d’Accès :</span>
                      <span className="text-zinc-200 block">{t.gateNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Place / Emplacement :</span>
                      <span className="text-zinc-200 block">{t.seatNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Tarif Réglé :</span>
                      <span className="text-[#D4AF37] font-mono font-bold">
                        {t.priceFCFA.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-mono">{t.transactionRef}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Billet Sécurisé
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Booking Modal */}
      <TicketBookingModal
        isOpen={Boolean(bookingConcert)}
        onClose={() => setBookingConcert(null)}
        concert={bookingConcert}
        onTicketPurchased={handleTicketPurchased}
      />

      {/* Entry Scanner Modal */}
      <TicketScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
};
