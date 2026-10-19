import 'package:bmi_mobile/core/config/app_config.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('accepts a valid dev URL and strips a trailing slash', () {
    final c = AppConfig.parse(
      apiBaseUrl: 'http://10.0.2.2:4000/api/v1/',
      environment: 'development',
    );
    expect(c.apiBaseUrl.toString(), 'http://10.0.2.2:4000/api/v1');
  });

  test('rejects a relative URL', () {
    expect(
      () => AppConfig.parse(apiBaseUrl: '/api/v1', environment: 'development'),
      throwsArgumentError,
    );
  });

  test('rejects an unknown environment', () {
    expect(
      () => AppConfig.parse(apiBaseUrl: 'https://x.in', environment: 'prod'),
      throwsArgumentError,
    );
  });

  test('requires https in production', () {
    expect(
      () => AppConfig.parse(
        apiBaseUrl: 'http://api.bmi.in',
        environment: 'production',
      ),
      throwsArgumentError,
    );
    expect(
      AppConfig.parse(
        apiBaseUrl: 'https://api.bmi.in/api/v1',
        environment: 'production',
      ).environment,
      'production',
    );
  });
}
