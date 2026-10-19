import 'package:flutter/material.dart';

import '../../core/network/api_client.dart';

/// Milestone 02 placeholder home: branded welcome plus a live API connection check.
/// Onboarding, login and projects arrive in Milestone 05.
class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key, required this.api});

  final ApiClient api;

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  late Future<bool> _alive;

  @override
  void initState() {
    super.initState();
    _alive = widget.api.isApiAlive();
  }

  void _retry() => setState(() => _alive = widget.api.isApiAlive());

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              Text(
                'BMI Housing Society',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Explore projects, plan a site visit and track your requests.',
                style: theme.textTheme.bodyLarge,
              ),
              const Spacer(),
              FutureBuilder<bool>(
                future: _alive,
                builder: (context, snap) {
                  final (label, color) = switch (snap.connectionState) {
                    ConnectionState.done when snap.data == true => (
                      'Connected to server',
                      Colors.green,
                    ),
                    ConnectionState.done => (
                      'Server unavailable',
                      theme.colorScheme.error,
                    ),
                    _ => ('Checking server…', theme.colorScheme.outline),
                  };
                  return Row(
                    children: [
                      Icon(
                        Icons.circle,
                        size: 12,
                        color: color,
                        key: const Key('api-status-dot'),
                      ),
                      const SizedBox(width: 8),
                      Text(label, key: const Key('api-status-label')),
                      const Spacer(),
                      if (snap.connectionState == ConnectionState.done &&
                          snap.data != true)
                        TextButton(
                          onPressed: _retry,
                          child: const Text('Retry'),
                        ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
