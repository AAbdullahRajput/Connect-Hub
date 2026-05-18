import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  String? _token;
  bool _loading = true;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  bool get loading => _loading;
  bool get isLoggedIn => _user != null && _token != null;

  // ─── Called from main.dart on app start ─────────────
  AuthProvider(dynamic prefs) {
    _loadFromStorage();
  }

  // ─── Load saved session on app start ────────────────
  Future<void> _loadFromStorage() async {
    try {
      final token = await AuthService.getToken();
      final user = await AuthService.getSavedUser();

      if (token != null && user != null) {
        _token = token;
        _user = user;
        ApiService.init();
      }
    } catch (e) {
      debugPrint('Error loading session: $e');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  // ─── Login ───────────────────────────────────────────
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final result = await AuthService.login(
      email: email,
      password: password,
    );

    if (result['success']) {
      _user = result['user'];
      _token = result['token'];
      ApiService.init();
      notifyListeners();
    }

    return result;
  }

  // ─── Register ────────────────────────────────────────
  Future<Map<String, dynamic>> register({
    required String name,
    required String username,
    required String email,
    required String password,
  }) async {
    final result = await AuthService.register(
      name: name,
      username: username,
      email: email,
      password: password,
    );

    if (result['success']) {
      _user = result['user'];
      _token = result['token'];
      ApiService.init();
      notifyListeners();
    }

    return result;
  }

  // ─── Logout ──────────────────────────────────────────
  Future<void> logout() async {
    await AuthService.logout();
    _user = null;
    _token = null;
    notifyListeners();
  }

  // ─── Update user data (after profile edit) ───────────
  Future<void> updateUser(Map<String, dynamic> updatedUser) async {
    _user = updatedUser;
    await AuthService.updateSavedUser(updatedUser);
    notifyListeners();
  }

  // ─── Helper getters ──────────────────────────────────
  String get userName => _user?['name'] ?? '';
  String get userUsername => _user?['username'] ?? '';
  String get userEmail => _user?['email'] ?? '';
  String get userId => _user?['id'] ?? '';
  String? get userAvatar => _user?['profile_picture'];
  String? get userBio => _user?['bio'];
  int get followersCount => _user?['followers_count'] ?? 0;
  int get followingCount => _user?['following_count'] ?? 0;
  int get postsCount => _user?['posts_count'] ?? 0;
}