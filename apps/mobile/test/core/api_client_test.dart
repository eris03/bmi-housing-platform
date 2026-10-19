import 'package:bmi_mobile/core/network/api_client.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  final base = Uri.parse('http://api.test/api/v1');

  test('calls /health/live and returns true for status ok', () async {
    late Uri called;
    final api = ApiClient(
      baseUrl: base,
      httpClient: MockClient((req) async {
        called = req.url;
        return http.Response('{"status":"ok"}', 200);
      }),
    );
    expect(await api.isApiAlive(), isTrue);
    expect(called.toString(), 'http://api.test/api/v1/health/live');
  });

  test('returns false on non-200, bad JSON or network error', () async {
    expect(
      await ApiClient(
        baseUrl: base,
        httpClient: MockClient((_) async => http.Response('', 503)),
      ).isApiAlive(),
      isFalse,
    );
    expect(
      await ApiClient(
        baseUrl: base,
        httpClient: MockClient((_) async => http.Response('nope', 200)),
      ).isApiAlive(),
      isFalse,
    );
    expect(
      await ApiClient(
        baseUrl: base,
        httpClient: MockClient(
          (_) async => throw http.ClientException('offline'),
        ),
      ).isApiAlive(),
      isFalse,
    );
  });
}
