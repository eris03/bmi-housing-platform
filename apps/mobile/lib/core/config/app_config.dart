/// Build-time configuration, passed with --dart-define. No secrets belong here:
/// anything compiled into the APK can be read by whoever installs it.
class AppConfig {
  const AppConfig({required this.apiBaseUrl, required this.environment});

  final Uri apiBaseUrl;
  final String environment;

  static const _rawApiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    // 10.0.2.2 is the host machine from the Android emulator.
    defaultValue: 'http://10.0.2.2:4000/api/v1',
  );
  static const _rawEnvironment = String.fromEnvironment(
    'APP_ENV',
    defaultValue: 'development',
  );

  /// Validates the compiled-in values and fails fast with a readable message.
  static AppConfig fromEnvironment() =>
      parse(apiBaseUrl: _rawApiBaseUrl, environment: _rawEnvironment);

  static AppConfig parse({
    required String apiBaseUrl,
    required String environment,
  }) {
    final uri = Uri.tryParse(apiBaseUrl);
    if (uri == null ||
        !(uri.isScheme('http') || uri.isScheme('https')) ||
        uri.host.isEmpty) {
      throw ArgumentError.value(
        apiBaseUrl,
        'API_BASE_URL',
        'must be an absolute http(s) URL',
      );
    }
    const allowed = {'development', 'staging', 'production'};
    if (!allowed.contains(environment)) {
      throw ArgumentError.value(
        environment,
        'APP_ENV',
        'must be one of $allowed',
      );
    }
    if (environment == 'production' && !uri.isScheme('https')) {
      throw ArgumentError.value(
        apiBaseUrl,
        'API_BASE_URL',
        'must use https in production',
      );
    }
    final normalised = apiBaseUrl.endsWith('/')
        ? apiBaseUrl.substring(0, apiBaseUrl.length - 1)
        : apiBaseUrl;
    return AppConfig(
      apiBaseUrl: Uri.parse(normalised),
      environment: environment,
    );
  }
}
