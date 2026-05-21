import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/edit_profile_screen.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/home_screen.dart';
import 'screens/explore_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/post_detail_screen.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();

  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(prefs),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ConnectHub',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF2563EB),
          surface: Color(0xFF18181B),
        ),
      ),
      initialRoute: '/splash',    // ← always start here
      routes: {
        '/splash': (_) => const SplashScreen(),
        '/login': (_) => const LoginScreen(),
        '/signup': (_) => const SignupScreen(),
        '/home': (_) => const HomeScreen(),
        '/explore': (_) => const ExploreScreen(),
        '/profile': (_) => const ProfileScreen(),
        '/post': (_) => const PostDetailScreen(),
        '/edit-profile': (_) => const EditProfileScreen(),
      },
    );
  }
}