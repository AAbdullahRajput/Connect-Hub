import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService {
  // ─── Save user & token to local storage ─────────────
  static Future<void> saveSession(String token, Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('user', jsonEncode(user));
  }

  // ─── Get saved token ─────────────────────────────────
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // ─── Get saved user ──────────────────────────────────
  static Future<Map<String, dynamic>?> getSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');
    if (userStr == null) return null;
    return jsonDecode(userStr);
  }

  // ─── Check if logged in ──────────────────────────────
  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null;
  }

  // ─── Register ────────────────────────────────────────
  static Future<Map<String, dynamic>> register({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      final res = await ApiService.register({
        'name': name,
        'username': username,
        'email': email,
        'password': password,
      });

      final token = res.data['token'];
      final user = res.data['user'];
      await saveSession(token, user);

      return {'success': true, 'user': user, 'token': token};
    } catch (e) {
      final message = _extractError(e);
      return {'success': false, 'message': message};
    }
  }

  // ─── Login ───────────────────────────────────────────
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final res = await ApiService.login({
        'email': email,
        'password': password,
      });

      final token = res.data['token'];
      final user = res.data['user'];
      await saveSession(token, user);

      return {'success': true, 'user': user, 'token': token};
    } catch (e) {
      final message = _extractError(e);
      return {'success': false, 'message': message};
    }
  }

  // ─── Logout ──────────────────────────────────────────
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  // ─── Update saved user locally ───────────────────────
  static Future<void> updateSavedUser(Map<String, dynamic> updatedUser) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(updatedUser));
  }

  // ─── Extract error message from Dio error ────────────
  static String _extractError(dynamic e) {
    try {
      final detail = e.response?.data['detail'];
      if (detail != null) return detail.toString();
    } catch (_) {}
    return 'Something went wrong. Please try again.';
  }
}