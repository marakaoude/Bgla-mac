import React, { useState } from 'react';
import {
  Flame,
  Music,
  Video,
  MapPin,
  Newspaper,
  Sparkles,
  Camera,
  Code2,
  Tv,
  QrCode,
  LayoutDashboard,
  Crown,
  Smartphone,
  Globe,
  Wifi,
  Battery,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { Header } from './Header';
import { HomeScreen } from './screens/HomeScreen';
import { MusicScreen } from './screens/MusicScreen';
import { ClipsScreen } from './screens/ClipsScreen';
import { TourScreen } from './screens/TourScreen';
import { NewsScreen } from './screens/NewsScreen';
import { GalleryScreen } from './screens/GalleryScreen';
import { MerchScreen } from './screens/MerchScreen';
import { ArtistDashboard } from './dashboard/ArtistDashboard';
import { TicketScannerModal } from './scanner/TicketScannerModal';
import { FlutterCodeModal } from './FlutterCodeModal';
import { ArchitectureFlowScreen } from './payment/ArchitectureFlowScreen';
import { TikTokFeedScreen } from './tiktok/TikTokFeedScreen';
import { AspectRatio } from '../types';

export type ActiveTab =
  | 'home'
  | 'tiktok'
  | 'music'
  | 'clips'
  | 'tour'
  | 'scanner'
  | 'dashboard'
  | 'architecture'
  | 'news'
  | 'merch'
  | 'studio'
  | 'gallery';

interface AppShellProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  activeCount: number;
  genreName?: string;
  crowdVolume: number;
  onCrowdVolumeChange: (vol: number) => void;
  soundActive: boolean;
  onToggleSound: () => void;
  children: React.ReactNode;
  onSelectTrackForVideo: (genreId: string, trackTitle: string) => void;
  onSelectClipForVideoStudio: (promptSnippet: string, genreId: string) => void;
  onSelectStadiumForVideo: (stadiumName: string) => void;
  onSelectPhotoForStudio: (dataUrl: string, name: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  aspectRatio,
  onAspectRatioChange,
  activeCount,
  genreName,
  crowdVolume,
  onCrowdVolumeChange,
  soundActive,
  onToggleSound,
  children,
  onSelectTrackForVideo,
  onSelectClipForVideoStudio,
  onSelectStadiumForVideo,
  onSelectPhotoForStudio,
}) => {
  const [showFlutterCode, setShowFlutterCode] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isAndroidMode, setIsAndroidMode] = useState(false);

  const TABS = [
    { id: 'home' as ActiveTab, label: 'Accueil', icon: Flame, badge: 'BGla Mac' },
    { id: 'tiktok' as ActiveTab, label: 'BGla Tok', icon: Sparkles, badge: 'TikTok Feed & Montage' },
    { id: 'music' as ActiveTab, label: 'Musiques', icon: Music, badge: 'Streaming' },
    { id: 'clips' as ActiveTab, label: 'Clips', icon: Video, badge: '4K' },
    { id: 'tour' as ActiveTab, label: 'Concerts & Billets', icon: MapPin, badge: 'Std/VIP/VVIP' },
    { id: 'scanner' as ActiveTab, label: 'Scanner Entrée', icon: QrCode, badge: 'Contrôle' },
    { id: 'dashboard' as ActiveTab, label: 'Dashboard Artiste', icon: LayoutDashboard, badge: '10k FCFA' },
    { id: 'architecture' as ActiveTab, label: 'Flux 95/5 & API', icon: Zap, badge: 'Stripe/PayPal' },
    { id: 'news' as ActiveTab, label: 'Actualités', icon: Newspaper, badge: 'En Direct' },
    { id: 'studio' as ActiveTab, label: 'Studio Veo', icon: Sparkles, badge: 'IA 3.1' },
    { id: 'merch' as ActiveTab, label: 'Boutique', icon: ShoppingBag, badge: 'Merch' },
  ];

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateTab={onTabChange}
            onPlayTrackQuick={(genreId, trackTitle) => {
              onSelectTrackForVideo(genreId, trackTitle);
              onTabChange('music');
            }}
            onOpenScanner={() => setIsScannerModalOpen(true)}
          />
        );
      case 'tiktok':
        return (
          <TikTokFeedScreen
            onSelectTrackForVideo={onSelectTrackForVideo}
            onNavigateTab={onTabChange}
          />
        );
      case 'music':
        return <MusicScreen onSelectTrackForVideo={onSelectTrackForVideo} />;
      case 'clips':
        return (
          <ClipsScreen
            onSelectClipForVideoStudio={onSelectClipForVideoStudio}
            onNavigateTikTok={() => onTabChange('tiktok')}
          />
        );
      case 'tour':
        return (
          <TourScreen
            onSelectStadiumForVideo={onSelectStadiumForVideo}
            onOpenScanner={() => setIsScannerModalOpen(true)}
          />
        );
      case 'scanner':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#2a2a2a] flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white uppercase font-['Syne',sans-serif]">
                  Vérification des Billets à l'Entrée
                </h2>
                <p className="text-xs text-zinc-400">
                  Validez les billets Standard, VIP et VVIP avec caméra et détecteur anti-doublon.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20"
              >
                Ouvrir Caméra Scanner
              </button>
            </div>
            {/* Embedded Scanner modal active inside tab */}
            <TourScreen
              onSelectStadiumForVideo={onSelectStadiumForVideo}
              onOpenScanner={() => setIsScannerModalOpen(true)}
            />
          </div>
        );
      case 'dashboard':
        return (
          <ArtistDashboard
            onOpenScanner={() => setIsScannerModalOpen(true)}
          />
        );
      case 'architecture':
        return <ArchitectureFlowScreen />;
      case 'news':
        return <NewsScreen />;
      case 'studio':
        return <>{children}</>;
      case 'merch':
        return <MerchScreen />;
      case 'gallery':
        return <GalleryScreen onSelectPhotoForStudio={onSelectPhotoForStudio} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#101010] text-zinc-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#D4AF37] selection:text-black">
      {/* Official Gold Top Header */}
      <Header
        aspectRatio={aspectRatio}
        onAspectRatioChange={onAspectRatioChange}
        activeCount={activeCount}
        genreName={genreName}
        crowdVolume={crowdVolume}
        onCrowdVolumeChange={onCrowdVolumeChange}
        soundActive={soundActive}
        onToggleSound={onToggleSound}
        isAndroidMode={isAndroidMode}
        onToggleAndroidMode={() => setIsAndroidMode(!isAndroidMode)}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        onOpenDashboard={() => onTabChange('dashboard')}
        onOpenArchitecture={() => onTabChange('architecture')}
      />

      {/* Navigation AppShell Tab Bar (Desktop & Tablet) */}
      <nav className="bg-[#141414] border-b border-[#262626] sticky top-[57px] z-30 px-3 sm:px-6 lg:px-8 py-2.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-['Syne',sans-serif]"
                      : 'text-zinc-400 hover:text-white hover:bg-[#1D1D1D]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#D4AF37]'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold hidden xl:inline-block ${
                        isActive
                          ? 'bg-black/25 text-black'
                          : 'bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/20'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Starter Flutter / Dart code modal */}
            <button
              type="button"
              onClick={() => setShowFlutterCode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1D1D1D] hover:bg-[#262626] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold shrink-0 transition-colors"
              title="Afficher le starter Flutter / Dart & BGlaMac Pay"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Android & Flutter Core</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area: Responsive Website or Android Device Frame */}
      {isAndroidMode ? (
        /* Android App Simulation Frame */
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col items-center">
          <div className="w-full max-w-md bg-zinc-950 rounded-[44px] border-[10px] border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.15)] overflow-hidden flex flex-col relative transition-all">
            {/* Android Status Bar */}
            <div className="bg-black/90 px-6 py-2.5 flex items-center justify-between text-xs text-zinc-300 select-none border-b border-zinc-900 shrink-0">
              <span className="font-bold text-[11px] font-mono">12:30</span>
              {/* Punch hole camera */}
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <Wifi className="w-3 h-3 text-[#D4AF37]" />
                <span className="font-mono text-[9px] font-bold">5G</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Android Screen Body */}
            <div className="flex-1 p-3.5 pb-20 overflow-y-auto max-h-[720px] bg-[#101010]">
              {renderActiveScreen()}
            </div>

            {/* Android Material 3 Navigation Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-[#141414]/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
              {TABS.slice(0, 5).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all ${
                      isActive ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold truncate max-w-[50px]">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Android Home Indicator Pill */}
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-600 rounded-full" />
          </div>

          <div className="mt-4 text-center text-xs text-zinc-400 flex items-center gap-2">
            <span>Mode Émulateur Android</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsAndroidMode(false)}
              className="text-[#D4AF37] underline font-bold"
            >
              Basculer en Mode Site Web Plein Écran
            </button>
          </div>
        </div>
      ) : (
        /* Fullscreen Responsive Web View */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 pb-24 md:pb-8">
          {renderActiveScreen()}
        </main>
      )}

      {/* Mobile Floating AppShell Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101010]/95 backdrop-blur-xl border-t border-[#262626] px-2 py-1.5 flex items-center justify-around shadow-2xl overflow-x-auto no-scrollbar">
        {TABS.slice(0, 6).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition-all shrink-0 ${
                isActive ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold truncate max-w-[50px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Entry Scanner Modal */}
      <TicketScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
      />

      {/* Flutter Architecture Modal */}
      <FlutterCodeModal
        isOpen={showFlutterCode}
        onClose={() => setShowFlutterCode(false)}
      />

      {/* Official Footer */}
      <footer className="border-t border-[#262626] bg-[#101010] px-4 py-6 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} <strong>BGla Mac</strong> • Plateforme de musique, clips, actualités des artistes, concerts et billetterie en ligne.
          </p>
          <div className="flex items-center gap-3 text-[#D4AF37] font-semibold text-xs">
            <span>Abonnement Artiste : 10 000 FCFA/mois</span>
            <span>•</span>
            <span>Billetterie Standard, VIP, VVIP</span>
            <span>•</span>
            <span>Scanner QR Code</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
