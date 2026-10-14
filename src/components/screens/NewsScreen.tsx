import React, { useState } from 'react';
import {
  Newspaper,
  Calendar,
  Tag,
  Heart,
  Share2,
  MessageCircle,
  Sparkles,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  category: 'Musique' | 'Clips' | 'Concerts & Stades' | 'Coulisses & Presse';
  date: string;
  readTime: string;
  summary: string;
  content: string[];
  imageUrl?: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  officialAuthor: string;
  highlightQuote?: string;
}

const OFFICIAL_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Sortie confirmée de l’album « Or du Sahel » : 16 titres inédits et featurings internationaux',
    category: 'Musique',
    date: '12 Octobre 2026',
    readTime: '3 min',
    summary: 'Oude Mill a officiellement révélé la tracklist et la date de sortie de son opus majeur. Une symbiose musicale entre les accords de la kora, les rimes percutantes et la trap 808.',
    content: [
      'Après deux ans de travail acharné entre les studios de Bamako, Paris et Atlanta, Oude Mill annonce la sortie mondiale de son nouvel album intitulé « Or du Sahel ».',
      'Ce projet comprend 16 morceaux soigneusement composés, mêlant la tradition mandingue et le rap moderne. Plusieurs collaborations prestigieuses seront dévoilées dans les prochains jours.',
      '« Cet album raconte notre histoire, notre dignité et notre force. Nous portons haut la voix du Mali et de toute l’Afrique », a déclaré Oude Mill lors de son allocution en direct.',
    ],
    tags: ['Album', 'OrDuSahel', 'AfroRap', 'Bamako'],
    likes: 12430,
    commentsCount: 842,
    officialAuthor: 'Management Oude Mill Officiel',
    highlightQuote: '« Cet album est un hommage à notre terre, à nos racines et à notre jeunesse. »',
  },
  {
    id: 'n2',
    title: 'Stade du 26-Mars : 65 000 billets écoulés en moins de 48 heures, un record historique !',
    category: 'Concerts & Stades',
    date: '05 Octobre 2026',
    readTime: '2 min',
    summary: 'La billetterie pour le concert de retour au Mali le 28 décembre 2026 affiche désormais complet. Les organisateurs prévoient une scénographie monumentale.',
    content: [
      'La ferveur populaire a dépassé toutes les prévisions. L’intégralité des 65 000 places pour le concert au Stade du 26-Mars à Bamako a trouvé preneur en un temps record.',
      'La scène centrale sera équipée d’un écran circulaire géant à 360 degrés de 80 mètres de long, d’un système d’éclairage laser haute puissance et d’une pyrotechnie synchronisée.',
      'Pour les fans n’ayant pas pu obtenir de billet, le concert sera rediffusé en direct et en haute définition 4K à travers l’application officielle.',
    ],
    tags: ['SoldOut', 'Stade26Mars', 'BamakoTour', 'ConcertGeant'],
    likes: 21850,
    commentsCount: 1530,
    officialAuthor: 'Production Live Stadium',
    highlightQuote: '« 65 000 mercis ! Rendez-vous le 28 décembre pour écrire l’histoire ensemble. »',
  },
  {
    id: 'n3',
    title: 'Coulisses du tournage à Paris : Un clip à grand spectacle sur les toits de la capitale',
    category: 'Clips',
    date: '28 Septembre 2026',
    readTime: '3 min',
    summary: 'Les caméras de Sahel Motion et d’une équipe internationale ont suivi Oude Mill pour la réalisation visuelle du futur single avec des prises de vue vertigineuses.',
    content: [
      'Pendant trois nuits consécutives, les équipes ont investi les toits emblématiques de Paris pour capturer des séquences cinématographiques exceptionnelles.',
      'Oude Mill y apparaît dans une tenue streetwear d’exception brodée de motifs traditionnels maliens dorés, sous une pluie battante d’effets de lumière et de drones.',
      'Le clip sera disponible en exclusivité sur l’application dans la section Clips avant sa diffusion mondiale sur YouTube.',
    ],
    tags: ['NouveauClip', 'Paris', 'SahelMotion', 'Cinematographie'],
    likes: 9840,
    commentsCount: 420,
    officialAuthor: 'Direction Artistique Oude Mill',
  },
  {
    id: 'n4',
    title: 'Oude Mill sacré « Meilleur Artiste Panafricain » aux African Music Awards à Lagos',
    category: 'Coulisses & Presse',
    date: '14 Septembre 2026',
    readTime: '2 min',
    summary: 'Une consécration majeure pour la musique malienne. Oude Mill a reçu le trophée d’or devant un parterre de légendes de l’industrie musicale.',
    content: [
      'Réuni à Lagos devant les plus grands acteurs culturels du continent, le jury a salué la virtuosité et l’impact culturel d’Oude Mill, qui a su porter le hip-hop mandingue au sommet mondial.',
      'L’artiste a interprété un medley émouvant de « Bamako By Night » et « Kora & Diamants » avant de recevoir son trophée sous les acclamations du public.',
    ],
    tags: ['AfricanMusicAwards', 'TrophéeOr', 'Lagos', 'MaliPower'],
    likes: 18900,
    commentsCount: 970,
    officialAuthor: 'Presse Internationale',
  },
  {
    id: 'n5',
    title: 'Studio Vidéo Veo 3.1 : Créez vos propres vidéos de concert avec vos photos',
    category: 'Musique',
    date: '02 Septembre 2026',
    readTime: '2 min',
    summary: 'Grâce au partenariat technologique avec Google Veo 3.1 Fast, chaque fan peut transformer les photos d’Oude Mill en vidéos de concert en stade ultra-réalistes.',
    content: [
      'L’application Oude Mill Officiel intègre un studio cinématique exclusif. Choisissez une photo, sélectionnez le genre musical (Afro-Rap, Acoustique, Instrumental 808) et ajustez le volume de la clameur de la foule.',
      'Le modèle d’intelligence artificielle génère une vidéo fluide en 4K avec fidélité faciale à 100% et mise en scène de stade grandeur nature.',
    ],
    tags: ['StudioVeo', 'GoogleVeo', 'ConcertIA', 'FansExperience'],
    likes: 14200,
    commentsCount: 650,
    officialAuthor: 'Équipe Tech Oude Mill',
  },
];

