import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Flame,
  Award,
  Truck,
  ArrowRight,
  Heart,
  Share2,
} from 'lucide-react';
import { MerchItem, PaymentProvider } from '../../types';

interface MerchScreenProps {
  onNotifyOrderSuccess?: (itemName: string) => void;
}

const MERCH_ITEMS: MerchItem[] = [
  {
    id: 'm1',
    name: 'Hoodie Collector Or « Bamako By Night »',
    category: 'Vêtements & Sweat',
    priceFCFA: 35000,
    priceEUR: 55,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80',
    badge: 'ÉDITION LIMITÉE',
    description: 'Sweat à capuche oversize 450g/m² en coton lourd, brodé au fil d’or métallique avec le logo officiel Oude Mill au dos.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'm2',
    name: 'T-Shirt Officiel « World Stadium Tour »',
    category: 'Vêtements',
    priceFCFA: 15000,
    priceEUR: 25,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
    badge: 'BEST-SELLER',
    description: 'Le t-shirt emblématique de la tournée avec les 5 stades mondiaux imprimés au dos (Bamako, Paris, Londres, Rio, New York).',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'm3',
    name: 'Casquette Broderie Or Oude Mill',
    category: 'Accessoires',
    priceFCFA: 10000,
    priceEUR: 15,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80',
    badge: 'MUST-HAVE',
    description: 'Casquette snapback structurée noire mate avec broderie 3D haute densité dorée Oude Mill et boucle en métal gravé.',
    sizes: ['Taille Unique Réglable'],
  },
  {
    id: 'm4',
    name: 'Vinyle Or Collector Dédicacé',
    category: 'Musique & Vinyles',
    priceFCFA: 40000,
    priceEUR: 60,
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=700&q=80',
    badge: 'COLLECTOR',
    description: 'Double vinyle pressé en or translucide 180g contenant les 6 hits officiels, dédicacé personnellement par Oude Mill avec poster géant.',
    sizes: ['Disque Vinyle 33 Tours'],
  },
];

