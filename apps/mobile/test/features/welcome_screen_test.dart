import 'package:bmi_mobile/app/app.dart';
import 'package:bmi_mobile/core/network/api_client.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

ApiClient _api(int status) => ApiClient(
  baseUrl: Uri.parse('http://api.test/api/v1'),
  httpClient: MockClient((_) async => http.Response('{"status":"ok"}', status)),
);

void main() {
  testWidgets('shows branding and a connected status when the API is up', (
    tester,
  ) async {
    await tester.pumpWidget(BmiApp(api: _api(200)));
    expect(find.text('BMI Housing Society'), findsOneWidget);
    expect(find.text('Checking server…'), findsOneWidget);
    await tester.pumpAndSettle();
    expect(find.text('Connected to server'), findsOneWidget);
  });

  testWidgets('shows unavailable with a retry button when the API is down', (
    tester,
  ) async {
    await tester.pumpWidget(BmiApp(api: _api(503)));
    await tester.pumpAndSettle();
    expect(find.text('Server unavailable'), findsOneWidget);
    expect(find.widgetWithText(TextButton, 'Retry'), findsOneWidget);
  });
}
