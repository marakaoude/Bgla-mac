import { StadiumPreset, CameraMovePreset, StageFXPreset, MusicGenre } from '../types';

export const MUSIC_GENRES: MusicGenre[] = [
  {
    id: 'afro-rap',
    name: 'Afro-Rap Malien',
    category: 'Rap / Urban',
    tempo: '130 BPM (Très Énergique)',
    description: 'Basses 808 vibrantes, percussions mandingues rythmées et flow percutant signé Oude Mill.',
    crowdMood: 'Foule électrisée en plein délire, sauts collectifs synchronisés, pogos contrôlés et drapeaux du Mali agités.',
    lightingStyle: 'Faisceaux lasers cyan et magenta stroboscopiques, flammes pyrotechniques explosives à chaque kick.',
    promptSnippet: 'Genre musical & ambiance : Afro-Rap Malien percutant (130 BPM). Oude Mill rappe avec énergie et assurance, les mouvements du corps sont calés sur le beat 808. La foule de 100 000 spectateurs saute en rythme, créant des vagues humaines impressionnantes et chantant en choeur.',
  },
  {
    id: 'acoustic',
    name: 'Acoustique & Kora Mandingue',
    category: 'Acoustic / Traditional',
    tempo: '82 BPM (Intimiste & Émouvant)',
    description: 'Accords mélodiques de guitare sèche, envolées douces de kora et voix émouvante résonnant dans le stade.',
    crowdMood: 'Marée magique de centaines de milliers de téléphones allumés se balançant lentement au rythme de la mélodie.',
    lightingStyle: 'Poursuites lumineuses dorées et ambrées centrées sur Oude Mill, brume atmosphérique et cascade d’étincelles douces.',
    promptSnippet: 'Genre musical & ambiance : Ballade acoustique mandingue avec kora et guitare (82 BPM). Oude Mill livre une interprétation vocale intimiste et charismatique. Les 100 000 fans balancent doucement leurs smartphones allumés comme un ciel étoilé, créant une vague d’émotion poignante dans tout le stade.',
  },
  {
    id: 'instrumental-808',
    name: 'Instrumental Épique & 808 Trap',
    category: 'Instrumental / Cinematic',
    tempo: '140 BPM (Puissant & Cinématographique)',
    description: 'Production instrumentale lourde, cuivres synthétiques épiques, sub-basses massives sans paroles.',
    crowdMood: 'Les tribunes tremblent sous l’impact des infra-basses, têtes qui hochent avec intensité et poings levés à l’unisson.',
    lightingStyle: 'Lasers volumétriques vert émeraude et rouge sombre traçant des motifs géométriques géants au-dessus du public.',
    promptSnippet: 'Genre musical & ambiance : Instrumental trap cinématographique ultra-lourd (140 BPM). Des basses 808 titanesques font vibrer le stade. Oude Mill avance en maître de scène avec une présence scénique écrasante, tandis que les canons à CO2 crachent de la fumée blanche au rythme des drops instrumentaux.',
  },
  {
    id: 'afrobeats',
    name: 'Afrobeats Solaire & Festif',
    category: 'Rap / Urban',
    tempo: '108 BPM (Dansant & Chaleureux)',
    description: 'Groove afro-dancehall solaire, cuivres jazzy festifs et percussions syncopées d’Afrique de l’Ouest.',
    crowdMood: 'Stade entier qui danse dans une euphorie contagieuse, sourires éclatants, chorégraphies spontanées dans les tribunes.',
    lightingStyle: 'Jeux de lumière multicolores chatoyants, confettis dorés et pluie de paillettes scintillant sous les projecteurs.',
    promptSnippet: 'Genre musical & ambiance : Afrobeats festif et dansant (108 BPM). Oude Mill esquisse des pas de danse fluides et assurés avec le micro. Les 100 000 spectateurs dansent avec enthousiasme dans une ambiance de célébration panafricaine lumineuse et joyeuse.',
  },
  {
    id: 'drill-bamako',
    name: 'Drill Bamako (Sombre & Percutant)',
    category: 'Rap / Urban',
    tempo: '142 BPM (Haute Adrénaline)',
    description: 'Glissades de basses 808 glissantes, charlestons ultra-rapides et attitude streetwear conquérante.',
    crowdMood: 'Mouvements d’avant en arrière intenses, énergie brute, foule compacte ondulant à l’unisson au premier rang.',
    lightingStyle: 'Éclairage ultra-contrasté noir et blanc avec flashs stroboscopiques bleus perçants tranchant l’obscurité du stade.',
    promptSnippet: 'Genre musical & ambiance : Drill urbaine de Bamako ultra-rapide (142 BPM). Oude Mill arbore une démarche streetwear ultra-confiante et déterminée. La foule vibre d’une intensité brute avec des flashes de lumière ultra-rapides accompagnant chaque phrase scandée.',
  },
  {
    id: 'symphonic-stadium',
    name: 'Symphonie de Stade Triomphale',
    category: 'Instrumental / Cinematic',
    tempo: '95 BPM (Gladiateur & Majestueux)',
    description: 'Orchestre symphonique de cordes dramatiques combiné aux percussions de concert géant.',
    crowdMood: 'Rugissement unanime de stade, frissons palpables, clameur gigantesque scandant le nom d’Oude Mill.',
    lightingStyle: 'Projecteurs sky-tracers balayant le ciel nocturne jusqu’aux nuages, pluie de feux d’artifice tirée depuis le toit du stade.',
    promptSnippet: 'Genre musical & ambiance : Symphonie de stade triomphale et orchestrale (95 BPM). Entrée légendaire digne d’un empereur moderne de la musique. La foule pousse des acclamations retentissantes qui font écho dans toute la ville sous un ciel embrasé de feux d’artifice.',
  },
];

