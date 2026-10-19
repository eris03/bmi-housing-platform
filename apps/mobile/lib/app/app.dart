import 'package:flutter/material.dart';

import '../core/network/api_client.dart';
import '../features/onboarding/welcome_screen.dart';

class BmiApp extends StatelessWidget {
  const BmiApp({super.key, required this.api});

  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BMI Housing Society',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF2F7A4B),
        useMaterial3: true,
      ),
      home: WelcomeScreen(api: api),
    );
  }
}
