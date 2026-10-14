import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Smartphone,
  CreditCard,
  DollarSign,
  ArrowRight,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Send,
  Zap,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { CreatorAccountData, PaymentProvider, TransactionItem } from '../../types';

export const ArchitectureFlowScreen: React.FC = () => {
  const [selectedGateway, setSelectedGateway] = useState<PaymentProvider>('stripe_connect');
  const [testAmountFCFA, setTestAmountFCFA] = useState<number>(50000); // 50 000 FCFA (VVIP)
  const [buyerName, setBuyerName] = useState<string>('Amadou Diallo');
  const [buyerPhone, setBuyerPhone] = useState<string>('+223 76 99 88 77');

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [apiLogs, setApiLogs] = useState<string[]>([
    '[INIT] Architecture BGla Mac connectée : Express Backend + Base de données active',
    '[ROUTING] Split 95/5 prêt : 95% Artiste / 5% Commission Plateforme',
  ]);

  const [dbState, setDbState] = useState<{
    stats: any;
    creator: CreatorAccountData | null;
    recentTransactions: TransactionItem[];
  }>({
    stats: null,
    creator: null,
    recentTransactions: [],
  });

  const [lastSplitResult, setLastSplitResult] = useState<{
    totalFCFA: number;
    creatorShareFCFA: number;
    platformFeeFCFA: number;
    providerTransactionId: string;
    ticketHash: string;
  } | null>(null);

  // Load real state from server API
  const refreshDbState = async () => {
    try {
      const data = await apiClient.fetchDatabaseState();
      setDbState({
        stats: data.stats,
        creator: data.creators['artist-oude-mill'] || null,
        recentTransactions: data.recentTransactions || [],
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshDbState();
    const interval = setInterval(refreshDbState, 8000);
    return () => clearInterval(interval);
  }, []);

  // Split calculations
  const creatorShareCalc = Math.round((testAmountFCFA * 95) / 100);
  const platformFeeCalc = testAmountFCFA - creatorShareCalc;
  const eurEquivalent = (testAmountFCFA / 655.957).toFixed(2);
  const creatorEur = (creatorShareCalc / 655.957).toFixed(2);
  const platformEur = (platformFeeCalc / 655.957).toFixed(2);

  // Trigger full pipeline simulation across the 5 nodes
  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);

    const addLog = (msg: string) => {
      setApiLogs((prev) => [msg, ...prev.slice(0, 8)]);
    };

    addLog(`[App Mobile/Web] Envoi requête de paiement : ${testAmountFCFA.toLocaleString('fr-FR')} FCFA via ${selectedGateway.toUpperCase()}`);

    // Step 1: App Mobile/Web -> API Backend
    setTimeout(async () => {
      setActiveStep(2);
      addLog(`[API Backend] Réception POST /api/payments/checkout | Calcul du split 95/5`);

      // Step 2: API Backend -> Base de données
      setTimeout(async () => {
        setActiveStep(3);
        addLog(`[Base de données] Vérification intégrité, attribution quota et sécurisation ticket anti-doublon`);

        // Step 3: Gateway Stripe Connect / PayPal / Mobile Money
        setTimeout(async () => {
          setActiveStep(4);
          addLog(`[${selectedGateway === 'stripe_connect' ? 'Stripe Connect' : selectedGateway === 'paypal' ? 'PayPal Partner' : 'Mobile Money'}] Transfert 95% (${creatorShareCalc.toLocaleString('fr-FR')} FCFA) vers destination créateur`);

          try {
            // Actual Real call to server endpoint
            const res = await apiClient.processCheckout({
              type: 'ticket_purchase',
              creatorId: 'artist-oude-mill',
              amountFCFA: testAmountFCFA,
              paymentProvider: selectedGateway,
              buyerName,
              buyerPhone,
              itemDescription: `Simulation Billet Live (${selectedGateway})`,
              concert: {
                id: 'concert-bko-26mars',
                title: 'Grand Concert Triomphal - World Tour Live',
                artistName: 'Oude Mill',
                stadium: 'Stade du 26-Mars',
                city: 'Bamako',
                country: 'Mali 🇲🇱',
                date: '28 Décembre 2026',
                tier: testAmountFCFA >= 45000 ? 'vvip' : testAmountFCFA >= 20000 ? 'vip' : 'standard',
              },
            });

            // Step 4: Compte Créateur
            setTimeout(() => {
              setActiveStep(5);
              addLog(`[Comptes créateurs] Solde crédité avec succès ! +${res.split.creatorShareFCFA.toLocaleString('fr-FR')} FCFA dispo virement`);

              setLastSplitResult({
                totalFCFA: res.split.totalFCFA,
                creatorShareFCFA: res.split.creatorShareFCFA,
                platformFeeFCFA: res.split.platformFeeFCFA,
                providerTransactionId: res.transaction.providerTransactionId,
                ticketHash: res.ticket?.qrHash || 'BGLAMAC-AUTH-VERIFIED',
              });

              refreshDbState();

              setTimeout(() => {
                setIsSimulating(false);
                setActiveStep(0);
              }, 2500);
            }, 900);
          } catch (err: any) {
            addLog(`[Erreur] ${err?.message || 'Erreur traitement'}`);
            setIsSimulating(false);
            setActiveStep(0);
          }
        }, 900);
      }, 900);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#181818] via-[#121212] to-[#0d0d0d] border border-[#2a2a2a] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Architecture Financière & Technique BGla Mac
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-['Syne',sans-serif]">
              Flux de Paiement & Split 95/5 Automatisé
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Exécution temps réel du flux officiel : application mobile/web vers l'API Backend, persistance en base de données, routage Stripe Connect / PayPal / Mobile Money avec reversement direct de <span className="text-[#D4AF37] font-bold">95% aux créateurs</span> et <span className="text-zinc-300 font-bold">5% de frais de plateforme</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshDbState}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#222] hover:bg-[#2c2c2c] border border-[#333] text-zinc-300 hover:text-white text-xs font-bold transition-all shrink-0 self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
            Actualiser Données Live
          </button>
        </div>
      </div>

      {/* ========================================================
          VISUAL ARCHITECTURE PIPELINE (The User's Diagram Rendered)
          [App Mobile/Web] -> [API Backend] -> [Base de données]
                                   ↓
                         [Stripe Connect / PayPal]
                         (paiements + split 95/5)
                                   ↓
                         [Comptes créateurs]
          ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-[#262626] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222] pb-4">
          <div>
            <h2 className="text-lg font-black text-white uppercase font-['Syne',sans-serif] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              Diagramme Architectural Actif
            </h2>
            <p className="text-xs text-zinc-400">
              Visualisez le trajet de chaque centime et chaque donnée d'une transaction.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Backend Express & DB Connectés
          </div>
        </div>

        {/* The 5 Interactive Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Node 1: App Mobile/Web */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-300 relative ${
              activeStep === 1
                ? 'bg-[#1e1b12] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#181818] border-[#2a2a2a] hover:border-[#383838]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 uppercase">
                Étape 1
              </span>
              <Smartphone className={`w-5 h-5 ${activeStep === 1 ? 'text-[#D4AF37]' : 'text-zinc-500'}`} />
            </div>
            <h3 className="text-base font-bold text-white font-['Syne',sans-serif] mb-1">
              [App Mobile / Web]
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Interface Android PWA & Web réactive. Sélection du billet (Std, VIP, VVIP) ou abonnement, capture sécurisée des coordonnées client.
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-300">
              Payload: {testAmountFCFA.toLocaleString('fr-FR')} FCFA ({selectedGateway})
            </div>
          </div>

          {/* Node 2: API Backend */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-300 relative ${
              activeStep === 2
                ? 'bg-[#1e1b12] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#181818] border-[#2a2a2a] hover:border-[#383838]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 uppercase">
                Étape 2
              </span>
              <Server className={`w-5 h-5 ${activeStep === 2 ? 'text-[#D4AF37]' : 'text-zinc-500'}`} />
            </div>
            <h3 className="text-base font-bold text-white font-['Syne',sans-serif] mb-1">
              [API Backend]
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Routes Express (<code className="text-[#D4AF37]">/api/payments/*</code>). Validation serveur, calcul certifié du split 95/5 et orchestration.
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-300 space-y-1">
              <div>Rule: split_95_5_standard</div>
              <div className="text-emerald-400">95% = {creatorShareCalc.toLocaleString('fr-FR')} FCFA</div>
              <div className="text-amber-400">5% = {platformFeeCalc.toLocaleString('fr-FR')} FCFA</div>
            </div>
          </div>

          {/* Node 3: Base de données */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-300 relative ${
              activeStep === 3
                ? 'bg-[#1e1b12] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#181818] border-[#2a2a2a] hover:border-[#383838]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 uppercase">
                Étape 3
              </span>
              <Database className={`w-5 h-5 ${activeStep === 3 ? 'text-[#D4AF37]' : 'text-zinc-500'}`} />
            </div>
            <h3 className="text-base font-bold text-white font-['Syne',sans-serif] mb-1">
              [Base de données]
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Stockage persistant (<code className="text-zinc-300">bgla_mac_db.json</code>). Registre des transactions, quotas de billets, hash QR unique et anti-doublon.
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-300 flex justify-between">
              <span>Billets: {dbState.stats?.totalTickets || 0}</span>
              <span>Tx: {dbState.stats?.totalTransactions || 0}</span>
            </div>
          </div>
        </div>

        {/* Downward Routing Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#222]">
          {/* Node 4: Stripe Connect / PayPal (Split 95/5) */}
          <div
            className={`p-6 rounded-2xl border transition-all duration-300 relative ${
              activeStep === 4
                ? 'bg-[#1e1b12] border-[#D4AF37] shadow-xl shadow-[#D4AF37]/20 scale-[1.02]'
                : 'bg-[#181818] border-[#2a2a2a] hover:border-[#383838]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase">
                Étape 4 : Passerelle Paiement & Split
              </span>
              <CreditCard className={`w-5 h-5 ${activeStep === 4 ? 'text-[#D4AF37]' : 'text-purple-400'}`} />
            </div>
            <h3 className="text-lg font-bold text-white font-['Syne',sans-serif] mb-1">
              [Stripe Connect / PayPal / Mobile Money]
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Règlement carte bancaire internationale via Stripe Connect (compte connecté express de l'artiste) ou PayPal Payouts, avec reversement automatisé du split 95/5.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/20">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Part Créateur (95%)</div>
                <div className="text-base font-extrabold text-white mt-0.5 font-['Syne',sans-serif]">
                  {creatorShareCalc.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-[10px] text-zinc-400">≈ {creatorEur} EUR</div>
              </div>
              <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20">
                <div className="text-[10px] uppercase font-bold text-amber-400">Frais Plateforme (5%)</div>
                <div className="text-base font-extrabold text-white mt-0.5 font-['Syne',sans-serif]">
                  {platformFeeCalc.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-[10px] text-zinc-400">≈ {platformEur} EUR</div>
              </div>
            </div>
          </div>

          {/* Node 5: Comptes créateurs */}
          <div
            className={`p-6 rounded-2xl border transition-all duration-300 relative ${
              activeStep === 5
                ? 'bg-[#1e1b12] border-emerald-500 shadow-xl shadow-emerald-500/20 scale-[1.02]'
                : 'bg-[#181818] border-[#2a2a2a] hover:border-[#383838]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                Étape 5 : Réception Créateur
              </span>
              <DollarSign className={`w-5 h-5 ${activeStep === 5 ? 'text-emerald-400' : 'text-zinc-500'}`} />
            </div>
            <h3 className="text-lg font-bold text-white font-['Syne',sans-serif] mb-1">
              [Comptes créateurs]
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              L'artiste ({dbState.creator?.name || 'Oude Mill'}) reçoit immédiatement ses 95% nets sur son compte Stripe Connect (<code className="text-zinc-300">{dbState.creator?.stripeConnect.accountId || 'acct_1OuDeMiLL955BKO'}</code>), PayPal ou son portefeuille Mobile Money.
            </p>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-emerald-400 uppercase font-bold">Solde Disponible Créateur</div>
                <div className="text-lg font-black text-white font-['Syne',sans-serif]">
                  {dbState.creator?.balanceFCFA?.toLocaleString('fr-FR') || '3 825 000'} FCFA
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Prêt à Virer
                </span>
                <div className="text-[10px] text-zinc-400 mt-0.5">Virement instantané</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SIMULATEUR DE TRANSACTION LIVE & LOGS DU SERVEUR
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#141414] border border-[#262626] space-y-5">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <h3 className="text-base font-bold text-white font-['Syne',sans-serif]">
              Simulateur de Paiement 95/5
            </h3>
            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
              Test Réel via Backend API
            </span>
          </div>

          {/* Amount selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              Montant du Billet / Transaction (FCFA)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTestAmountFCFA(10000)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  testAmountFCFA === 10000
                    ? 'bg-[#D4AF37] text-black font-extrabold'
                    : 'bg-[#1c1c1c] text-zinc-400 hover:text-white border border-[#2c2c2c]'
                }`}
              >
                10k Standard
              </button>
              <button
                type="button"
                onClick={() => setTestAmountFCFA(25000)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  testAmountFCFA === 25000
                    ? 'bg-[#D4AF37] text-black font-extrabold'
                    : 'bg-[#1c1c1c] text-zinc-400 hover:text-white border border-[#2c2c2c]'
                }`}
              >
                25k VIP
              </button>
              <button
                type="button"
                onClick={() => setTestAmountFCFA(50000)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  testAmountFCFA === 50000
                    ? 'bg-[#D4AF37] text-black font-extrabold'
                    : 'bg-[#1c1c1c] text-zinc-400 hover:text-white border border-[#2c2c2c]'
                }`}
              >
                50k VVIP
              </button>
            </div>
            <input
              type="number"
              value={testAmountFCFA}
              onChange={(e) => setTestAmountFCFA(Math.max(1000, Number(e.target.value)))}
              className="w-full mt-2 px-3 py-2 rounded-xl bg-[#1c1c1c] border border-[#2c2c2c] text-white text-sm focus:border-[#D4AF37] focus:outline-none"
              placeholder="Montant personnalisé en FCFA"
            />
          </div>

          {/* Payment gateway selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              Passerelle de Paiement
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedGateway('stripe_connect')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedGateway === 'stripe_connect'
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-bold'
                    : 'bg-[#1c1c1c] border-[#2c2c2c] text-zinc-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Stripe Connect</span>
                  <span className="text-[10px] text-[#D4AF37]">95/5</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Carte Visa/Mastercard</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway('paypal')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedGateway === 'paypal'
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-bold'
                    : 'bg-[#1c1c1c] border-[#2c2c2c] text-zinc-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>PayPal</span>
                  <span className="text-[10px] text-[#D4AF37]">95/5</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Marketplace Payouts</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway('wave')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedGateway === 'wave'
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-bold'
                    : 'bg-[#1c1c1c] border-[#2c2c2c] text-zinc-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Wave Mali</span>
                  <span className="text-[10px] text-cyan-400">Direct</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Mobile Money instantané</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway('orange_money')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedGateway === 'orange_money'
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-bold'
                    : 'bg-[#1c1c1c] border-[#2c2c2c] text-zinc-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Orange Money</span>
                  <span className="text-[10px] text-orange-400">*144#</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Mali & Sous-région</div>
              </button>
            </div>
          </div>

          {/* Buyer inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400">Nom du payeur</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#1c1c1c] border border-[#2c2c2c] text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-400">Téléphone</label>
              <input
                type="text"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#1c1c1c] border border-[#2c2c2c] text-white text-xs"
              />
            </div>
          </div>

          {/* Trigger button */}
          <button
            type="button"
            disabled={isSimulating}
            onClick={runSimulation}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSimulating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.01]'
            }`}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-zinc-500" />
                Traitement en cours (Étape {activeStep}/5)...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Lancer le Flux Réel (Split 95/5)
              </>
            )}
          </button>
        </div>

        {/* Live Logs & Split Proof Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Last Split Result Card */}
          {lastSplitResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#161616] to-[#121212] border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Transaction Certifiée en Base de Données
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {lastSplitResult.providerTransactionId}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-500/20 text-xs">
                <div>
                  <div className="text-[10px] text-zinc-400">Total Encaissé</div>
                  <div className="font-extrabold text-white text-sm">
                    {lastSplitResult.totalFCFA.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-400">Artiste (95%)</div>
                  <div className="font-extrabold text-emerald-300 text-sm">
                    +{lastSplitResult.creatorShareFCFA.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-400">Plateforme (5%)</div>
                  <div className="font-extrabold text-amber-300 text-sm">
                    +{lastSplitResult.platformFeeFCFA.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Console Output */}
          <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-[#222] font-mono text-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222]">
              <span className="text-[11px] text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Journal des Événements Serveur (Live API Stream)
              </span>
              <span className="text-[10px] text-zinc-500">Node Express Port 3000</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {apiLogs.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed text-[11px] ${
                    index === 0
                      ? 'text-[#D4AF37] font-semibold'
                      : log.includes('Erreur')
                      ? 'text-red-400'
                      : 'text-zinc-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Global Platform Counters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[10px] text-zinc-400 font-bold uppercase">Volume Total Brut</div>
              <div className="text-base font-extrabold text-white mt-1 font-['Syne',sans-serif]">
                {dbState.stats?.totalGrossFCFA?.toLocaleString('fr-FR') || '6 850 000'} FCFA
              </div>
              <div className="text-[10px] text-zinc-500">100% encaissé</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Reversé Créateurs</div>
              <div className="text-base font-extrabold text-emerald-400 mt-1 font-['Syne',sans-serif]">
                {dbState.stats?.totalCreatorSharesFCFA?.toLocaleString('fr-FR') || '6 507 500'} FCFA
              </div>
              <div className="text-[10px] text-emerald-600">95% net reversé</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[10px] text-amber-400 font-bold uppercase">Commission BGla Mac</div>
              <div className="text-base font-extrabold text-amber-400 mt-1 font-['Syne',sans-serif]">
                {dbState.stats?.totalPlatformFeesFCFA?.toLocaleString('fr-FR') || '342 500'} FCFA
              </div>
              <div className="text-[10px] text-amber-600">5% plateforme</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
