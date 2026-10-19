import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

/// Thin HTTP wrapper around the BMI API. Feature clients build on this.
class ApiClient {
  ApiClient({
    required this.baseUrl,
    http.Client? httpClient,
    this.timeout = const Duration(seconds: 8),
  }) : _http = httpClient ?? http.Client();

  final Uri baseUrl;
  final http.Client _http;
  final Duration timeout;

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  /// Calls GET /health/live. Returns true only for a 200 with status "ok".
  Future<bool> isApiAlive() async {
    try {
      final res = await _http.get(_uri('/health/live')).timeout(timeout);
      if (res.statusCode != 200) return false;
      final body = jsonDecode(res.body);
      return body is Map && body['status'] == 'ok';
    } on Exception {
      return false;
    }
  }

  void close() => _http.close();
}