export const DEFAULT_CONCERT_PROMPT = `Transforme ma photo en une vidéo ultra-réaliste et cinématographique montrant l'artiste malien Oude Mill en pleine performance dans l'un des plus grands stades du monde, rempli de centaines de milliers de spectateurs. Le stade est immense, les tribunes sont bondées, les fans crient de joie, chantent ses morceaux et lèvent les mains dans une ambiance incroyable.

Oude Mill entre dans le stade avec assurance et une énergie exceptionnelle, accompagné de son équipe de sécurité. Il marche fièrement vers la grande scène, tandis que les projecteurs illuminent son visage et que des feux d'artifice éclatent dans le ciel. La foule l'accueille avec des cris puissants et des applaudissements impressionnants.

L'artiste porte une tenue de scène moderne et élégante. Il monte sur scène, prend le micro et commence son concert devant une foule en délire. Des écrans géants diffusent son image, des lasers traversent le stade et des effets lumineux spectaculaires rendent le concert inoubliable.

Mouvements de caméra : commence par une vue aérienne du stade rempli de spectateurs, puis montre l'entrée impressionnante d'Oude Mill, avance progressivement vers lui et termine par un plan large de toute la foule qui chante et danse.

Consignes importantes : conserve exactement le visage original de mes photos, sans le modifier. Les mouvements du corps doivent être naturels, les pas réalistes et l'image très nette. L'artiste doit marcher et se déplacer avec assurance, sans trébucher, sans tomber et sans gestes maladroits. Évite les déformations du visage, des mains et du corps. Synchronise les mouvements avec la musique et crée une ambiance de concert mondial digne des plus grandes stars.

Style final : vidéo verticale 9:16, qualité 4K, réalisme maximal, éclairage professionnel, ambiance spectaculaire, foule immense, mouvements fluides et rendu digne d'un concert international.`;

export const STADIUM_PRESETS: StadiumPreset[] = [
  {
    id: 'stade-26-mars',
    name: 'Stade du 26-Mars',
    city: 'Bamako',
    country: 'Mali 🇲🇱',
    capacity: '65 000+ spectateurs',
    vibe: 'Foule malienne en délire, drapeaux vert-jaune-rouge, chants Oude Mill',
  },
  {
    id: 'stade-de-france',
    name: 'Stade de France',
    city: 'Saint-Denis',
    country: 'France 🇫🇷',
    capacity: '80 000+ spectateurs',
    vibe: 'Arène internationale, show pyrotechnique géant, lasers 360°',
  },
  {
    id: 'wembley',
    name: 'Wembley Stadium',
    city: 'Londres',
    country: 'Royaume-Uni 🇬🇧',
    capacity: '90 000 spectateurs',
    vibe: 'Immense arche illuminée, écrans LED monumentaux, marée de téléphones',
  },
  {
    id: 'maracana',
    name: 'Estádio do Maracanã',
    city: 'Rio de Janeiro',
    country: 'Brésil 🇧🇷',
    capacity: '78 000 spectateurs',
    vibe: 'Ambiance volcanique, fumigènes colorés, clameur spectaculaire',
  },
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    city: 'New York / New Jersey',
    country: 'États-Unis 🇺🇸',
    capacity: '82 500 spectateurs',
    vibe: 'Super-production américaine, projecteurs sky-tracers, basses percutantes',
  },
];

