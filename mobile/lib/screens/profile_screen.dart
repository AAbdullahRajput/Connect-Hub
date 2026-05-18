import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/post_card.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? profile;
  List<dynamic> posts = [];
  bool loading = true;
  bool isFollowing = false;
  int followersCount = 0;
  String? username;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final arg =
        ModalRoute.of(context)?.settings.arguments as String?;
    if (arg != null && arg != username) {
      username = arg;
      _loadProfile();
    }
  }

  Future<void> _loadProfile() async {
    setState(() => loading = true);
    try {
      final profileRes = await ApiService.getUserProfile(username!);
      final profileData =
          profileRes.data['user'] as Map<String, dynamic>;

      final postsRes = await ApiService.getAllPosts();
      final allPosts = postsRes.data['posts'] ?? [];
      final userPosts = (allPosts as List)
          .where((p) => p['user_id'] == profileData['id'])
          .toList();

      setState(() {
        profile = profileData;
        posts = userPosts;
        followersCount = profileData['followers_count'] ?? 0;
        loading = false;
      });

      final auth = context.read<AuthProvider>();
      if (auth.userId != profileData['id']) {
        try {
          final followRes =
              await ApiService.checkFollow(profileData['id']);
          setState(
              () => isFollowing = followRes.data['is_following'] ?? false);
        } catch (_) {}
      }
    } catch (e) {
      setState(() => loading = false);
    }
  }

  Future<void> _toggleFollow() async {
    final profileId = profile?['id'];
    if (profileId == null) return;
    try {
      if (isFollowing) {
        await ApiService.unfollowUser(profileId);
        setState(() { isFollowing = false; followersCount--; });
      } else {
        await ApiService.followUser(profileId);
        setState(() { isFollowing = true; followersCount++; });
      }
    } catch (e) {
      debugPrint('Follow error: $e');
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    const months = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ];
    return 'Joined ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final isOwn = auth.userId == profile?['id'];

    return Scaffold(
      backgroundColor: Colors.black,
      body: loading
          ? const Center(
              child: CircularProgressIndicator(
                  color: Color(0xFF2563EB)))
          : profile == null
              ? const Center(
                  child: Text('User not found',
                      style: TextStyle(color: Color(0xFFF87171))))
              : CustomScrollView(
                  slivers: [
                    SliverAppBar(
                      expandedHeight: 200,
                      pinned: true,
                      backgroundColor: Colors.black,
                      leading: IconButton(
                        icon: const Icon(Icons.arrow_back,
                            color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                      flexibleSpace: FlexibleSpaceBar(
                        background: profile?['cover_photo'] != null
                            ? Image.network(
                                profile!['cover_photo'],
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) =>
                                    _coverPlaceholder(),
                              )
                            : _coverPlaceholder(),
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: Container(
                        color: const Color(0xFF09090B),
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(
                                  16, 0, 16, 0),
                              child: Row(
                                crossAxisAlignment:
                                    CrossAxisAlignment.end,
                                children: [
                                  Transform.translate(
                                    offset: const Offset(0, -36),
                                    child: Container(
                                      width: 84,
                                      height: 84,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: const Color(
                                              0xFF09090B),
                                          width: 4,
                                        ),
                                      ),
                                      child: CircleAvatar(
                                        radius: 40,
                                        backgroundColor:
                                            const Color(0xFF2563EB),
                                        backgroundImage: profile?[
                                                    'profile_picture'] !=
                                                null
                                            ? NetworkImage(profile![
                                                'profile_picture'])
                                            : null,
                                        child: profile?[
                                                    'profile_picture'] ==
                                                null
                                            ? Text(
                                                (profile?['name'] ??
                                                        'U')[0]
                                                    .toUpperCase(),
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 28,
                                                  fontWeight:
                                                      FontWeight.w700,
                                                ),
                                              )
                                            : null,
                                      ),
                                    ),
                                  ),
                                  const Spacer(),
                                  Padding(
                                    padding: const EdgeInsets.only(
                                        bottom: 12),
                                    child: isOwn
                                        ? OutlinedButton(
                                            onPressed: () {},
                                            style:
                                                OutlinedButton.styleFrom(
                                              side: const BorderSide(
                                                  color: Color(
                                                      0xFF3F3F46)),
                                              shape:
                                                  RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius
                                                        .circular(100),
                                              ),
                                              padding: const EdgeInsets
                                                  .symmetric(
                                                      horizontal: 20,
                                                      vertical: 10),
                                            ),
                                            child: const Text(
                                              'Edit Profile',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 13,
                                                fontWeight:
                                                    FontWeight.w600,
                                              ),
                                            ),
                                          )
                                        : ElevatedButton(
                                            onPressed: _toggleFollow,
                                            style:
                                                ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  isFollowing
                                                      ? const Color(
                                                          0xFF27272A)
                                                      : const Color(
                                                          0xFF2563EB),
                                              shape:
                                                  RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius
                                                        .circular(100),
                                              ),
                                              padding: const EdgeInsets
                                                  .symmetric(
                                                      horizontal: 20,
                                                      vertical: 10),
                                            ),
                                            child: Text(
                                              isFollowing
                                                  ? 'Following'
                                                  : 'Follow',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 13,
                                                fontWeight:
                                                    FontWeight.w600,
                                              ),
                                            ),
                                          ),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.fromLTRB(
                                  16, 0, 16, 4),
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        profile?['name'] ?? '',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 20,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: -0.3,
                                        ),
                                      ),
                                      if (followersCount >= 10) ...[
                                        const SizedBox(width: 6),
                                        const Icon(Icons.verified,
                                            color: Color(0xFF2563EB),
                                            size: 18),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '@${profile?['username'] ?? ''}',
                                    style: const TextStyle(
                                      color: Color(0xFF71717A),
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (profile?['bio'] != null &&
                                profile!['bio']
                                    .toString()
                                    .isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.fromLTRB(
                                    16, 10, 16, 0),
                                child: Text(
                                  profile!['bio'],
                                  style: const TextStyle(
                                    color: Color(0xFFA1A1AA),
                                    fontSize: 14,
                                    height: 1.6,
                                  ),
                                ),
                              ),
                            Padding(
                              padding: const EdgeInsets.fromLTRB(
                                  16, 10, 16, 0),
                              child: Wrap(
                                spacing: 16,
                                children: [
                                  if (profile?['location'] != null)
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(
                                            Icons.location_on_outlined,
                                            color: Color(0xFF52525B),
                                            size: 14),
                                        const SizedBox(width: 4),
                                        Text(
                                          profile!['location'],
                                          style: const TextStyle(
                                            color: Color(0xFF71717A),
                                            fontSize: 13,
                                          ),
                                        ),
                                      ],
                                    ),
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                          Icons.calendar_today_outlined,
                                          color: Color(0xFF52525B),
                                          size: 14),
                                      const SizedBox(width: 4),
                                      Text(
                                        _formatDate(
                                            profile?['created_at']),
                                        style: const TextStyle(
                                          color: Color(0xFF71717A),
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.fromLTRB(
                                  16, 16, 16, 0),
                              child: Row(
                                children: [
                                  _StatItem(
                                      count: posts.length,
                                      label: 'Posts'),
                                  const SizedBox(width: 24),
                                  _StatItem(
                                      count: followersCount,
                                      label: 'Followers'),
                                  const SizedBox(width: 24),
                                  _StatItem(
                                      count: profile?[
                                              'following_count'] ??
                                          0,
                                      label: 'Following'),
                                ],
                              ),
                            ),
                            const Padding(
                              padding: EdgeInsets.only(top: 16),
                              child: Divider(
                                  color: Color(0xFF27272A), height: 1),
                            ),
                            const Padding(
                              padding:
                                  EdgeInsets.fromLTRB(16, 16, 16, 8),
                              child: Text(
                                'Posts',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    posts.isEmpty
                        ? SliverToBoxAdapter(
                            child: Container(
                              color: Colors.black,
                              padding: const EdgeInsets.symmetric(
                                  vertical: 60, horizontal: 20),
                              child: const Column(
                                children: [
                                  Text('📭',
                                      style: TextStyle(fontSize: 48)),
                                  SizedBox(height: 16),
                                  Text('No posts yet',
                                      style: TextStyle(
                                          color: Color(0xFF71717A),
                                          fontSize: 16)),
                                ],
                              ),
                            ),
                          )
                        : SliverPadding(
                            padding: const EdgeInsets.all(12),
                            sliver: SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (context, index) => Padding(
                                  padding:
                                      const EdgeInsets.only(bottom: 12),
                                  child: PostCard(
                                    post: posts[index],
                                    onDelete: (id) {
                                      setState(() =>
                                          posts.removeWhere(
                                              (p) => p['id'] == id));
                                    },
                                  ),
                                ),
                                childCount: posts.length,
                              ),
                            ),
                          ),
                  ],
                ),
    );
  }

  Widget _coverPlaceholder() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0F0F1A), Color(0xFF1E1E3A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final int count;
  final String label;
  const _StatItem({required this.count, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$count',
            style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w800)),
        Text(label,
            style: const TextStyle(
                color: Color(0xFF71717A), fontSize: 13)),
      ],
    );
  }
}