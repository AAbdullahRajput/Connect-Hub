import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        // Still loading from storage → show splash UI
        if (auth.loading) {
          return const _SplashUI();
        }

        // Loading done → redirect
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (auth.isLoggedIn) {
            Navigator.pushReplacementNamed(context, '/home');
          } else {
            Navigator.pushReplacementNamed(context, '/login');
          }
        });

        return const _SplashUI(); // briefly shown during redirect
      },
    );
  }
}

class _SplashUI extends StatelessWidget {
  const _SplashUI();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/icon/app_icon.png',
              width: 90,
              height: 90,
            ),
            const SizedBox(height: 20),
            RichText(
              text: const TextSpan(
                children: [
                  TextSpan(
                    text: 'Connect',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -1,
                    ),
                  ),
                  TextSpan(
                    text: 'Hub',
                    style: TextStyle(
                      color: Color(0xFF2563EB),
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -1,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Connect with the world',
              style: TextStyle(color: Color(0xFF71717A), fontSize: 14),
            ),
            const SizedBox(height: 60),
            const CircularProgressIndicator(
              color: Color(0xFF2563EB),
              strokeWidth: 2,
            ),
          ],
        ),
      ),
    );
  }
}