export const CAMERA_MOVES: CameraMovePreset[] = [
  {
    id: 'drone-to-stage',
    label: 'Aérien Drone ➔ Scène',
    description: 'Plongée spectaculaire depuis le ciel du stade jusqu’à l’entrée d’Oude Mill.',
    promptSnippet: 'Mouvement de caméra : début par un plan zénithal drone montrant le stade illuminé plein à craquer, plongeon fluide en traveling vers l’entrée d’Oude Mill escorté par la sécurité.',
  },
  {
    id: 'security-walk',
    label: 'Marche Assurance ➔ Scène',
    description: 'Caméra travelling fluide suivant la marche confiante d’Oude Mill.',
    promptSnippet: 'Mouvement de caméra : travelling basse plongée suivant la démarche assurée d’Oude Mill montant les marches de la scène, projecteurs braqués sur lui.',
  },
  {
    id: 'mic-close-energy',
    label: 'Gros Plan Micro ➔ Explosion',
    description: 'Focus expressif sur le visage et le micro, puis cut vers le lâcher de confettis.',
    promptSnippet: 'Mouvement de caméra : plan serré net et expressif sur Oude Mill chantant au micro avec charisme, suivi d’un recul explosif dévoilant les feux d’artifice.',
  },
  {
    id: 'panoramic-crowd-roar',
    label: 'Vue Panoramique Foule 360°',
    description: 'Rotation majestueuse capturant les dizaines de milliers de bras levés.',
    promptSnippet: 'Mouvement de caméra : balayage panoramique circulaire révélant la marée humaine chantant en choeur et les lasers traversant la nuit.',
  },
];

export const STAGE_FX: StageFXPreset[] = [
  {
    id: 'pyro-fireworks',
    label: 'Feux d’artifice & Flammes',
    icon: '🎆',
    promptSnippet: 'Feux d’artifice géants et colonnes de flammes pyrotechniques synchronisées explosant en arrière-plan.',
  },
  {
    id: 'lasers-led',
    label: 'Lasers Cyan & Murs LED 8K',
    icon: '⚡',
    promptSnippet: 'Faisceaux lasers cyan et dorés fendant la brume du stade avec écrans géants diffusant son visage en direct 4K.',
  },
  {
    id: 'co2-smoke',
    label: 'Jets Cryo CO2 & Fumée',
    icon: '💨',
    promptSnippet: 'Canons à CO2 projetant une vapeur blanche puissante sur les côtés de la scène avec étincelles froides.',
  },
  {
    id: 'phone-lights',
    label: 'Marée de Smartphones 100k',
    icon: '✨',
    promptSnippet: 'Centaines de milliers de téléphones allumés brillant comme une galaxie d’étoiles dans les tribunes en délire.',
  },
];

