import 'package:flutter/material.dart';

import 'app/app.dart';
import 'core/config/app_config.dart';
import 'core/network/api_client.dart';

void main() {
  final config = AppConfig.fromEnvironment();
  runApp(BmiApp(api: ApiClient(baseUrl: config.apiBaseUrl)));
}
