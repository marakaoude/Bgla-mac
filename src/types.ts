export type AspectRatio = '9:16' | '16:9';
export type Resolution = '720p' | '1080p';

export interface GenerationJob {
  id: string;
  operationName: string;
  status: 'starting' | 'rendering' | 'completed' | 'failed';
  prompt: string;
  photoUrl?: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  videoUrl?: string;
  error?: string;
  createdAt: number;
  stageMessage?: string;
  progressPercent: number;
  musicGenre?: string;
  cameraMovement?: string;
  cinematicFilter?: string;
  filterIntensity?: number;
}

export interface CinematicFilterOption {
  id: string;
  name: string;
  label: string;
  icon: string;
  badge: string;
  description: string;
  constraintPrompt: string;
  cssFilter: string;
  overlayType?: 'grain35mm' | 'vhsGlitch' | 'noirBlanc' | 'goldSahel' | 'tealOrange' | 'cyberpunk';
}

export interface MusicGenre {
  id: string;
  name: string;
  category: 'Rap / Urban' | 'Acoustic / Traditional' | 'Instrumental / Cinematic';
  tempo: string;
  description: string;
  crowdMood: string;
  lightingStyle: string;
  promptSnippet: string;
}

export interface StadiumPreset {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: string;
  vibe: string;
}

export interface CameraMovePreset {
  id: string;
  label: string;
  description: string;
  promptSnippet: string;
}

export interface StageFXPreset {
  id: string;
  label: string;
  icon: string;
  promptSnippet: string;
}

export type VideoFilterEffect =
  | 'none'
  | 'gold_sahel'
  | 'vhs_retro'
  | 'cyberpunk'
  | 'bass_shake'
  | 'strobe_flash'
  | 'cinema_35mm'
  | 'noir_blanc'
  | 'hologram'
  | 'glitch';

export interface TikTokTextOverlay {
  id: string;
  text: string;
  style: 'tiktok' | 'neon' | 'headline' | 'subtitles';
  position: 'top' | 'center' | 'bottom';
  color: string;
  bgColor?: string;
}

export interface TikTokComment {
  id: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  comment: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

export interface TikTokVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  artistName: string;
  artistHandle: string;
  artistAvatar: string;
  isVerified: boolean;
  description: string;
  tags: string[];
  musicTitle: string;
  musicAuthor: string;
  musicGenreId?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  filterEffect?: VideoFilterEffect;
  effectIntensity?: number;
  textOverlays?: TikTokTextOverlay[];
  stickers?: string[];
  category: 'pour-toi' | 'abonnements' | 'tendances';
  viewsCount?: string;
  speed?: number;
  createdAt?: string;
  comments?: TikTokComment[];
}

export type PaymentProvider =
  | 'wave'
  | 'orange_money'
  | 'mtn_momo'
  | 'moov_money'
  | 'sama_money'
  | 'card'
  | 'stripe_connect'
  | 'paypal';

export type TicketTier = 'standard' | 'vip' | 'vvip';

export interface SplitDetail {
  totalFCFA: number;
  creatorShareFCFA: number; // 95%
  platformFeeFCFA: number; // 5%
  creatorPercent: number;
  platformPercent: number;
  creatorShareEUR?: number;
  platformFeeEUR?: number;
}

export interface CreatorStripeConnect {
  accountId: string;
  status: 'connected' | 'pending' | 'restricted';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  currency: string;
  country: string;
}

export interface CreatorPayPal {
  merchantId: string;
  email: string;
  status: 'verified' | 'unverified';
}

export interface CreatorMobileMoney {
  provider: 'wave' | 'orange_money' | 'moov_money' | 'mtn_momo';
  phoneNumber: string;
  holderName: string;
}

export interface CreatorAccountData {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  email: string;
  phone: string;
  stripeConnect: CreatorStripeConnect;
  paypalAccount: CreatorPayPal;
  mobileMoney: CreatorMobileMoney;
  balanceFCFA: number; // Solde disponible
  totalGrossFCFA: number; // 100% volume
  totalNetCreatorFCFA: number; // 95% net reversé
  totalPlatformFeesFCFA: number; // 5% frais BGla Mac
  totalPayoutsPaidFCFA: number; // Total déjà viré
  subscription: {
    status: 'active' | 'pending' | 'expired';
    monthlyFeeFCFA: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    autoRenew: boolean;
    lastPaymentRef: string;
  };
}

export interface TransactionItem {
  id: string;
  type: 'ticket_purchase' | 'artist_subscription' | 'merch_purchase';
  creatorId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  amountGrossFCFA: number;
  amountGrossEUR: number;
  splitRule: '95_5';
  creatorShareFCFA: number;
  platformFeeFCFA: number;
  paymentProvider: PaymentProvider;
  providerTransactionId: string;
  status: 'succeeded' | 'processing' | 'refunded';
  itemDescription: string;
  createdAt: string;
}

export interface PayoutItem {
  id: string;
  creatorId: string;
  amountFCFA: number;
  amountEUR: number;
  method: 'stripe_connect' | 'paypal' | 'wave' | 'orange_money';
  destination: string;
  status: 'paid' | 'processing';
  reference: string;
  createdAt: string;
}

export interface TicketCategory {
  id: string;
  tier: TicketTier;
  name: string;
  priceFCFA: number;
  priceEUR: number;
  perks: string[];
  color: string;
  badge: string;
  quota: number;
  soldCount: number;
}

export interface ConcertEvent {
  id: string;
  title: string;
  artistName: string;
  artistAvatar?: string;
  stadium: string;
  city: string;
  country: string;
  date: string;
  time: string;
  status: string;
  soldOut: boolean;
  capacity: string;
  pricing: {
    standard: number;
    vip: number;
    vvip: number;
  };
  quotas: {
    standard: number;
    vip: number;
    vvip: number;
  };
  sold: {
    standard: number;
    vip: number;
    vvip: number;
  };
  highlights: string;
  bannerUrl?: string;
}

export interface PurchasedTicket {
  id: string;
  concertId: string;
  concertTitle: string;
  artistName: string;
  stadiumName: string;
  city: string;
  country: string;
  concertDate: string;
  concertTime?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  tier: TicketTier;
  categoryName: string;
  priceFCFA: number;
  paymentMethod: PaymentProvider;
  transactionRef: string;
  purchaseDate: string;
  seatNumber: string;
  gateNumber: string;
  qrHash: string;
  status: 'valid' | 'used' | 'cancelled';
  usedAt?: string;
  scannedBy?: string;
}

export interface ArtistProfile {
  id: string;
  name: string;
  tagline: string;
  genre: string;
  bio: string;
  avatar: string;
  coverImage: string;
  monthlyFeeFCFA: number; // 10 000 FCFA
  subscriptionStatus: 'active' | 'pending' | 'expired';
  subscriptionRenewsAt: string;
  subscriptionPlan: string;
  totalStreams: number;
  totalTicketSalesFCFA: number;
  totalTicketsSold: number;
}

export interface MerchItem {
  id: string;
  name: string;
  category: string;
  priceFCFA: number;
  priceEUR: number;
  image: string;
  badge?: string;
  description: string;
  sizes?: string[];
}

export interface ArtistTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  streams: number;
  releaseDate: string;
  genre: string;
  coverUrl: string;
  audioPreview?: string;
}
