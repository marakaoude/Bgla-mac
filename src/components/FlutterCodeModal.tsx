import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, Layers, ShieldCheck, Sparkles } from 'lucide-react';

interface FlutterCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterCodeModal: React.FC<FlutterCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<'main' | 'payment_service' | 'pubspec' | 'ticket_screen'>('payment_service');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const CODE_FILES = {
    payment_service: {
      fileName: 'lib/services/payment_service.dart',
      description: 'Service officiel BGlaMac Pay pour Orange Money, Moov, Wave, Sama Money & Carte bancaire avec Firebase',
      code: `// lib/services/payment_service.dart
// BGlaMac Official Payment Service for Oude Mill App 🇲🇱

import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

enum PaymentProvider {
  orangeMoney,
  moovMoney,
  wave,
  samaMoney,
  card,
}

class PaymentTransaction {
  final String transactionId;
  final String concertId;
  final String stadiumName;
  final String customerName;
  final String customerPhone;
  final double amountFCFA;
  final PaymentProvider provider;
  final String status;
  final String qrHash;
  final DateTime timestamp;

  PaymentTransaction({
    required this.transactionId,
    required this.concertId,
    required this.stadiumName,
    required this.customerName,
    required this.customerPhone,
    required this.amountFCFA,
    required this.provider,
    required this.status,
    required this.qrHash,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() => {
    'transactionId': transactionId,
    'concertId': concertId,
    'stadiumName': stadiumName,
    'customerName': customerName,
    'customerPhone': customerPhone,
    'amountFCFA': amountFCFA,
    'provider': provider.name,
    'status': status,
    'qrHash': qrHash,
    'timestamp': timestamp.toIso8601String(),
  };
}

class BGlaMacPaymentService {
  static final BGlaMacPaymentService _instance = BGlaMacPaymentService._internal();
  factory BGlaMacPaymentService() => _instance;
  BGlaMacPaymentService._internal();

  /// Initialise la passerelle de paiement BGlaMac
  Future<void> initialize({required String apiKey, required String environment}) async {
    debugPrint('BGlaMac Pay SDK initialisé avec succès [$environment]');
  }

  /// Traitement du paiement concert / merch
  Future<PaymentTransaction> processPayment({
    required String concertId,
    required String stadiumName,
    required String customerName,
    required String customerPhone,
    required double amountFCFA,
    required PaymentProvider provider,
    String? category,
  }) async {
    debugPrint('Initiation transaction BGlaMac avec \${provider.name} pour \$amountFCFA FCFA');

    // Simulation du push USSD Orange / Moov / Wave
    await Future.delayed(const Duration(seconds: 2));

    final String txId = 'OM-BGLAMAC-\${DateTime.now().millisecondsSinceEpoch}';
    final String qrHash = 'OUDE-MILL-OFFICIAL|\$concertId|\$txId|\$customerName|\$category';

    final transaction = PaymentTransaction(
      transactionId: txId,
      concertId: concertId,
      stadiumName: stadiumName,
      customerName: customerName,
      customerPhone: customerPhone,
      amountFCFA: amountFCFA,
      provider: provider,
      status: 'SUCCESS',
      qrHash: qrHash,
      timestamp: DateTime.now(),
    );

    return transaction;
  }
}
`,
    },
    main: {
      fileName: 'lib/main.dart',
      description: 'Point d’entrée principal Flutter Material 3 avec thème sombre Royal Gold (#D4AF37)',
      code: `// lib/main.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'firebase_options.dart';
import 'screens/app_shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const OudeMillApp());
}

class OudeMillApp extends StatelessWidget {
  const OudeMillApp({super.key});

  @override
  Widget build(BuildContext context) {
    const gold = Color(0xFFD4AF37);

    return MaterialApp(
      title: 'Oude Mill Officiel',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF101010),
        colorScheme: ColorScheme.fromSeed(
          seedColor: gold,
          brightness: Brightness.dark,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF101010),
          foregroundColor: gold,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          color: const Color(0xFF1D1D1D),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      home: const AppShell(),
    );
  }
}
`,
    },
    pubspec: {
      fileName: 'pubspec.yaml',
      description: 'Configuration et dépendances du projet Flutter Oude Mill Starter',
      code: `name: oude_mill_official
description: "Application officielle d'Oude Mill - Musiques, Clips, Concerts & BGlaMac Pay"
publish_to: 'none'
version: 1.0.0+2

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # Firebase Core & Firestore
  firebase_core: ^3.6.0
  cloud_firestore: ^5.4.4
  
  # QR Code & Billetterie
  qr_flutter: ^4.1.0
  
  # Réseau & Paiement
  http: ^1.2.2
  intl: ^0.19.0
  provider: ^6.1.2
  url_launcher: ^6.3.0
  
  # Audio Ambiance Stade
  audioplayers: ^6.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/audio/
`,
    },
    ticket_screen: {
      fileName: 'lib/screens/ticket_screen.dart',
      description: 'Écran de présentation du E-Ticket officiel avec QR Code sécurisé en Flutter',
      code: `// lib/screens/ticket_screen.dart
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../services/payment_service.dart';

class TicketScreen extends StatelessWidget {
  final PaymentTransaction ticket;

  const TicketScreen({super.key, required this.ticket});

  @override
  Widget build(BuildContext context) {
    const gold = Color(0xFFD4AF37);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Billet Officiel', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Center(
        child: Container(
          margin: const EdgeInsets.all(20),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF1D1D1D),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: gold, width: 2),
            boxShadow: [
              BoxShadow(
                color: gold.withOpacity(0.15),
                blurRadius: 20,
                spreadRadius: 2,
              )
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'OUDE MILL STADIUM TOUR',
                style: TextStyle(color: gold, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                ticket.stadiumName,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 20),
              Container(
                color: Colors.white,
                padding: const EdgeInsets.all(12),
                child: QrImageView(
                  data: ticket.qrHash,
                  version: QrVersions.auto,
                  size: 180.0,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Réf: \${ticket.transactionId}',
                style: const TextStyle(color: Colors.grey, fontFamily: 'monospace'),
              ),
              const SizedBox(height: 8),
              Text(
                'Titulaire: \${ticket.customerName}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`,
    },
  };

  const currentFileData = CODE_FILES[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFileData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#141414] border border-[#D4AF37]/50 rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#1c1811] via-[#241f14] to-[#161616] p-4 sm:p-5 border-b border-[#2C2C2C] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                  Starter Flutter & BGlaMac Service
                </span>
                <span className="text-xs text-zinc-400 font-mono">Mise à jour 2026</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Syne',sans-serif]">
                Code Source Flutter • Oude Mill Officiel
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#2c2c2c] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher for Dart files */}
        <div className="bg-[#181818] px-4 py-2.5 border-b border-[#262626] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'payment_service', label: 'payment_service.dart', badge: 'BGlaMac Pay' },
              { id: 'main', label: 'main.dart', badge: 'Theme Gold' },
              { id: 'ticket_screen', label: 'ticket_screen.dart', badge: 'QR Code' },
              { id: 'pubspec', label: 'pubspec.yaml', badge: 'Config' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFile(f.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeFile === f.id
                    ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-mono'
                    : 'text-zinc-400 hover:text-white hover:bg-[#222222] font-mono'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{f.label}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded-full font-sans ${activeFile === f.id ? 'bg-black/20 text-black' : 'bg-black text-[#D4AF37]'}`}>
                  {f.badge}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252525] hover:bg-[#303030] text-[#D4AF37] hover:text-white text-xs font-bold shrink-0 transition-colors border border-[#D4AF37]/30"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>
        </div>

        {/* Code View Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#0d0d0d]">
          <p className="text-xs text-zinc-300">
            {currentFileData.description}
          </p>

          <pre className="bg-[#101010] p-4 rounded-xl text-xs font-mono text-[#D4AF37] border border-[#242424] overflow-x-auto leading-relaxed shadow-inner">
            {currentFileData.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