type CategoryFilter = 'Toutes' | 'Musique' | 'Clips' | 'Concerts & Stades' | 'Coulisses & Presse';

export const NewsScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Toutes');
  const [likesState, setLikesState] = useState<Record<string, number>>(
    OFFICIAL_NEWS.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.likes }), {})
  );
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: CategoryFilter[] = [
    'Toutes',
    'Musique',
    'Clips',
    'Concerts & Stades',
    'Coulisses & Presse',
  ];

  const filteredNews =
    selectedCategory === 'Toutes'
      ? OFFICIAL_NEWS
      : OFFICIAL_NEWS.filter((n) => n.category === selectedCategory);

  const handleToggleLike = (id: string) => {
    const isLiked = likedArticles[id];
    setLikedArticles((prev) => ({ ...prev, [id]: !isLiked }));
    setLikesState((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (isLiked ? -1 : 1),
    }));
  };

  const handleShare = (id: string, title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Actualité Oude Mill Officiel: ${title}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* News Banner */}
      <div className="relative rounded-[16px] overflow-hidden bg-gradient-to-r from-[#181818] via-[#231d13] to-[#151515] border border-[#D4AF37]/35 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Fil d’Actualités Officiel • Oude Mill</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
              TOUTES LES ACTUALITÉS EN DIRECT
            </h2>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Suis les annonces officielles, les dates de sorties, les coulisses de tournage, les partenariats mondiaux et les interviews exclusives d’Oude Mill.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="p-3.5 rounded-[16px] bg-[#1D1D1D] border border-[#D4AF37]/25 text-center">
              <span className="text-xl font-black text-[#D4AF37] font-mono block">En Direct</span>
              <span className="text-[11px] text-zinc-400 font-medium">Flux Certifié</span>
            </div>
            <div className="p-3.5 rounded-[16px] bg-[#1D1D1D] border border-[#D4AF37]/25 text-center">
              <span className="text-xl font-black text-white font-mono block">100%</span>
              <span className="text-[11px] text-zinc-400 font-medium">Officiel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-["Syne",sans-serif]'
                : 'bg-[#1D1D1D] text-zinc-400 hover:text-white border border-[#2A2A2A] hover:bg-[#252525]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Feed List */}
      <div className="space-y-6">
        {filteredNews.map((article) => {
          const isLiked = likedArticles[article.id];
          const isCopied = copiedId === article.id;

          return (
            <article
              key={article.id}
              className="rounded-[16px] bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#D4AF37]/60 p-6 shadow-xl transition-all space-y-4"
            >
              {/* Header meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/35 font-bold text-[11px]">
                    {article.category}
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400 flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.date}
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400 text-[11px] font-mono">
                    {article.readTime} de lecture
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{article.officialAuthor}</span>
                </div>
              </div>

              {/* Title & Summary */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white font-['Syne',sans-serif] leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                  {article.summary}
                </p>
              </div>

              {/* Highlight Quote if present */}
              {article.highlightQuote && (
                <div className="p-3.5 rounded-xl bg-[#141414] border-l-4 border-[#D4AF37] text-xs sm:text-sm text-zinc-200 italic">
                  {article.highlightQuote}
                </div>
              )}

              {/* Content Paragraphs */}
              <div className="space-y-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {article.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {article.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-md bg-[#141414] text-zinc-400 text-[11px] font-mono border border-zinc-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Bottom interactions bar */}
              <div className="pt-4 border-t border-[#262626] flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(article.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border ${
                      isLiked
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-[#141414] text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{(likesState[article.id] || 0).toLocaleString()}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{article.commentsCount} commentaires</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleShare(article.id, article.title)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#252525] border border-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'Lien Copié !' : 'Partager'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