export const MerchScreen: React.FC<MerchScreenProps> = ({ onNotifyOrderSuccess }) => {
  const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [paymentStep, setPaymentStep] = useState<'idle' | 'paying' | 'success'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('orange_money');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const handleOpenBuy = (item: MerchItem) => {
    setSelectedItem(item);
    if (item.sizes && item.sizes.length > 0) {
      setSelectedSize(item.sizes[0]);
    }
    setPaymentStep('idle');
  };

  const handleConfirmOrder = () => {
    if (!customerName || !customerPhone || !customerAddress) {
      alert('Veuillez remplir vos informations de livraison.');
      return;
    }

    setPaymentStep('paying');
    setTimeout(() => {
      setPaymentStep('success');
      if (onNotifyOrderSuccess && selectedItem) {
        onNotifyOrderSuccess(selectedItem.name);
      }
    }, 2200);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-[16px] overflow-hidden bg-gradient-to-r from-[#191610] via-[#221c11] to-[#151515] border border-[#D4AF37]/35 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Boutique Officielle • BGlaMac Store</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne',sans-serif]">
              MERCHANDISING OFFICIEL D’OUDE MILL
            </h2>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Vêtements, vinyles et accessoires exclusifs de la tournée mondiale. Paiement sécurisé via <strong>BGlaMac Pay</strong> (Orange Money, Moov, Wave, Sama & Carte Bancaire).
            </p>
          </div>

          <div className="flex gap-3">
            <div className="p-4 rounded-[16px] bg-[#1D1D1D] border border-[#D4AF37]/20 text-center">
              <span className="text-2xl font-black text-[#D4AF37] block font-mono">100%</span>
              <span className="text-[11px] text-zinc-400 font-medium">Authentique</span>
            </div>
            <div className="p-4 rounded-[16px] bg-[#1D1D1D] border border-[#D4AF37]/20 text-center">
              <span className="text-2xl font-black text-white block font-mono">Bamako & Monde</span>
              <span className="text-[11px] text-zinc-400 font-medium">Livraison Express</span>
            </div>
          </div>
        </div>
      </div>

      {/* Merch Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MERCH_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group rounded-[16px] bg-[#1D1D1D] border border-[#282828] hover:border-[#D4AF37]/60 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/10"
          >
            <div>
              {/* Image Preview */}
              <div className="relative aspect-square w-full overflow-hidden bg-black/50">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1D1D1D] via-transparent to-black/30"></div>

                {item.badge && (
                  <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D4AF37] text-black shadow-md font-mono">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Item Info */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-white font-['Syne',sans-serif] group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Price & Action */}
            <div className="p-4 pt-0 border-t border-[#252525] mt-2 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block font-mono">Prix officiel</span>
                <span className="text-base font-black text-[#D4AF37] font-mono">
                  {item.priceFCFA.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBuy(item)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6c148] text-black text-xs font-bold transition-all shadow-md shadow-[#D4AF37]/20 hover:scale-105"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Acheter</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Merch Purchase Modal with BGlaMac Pay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#141414] border border-[#D4AF37]/60 rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#1c1811] via-[#241f14] to-[#161616] p-4 border-b border-[#2C2C2C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                    BGlaMac Store Officiel
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-1">
                    {selectedItem.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 rounded-full bg-[#202020] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {paymentStep === 'idle' && (
                <>
                  <div className="flex items-center gap-4 bg-[#1A1A1A] p-3 rounded-xl border border-zinc-800">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{selectedItem.name}</h4>
                      <p className="text-xs text-[#D4AF37] font-mono font-bold mt-1">
                        {selectedItem.priceFCFA.toLocaleString('fr-FR')} FCFA (~{selectedItem.priceEUR} €)
                      </p>
                    </div>
                  </div>

                  {/* Size selection if any */}
                  {selectedItem.sizes && selectedItem.sizes.length > 1 && (
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                        Choisir la taille :
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSize(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              selectedSize === s
                                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                : 'bg-[#1C1C1C] text-zinc-300 border-zinc-700 hover:border-zinc-500'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery details */}
                  <div className="space-y-3 bg-[#181818] p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                      Informations de Livraison
                    </span>
                    <input
                      type="text"
                      placeholder="Nom complet *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#121212] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone (Orange / Moov / Wave) *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#121212] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="text"
                      placeholder="Adresse de livraison (Quartier / Ville / Pays) *"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full bg-[#121212] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Payment selector */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                      Mode de paiement BGlaMac :
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'orange_money' as PaymentProvider, label: 'Orange Money Mali' },
                        { id: 'moov_money' as PaymentProvider, label: 'Moov Money' },
                        { id: 'wave' as PaymentProvider, label: 'Wave Mali' },
                        { id: 'card' as PaymentProvider, label: 'Carte Bancaire' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id)}
                          className={`p-2.5 rounded-lg border text-left font-bold transition-all ${
                            paymentMethod === m.id
                              ? 'bg-[#201d14] border-[#D4AF37] text-[#D4AF37]'
                              : 'bg-[#181818] border-zinc-800 text-zinc-300'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#e6c148] text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-[#D4AF37]/25 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Valider la commande • {selectedItem.priceFCFA.toLocaleString('fr-FR')} FCFA</span>
                  </button>
                </>
              )}

              {paymentStep === 'paying' && (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 border-3 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto"></div>
                  <h4 className="text-sm font-bold text-white">Validation BGlaMac Pay en cours...</h4>
                  <p className="text-xs text-zinc-400">Confirmation de la commande et enregistrement au hub logistique de Bamako.</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-extrabold text-white font-['Syne',sans-serif]">
                    Commande Enregistrée avec Succès !
                  </h4>
                  <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                    Merci <strong>{customerName}</strong> pour votre soutien à Oude Mill ! Votre colis « {selectedItem.name} » ({selectedSize}) sera expédié à <strong>{customerAddress}</strong>. Suivi envoyé au <strong>{customerPhone}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs"
                  >
                    Retour à la boutique
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
