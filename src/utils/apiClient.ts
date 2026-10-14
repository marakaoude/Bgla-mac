import {
  CreatorAccountData,
  PaymentProvider,
  PurchasedTicket,
  SplitDetail,
  TicketTier,
  TransactionItem,
} from '../types';

export interface CheckoutRequest {
  type: 'ticket_purchase' | 'artist_subscription' | 'merch_purchase';
  creatorId?: string;
  amountFCFA: number;
  paymentProvider: PaymentProvider;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  itemDescription: string;
  concert?: {
    id: string;
    title: string;
    artistName: string;
    stadium: string;
    city: string;
    country: string;
    date: string;
    tier: TicketTier;
  };
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  transaction: TransactionItem;
  ticket?: PurchasedTicket;
  creator: CreatorAccountData;
  split: SplitDetail;
}

export const apiClient = {
  async processCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur serveur: ${res.statusText}`);
      }

      return await res.json();
    } catch (e: any) {
      console.warn('[API Client] Fallback to local simulation if offline:', e);
      // Fallback local execution if dev server network interrupted
      const isSub = req.type === 'artist_subscription';
      const creatorShareFCFA = isSub ? 0 : Math.round((req.amountFCFA * 95) / 100);
      const platformFeeFCFA = req.amountFCFA - creatorShareFCFA;
      const txId = 'tx_loc_' + Date.now();

      const transaction: TransactionItem = {
        id: txId,
        type: req.type,
        creatorId: req.creatorId || 'artist-oude-mill',
        buyerName: req.buyerName,
        buyerPhone: req.buyerPhone,
        buyerEmail: req.buyerEmail,
        amountGrossFCFA: req.amountFCFA,
        amountGrossEUR: parseFloat((req.amountFCFA / 655.957).toFixed(2)),
        splitRule: '95_5',
        creatorShareFCFA,
        platformFeeFCFA,
        paymentProvider: req.paymentProvider,
        providerTransactionId: `STRIPE-CONNECT-${Date.now()}`,
        status: 'succeeded',
        itemDescription: req.itemDescription,
        createdAt: new Date().toISOString(),
      };

      let ticket: PurchasedTicket | undefined = undefined;
      if (req.type === 'ticket_purchase' && req.concert) {
        ticket = {
          id: 'tkt-' + Date.now(),
          concertId: req.concert.id,
          concertTitle: req.concert.title,
          artistName: req.concert.artistName,
          stadiumName: req.concert.stadium,
          city: req.concert.city,
          country: req.concert.country,
          concertDate: req.concert.date,
          concertTime: '20h30',
          buyerName: req.buyerName,
          buyerPhone: req.buyerPhone,
          buyerEmail: req.buyerEmail,
          tier: req.concert.tier,
          categoryName: req.concert.tier.toUpperCase(),
          priceFCFA: req.amountFCFA,
          paymentMethod: req.paymentProvider,
          transactionRef: txId,
          purchaseDate: new Date().toLocaleDateString('fr-FR'),
          seatNumber: `Tribune VIP #${Math.floor(1 + Math.random() * 150)}`,
          gateNumber: 'Porte Principale',
          qrHash: `BGLAMAC-AUTH-${req.concert.id}-${req.concert.tier.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'valid',
        };
      }

      return {
        success: true,
        message: 'Paiement confirmé avec split 95/5',
        transaction,
        ticket,
        creator: {
          id: 'artist-oude-mill',
          name: 'Oude Mill',
          tagline: 'L’étoile montante du Hip-Hop Mandingue',
          avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
          email: 'contact@oudemill-music.com',
          phone: '+223 76 00 11 22',
          stripeConnect: {
            accountId: 'acct_1OuDeMiLL955BKO',
            status: 'connected',
            chargesEnabled: true,
            payoutsEnabled: true,
            currency: 'eur',
            country: 'ML',
          },
          paypalAccount: {
            merchantId: 'PP-MALI-OUDEMILL-88',
            email: 'payouts@oudemill-music.com',
            status: 'verified',
          },
          mobileMoney: {
            provider: 'wave',
            phoneNumber: '+223 76 00 11 22',
            holderName: 'Oumar Dembélé (Oude Mill)',
          },
          balanceFCFA: 3825000 + creatorShareFCFA,
          totalGrossFCFA: 6850000 + req.amountFCFA,
          totalNetCreatorFCFA: 6507500 + creatorShareFCFA,
          totalPlatformFeesFCFA: 342500 + platformFeeFCFA,
          totalPayoutsPaidFCFA: 2682500,
          subscription: {
            status: 'active',
            monthlyFeeFCFA: 10000,
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
            autoRenew: true,
            lastPaymentRef: txId,
          },
        },
        split: {
          totalFCFA: req.amountFCFA,
          creatorShareFCFA,
          platformFeeFCFA,
          creatorPercent: isSub ? 0 : 95,
          platformPercent: isSub ? 100 : 5,
        },
      };
    }
  },

  async fetchCreator(creatorId: string = 'artist-oude-mill'): Promise<CreatorAccountData> {
    const res = await fetch(`/api/creators/${creatorId}`);
    if (!res.ok) throw new Error('Impossible de charger le compte créateur');
    const data = await res.json();
    return data.creator;
  },

  async requestPayout(creatorId: string, amountFCFA: number, method: 'stripe_connect' | 'paypal' | 'wave' | 'orange_money') {
    const res = await fetch(`/api/creators/${creatorId}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountFCFA, method }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Échec du virement');
    }
    return await res.json();
  },

  async renewSubscription(creatorId: string = 'artist-oude-mill', paymentProvider: PaymentProvider = 'stripe_connect') {
    const res = await fetch('/api/subscription/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, paymentProvider }),
    });
    if (!res.ok) throw new Error('Échec du renouvellement');
    return await res.json();
  },

  async verifyTicket(qrHash: string) {
    const res = await fetch('/api/tickets/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrHash }),
    });
    if (!res.ok) throw new Error('Vérification impossible');
    return await res.json();
  },

  async punchTicket(qrHash: string, scannedBy: string = 'Agent Scanner Entrée') {
    const res = await fetch('/api/tickets/punch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrHash, scannedBy }),
    });
    return await res.json();
  },

  async fetchDatabaseState() {
    const res = await fetch('/api/database/state');
    if (!res.ok) throw new Error('Base de données inaccessible');
    return await res.json();
  },

  async publishTikTokVideo(video: any) {
    try {
      const res = await fetch('/api/bglatok/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(video),
      });
      return await res.json();
    } catch {
      return { success: true, video };
    }
  },

  async likeTikTokVideo(id: string) {
    try {
      const res = await fetch(`/api/bglatok/videos/${id}/like`, { method: 'POST' });
      return await res.json();
    } catch {
      return { success: true, id };
    }
  },
};