// Stylized visual placeholder representation of Oude Mill in SVG data URL
export const OUDE_MILL_SAMPLE_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%231a1c29"/>
      <stop offset="60%" stop-color="%232c2f42"/>
      <stop offset="100%" stop-color="%2312131c"/>
    </linearGradient>
    <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%235a3927"/>
      <stop offset="100%" stop-color="%233e2417"/>
    </linearGradient>
    <linearGradient id="shirt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fcd34d"/>
      <stop offset="30%" stop-color="%23f472b6"/>
      <stop offset="70%" stop-color="%2360a5fa"/>
      <stop offset="100%" stop-color="%234ade80"/>
    </linearGradient>
    <linearGradient id="pants" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%23d1d5db"/>
      <stop offset="100%" stop-color="%239ca3af"/>
    </linearGradient>
    <linearGradient id="chain" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="%23ffffff"/>
      <stop offset="50%" stop-color="%23e2e8f0"/>
      <stop offset="100%" stop-color="%23cbd5e1"/>
    </linearGradient>
    <radialGradient id="stageGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="%23ec4899" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="%23000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="600" height="900" fill="url(%23bg)"/>
  <circle cx="300" cy="380" r="320" fill="url(%23stageGlow)"/>

  <!-- Stadium lights background silhouette -->
  <g opacity="0.25">
    <polygon points="50,900 120,400 160,900" fill="%2360a5fa"/>
    <polygon points="450,900 480,400 550,900" fill="%23f43f5e"/>
    <circle cx="120" cy="400" r="18" fill="%23ffffff"/>
    <circle cx="480" cy="400" r="18" fill="%23ffffff"/>
  </g>

  <!-- Shoes -->
  <rect x="235" y="810" width="55" height="42" rx="16" fill="%23ffffff"/>
  <rect x="310" y="810" width="55" height="42" rx="16" fill="%23ffffff"/>
  <rect x="230" y="840" width="62" height="15" rx="8" fill="%2338bdf8"/>
  <rect x="305" y="840" width="62" height="15" rx="8" fill="%2338bdf8"/>

  <!-- Cargo Pants -->
  <path d="M 230 570 L 255 815 L 292 815 L 300 620 L 308 815 L 345 815 L 370 570 Z" fill="url(%23pants)"/>
  <!-- Cargo pockets -->
  <rect x="230" y="650" width="28" height="45" rx="5" fill="%239ca3af" stroke="%236b7280" stroke-width="2"/>
  <rect x="342" y="650" width="28" height="45" rx="5" fill="%239ca3af" stroke="%236b7280" stroke-width="2"/>

  <!-- Floral Street T-Shirt -->
  <path d="M 210 320 L 390 320 L 380 590 L 220 590 Z" fill="url(%23shirt)"/>
  <!-- Short sleeves -->
  <polygon points="210,320 180,440 230,440 235,350" fill="url(%23shirt)"/>
  <polygon points="390,320 420,440 370,440 365,350" fill="url(%23shirt)"/>

  <!-- LV monogram subtle texture overlay -->
  <g opacity="0.35" fill="%23ffffff">
    <circle cx="270" cy="380" r="5"/>
    <circle cx="330" cy="400" r="5"/>
    <circle cx="290" cy="460" r="6"/>
    <circle cx="350" cy="490" r="5"/>
    <circle cx="250" cy="530" r="6"/>
    <circle cx="310" cy="540" r="5"/>
  </g>

  <!-- Left Arm -->
  <path d="M 380 440 L 370 600 L 340 600 L 360 440 Z" fill="url(%23skin)"/>

  <!-- Neck & Diamond Chains -->
  <rect x="275" y="270" width="50" height="60" rx="10" fill="url(%23skin)"/>
  <ellipse cx="300" cy="335" rx="42" ry="24" fill="none" stroke="url(%23chain)" stroke-width="9"/>
  <ellipse cx="300" cy="350" rx="34" ry="18" fill="none" stroke="url(%23chain)" stroke-width="6"/>

  <!-- Head / Face (Oude Mill profile pose) -->
  <ellipse cx="300" cy="245" rx="38" ry="46" fill="url(%23skin)"/>
  <ellipse cx="282" cy="242" rx="4" ry="3" fill="%23111827"/>
  <ellipse cx="316" cy="242" rx="4" ry="3" fill="%23111827"/>
  <path d="M 292 268 Q 300 274 308 268" stroke="%2327170e" stroke-width="3" fill="none"/>
  <!-- Diamond earring -->
  <circle cx="262" cy="254" r="3.5" fill="%23ffffff"/>

  <!-- Trucker Cap (Black brim & white crown) -->
  <path d="M 252 230 C 255 170, 345 170, 348 230 Z" fill="%23ffffff"/>
  <ellipse cx="290" cy="235" rx="55" ry="14" fill="%23111827"/>
  <text x="300" y="210" text-anchor="middle" fill="%23111827" font-size="12" font-family="sans-serif" font-weight="900" letter-spacing="1">OUDE MILL</text>

  <!-- Hand gesture (swagger sign) -->
  <g transform="translate(195, 270)">
    <rect x="0" y="0" width="30" height="45" rx="10" fill="url(%23skin)"/>
    <circle cx="5" cy="15" r="5" fill="%23e2e8f0"/>
    <circle cx="15" cy="10" r="5" fill="%23e2e8f0"/>
  </g>

  <!-- Subtitle badge -->
  <rect x="180" y="30" width="240" height="38" rx="19" fill="%23111827" stroke="%23f59e0b" stroke-width="1.5"/>
  <text x="300" y="54" text-anchor="middle" fill="%23f59e0b" font-size="14" font-family="sans-serif" font-weight="800" letter-spacing="1.5">OUDE MILL • LIVE STADIUM</text>
</svg>`;
