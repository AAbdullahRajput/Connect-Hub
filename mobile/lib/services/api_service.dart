import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8000'; // Android emulator localhost
  // If testing on real device, replace with your PC's IP: 'http://192.168.x.x:8000'

  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  static void init() {
    // Request interceptor — attach token to every request
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          // Auto logout on 401
          if (error.response?.statusCode == 401) {
            final prefs = await SharedPreferences.getInstance();
            await prefs.remove('token');
            await prefs.remove('user');
          }
          return handler.next(error);
        },
      ),
    );
  }

  // ─── AUTH ───────────────────────────────────────────
  static Future<Response> register(Map<String, dynamic> data) =>
      _dio.post('/api/auth/register', data: data);

  static Future<Response> login(Map<String, dynamic> data) =>
      _dio.post('/api/auth/login', data: data);

  // ─── POSTS ──────────────────────────────────────────
  static Future<Response> getAllPosts() =>
      _dio.get('/api/posts');

  static Future<Response> getFeedPosts() =>
      _dio.get('/api/posts/feed');

  static Future<Response> getSinglePost(String postId) =>
      _dio.get('/api/posts/$postId');

  static Future<Response> createPost(Map<String, dynamic> data) =>
      _dio.post('/api/posts', data: data);

  static Future<Response> deletePost(String postId) =>
      _dio.delete('/api/posts/$postId');

  // ─── LIKES ──────────────────────────────────────────
  static Future<Response> likePost(String postId) =>
      _dio.post('/api/posts/$postId/like');

  static Future<Response> unlikePost(String postId) =>
      _dio.delete('/api/posts/$postId/like');

  // ─── COMMENTS ───────────────────────────────────────
  static Future<Response> getComments(String postId) =>
      _dio.get('/api/posts/$postId/comments');

  static Future<Response> addComment(String postId, String content) =>
      _dio.post('/api/posts/$postId/comments', data: {'content': content});

  static Future<Response> deleteComment(String commentId) =>
      _dio.delete('/api/posts/comments/$commentId');

  // ─── USERS ──────────────────────────────────────────
  static Future<Response> getUserProfile(String username) =>
      _dio.get('/api/users/$username');

  static Future<Response> updateProfile(Map<String, dynamic> data) =>
      _dio.put('/api/users/profile', data: data);

  static Future<Response> getFollowers(String userId) =>
      _dio.get('/api/users/$userId/followers');

  static Future<Response> getFollowing(String userId) =>
      _dio.get('/api/users/$userId/following');

  // ─── FOLLOW ─────────────────────────────────────────
  static Future<Response> followUser(String userId) =>
      _dio.post('/api/users/$userId/follow');

  static Future<Response> unfollowUser(String userId) =>
      _dio.delete('/api/users/$userId/follow');

  static Future<Response> checkFollow(String userId) =>
      _dio.get('/api/users/$userId/follow');

  // ─── SEARCH ─────────────────────────────────────────
  static Future<Response> searchAll(String query, {String type = 'all'}) =>
      _dio.get('/api/search', queryParameters: {'q': query, 'type': type});

  static Future<Response> getSuggestedUsers() =>
      _dio.get('/api/search/suggested');

  // ─── MEDIA ──────────────────────────────────────────
  static Future<Response> uploadMedia(FormData formData, String folder) =>
      _dio.post(
        '/api/media/upload',
        data: formData,
        queryParameters: {'folder': folder},
        options: Options(headers: {'Content-Type': 'multipart/form-data'}),
      );
}