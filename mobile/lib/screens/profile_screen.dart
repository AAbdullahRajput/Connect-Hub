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

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  Map<String, dynamic>? profile;
  List<dynamic> posts = [];
  bool loading = true;
  bool isFollowing = false;
  bool followLoading = false;
  int followersCount = 0;
  String? username;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final arg = ModalRoute.of(context)?.settings.arguments as String?;
    if (arg != null && arg != username) {
      username = arg;
      _loadProfile();
    }
  }

  Future<void> _loadProfile() async {
    setState(() => loading = true);
    try {
      final profileRes = await ApiService.getUserProfile(username!);
      final profileData = profileRes.data['user'] as Map<String, dynamic>;

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
          final followRes = await ApiService.checkFollow(profileData['id']);
          setState(() => isFollowing = followRes.data['is_following'] ?? false);
        } catch (_) {}
      }
    } catch (e) {
      setState(() => loading = false);
    }
  }

  Future<void> _toggleFollow() async {
    final profileId = profile?['id'];
    if (profileId == null || followLoading) return;
    setState(() => followLoading = true);
    try {
      if (isFollowing) {
        await ApiService.unfollowUser(profileId);
        setState(() {
          isFollowing = false;
          followersCount--;
        });
      } else {
        await ApiService.followUser(profileId);
        setState(() {
          isFollowing = true;
          followersCount++;
        });
      }
    } catch (e) {
      debugPrint('Follow error: $e');
    } finally {
      setState(() => followLoading = false);
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return 'Joined ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final isOwn = auth.userId == profile?['id'];
    final screenWidth = MediaQuery.of(context).size.width;

    if (loading) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Column(
          children: [
            // Shimmer cover
            Container(
              height: 220,
              color: const Color(0xFF18181B),
            ),
            const SizedBox(height: 60),
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF2563EB)),
            ),
          ],
        ),
      );
    }

    if (profile == null) {
      return Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('😕', style: TextStyle(fontSize: 48)),
              SizedBox(height: 16),
              Text('User not found',
                  style: TextStyle(color: Color(0xFFF87171), fontSize: 16)),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          // ─── Cover + AppBar ─────────────────────────────
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            stretch: true,
            backgroundColor: Colors.black,
            elevation: 0,
            leading: Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.5),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            actions: [
              if (isOwn)
                Container(
                  margin: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.edit_outlined,
                        color: Colors.white, size: 20),
                    onPressed: () {},
                  ),
                ),
              Container(
                margin: const EdgeInsets.only(right: 8, top: 8, bottom: 8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(Icons.more_horiz,
                      color: Colors.white, size: 20),
                  onPressed: () {},
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              stretchModes: const [
                StretchMode.zoomBackground,
                StretchMode.blurBackground,
              ],
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Cover image
                  profile?['cover_photo'] != null
                      ? Image.network(
                          profile!['cover_photo'],
                          fit: BoxFit.cover,
                          alignment: Alignment(
                            0,
                            ((profile?['cover_position'] ?? 50) - 50) / 50,
                          ),
                          errorBuilder: (_, __, ___) => _coverPlaceholder(),
                        )
                      : _coverPlaceholder(),

                  // Gradient overlay bottom
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.transparent,
                          Color(0x80000000),
                          Colors.black,
                        ],
                        stops: [0.0, 0.5, 0.8, 1.0],
                      ),
                    ),
                  ),

                  // Gradient overlay top (for back button)
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Color(0x60000000),
                          Colors.transparent,
                        ],
                        stops: [0.0, 0.3],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ─── Profile Info ────────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              color: Colors.black,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar row
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        // Avatar — overlaps cover
                        Transform.translate(
                          offset: const Offset(0, -44),
                          child: Stack(
                            children: [
                              Container(
                                width: 92,
                                height: 92,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.black,
                                    width: 4,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.4),
                                      blurRadius: 16,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: CircleAvatar(
                                  radius: 44,
                                  backgroundColor: const Color(0xFF2563EB),
                                  backgroundImage:
                                      profile?['profile_picture'] != null
                                          ? NetworkImage(
                                              profile!['profile_picture'])
                                          : null,
                                  child: profile?['profile_picture'] == null
                                      ? Text(
                                          (profile?['name'] ?? 'U')[0]
                                              .toUpperCase(),
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 32,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        )
                                      : null,
                                ),
                              ),
                              // Online indicator
                              Positioned(
                                bottom: 4,
                                right: 4,
                                child: Container(
                                  width: 18,
                                  height: 18,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF22C55E),
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: Colors.black, width: 2.5),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const Spacer(),

                        // Action buttons
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            children: [
                              if (!isOwn) ...[
                                // Message button
                                Container(
                                  width: 40,
                                  height: 40,
                                  margin: const EdgeInsets.only(right: 8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF18181B),
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: const Color(0xFF27272A)),
                                  ),
                                  child: const Icon(
                                    Icons.mail_outline_rounded,
                                    color: Colors.white,
                                    size: 18,
                                  ),
                                ),
                              ],
                              isOwn
                                  ? OutlinedButton(
                                      onPressed: () {},
                                      style: OutlinedButton.styleFrom(
                                        side: const BorderSide(
                                            color: Color(0xFF3F3F46)),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(100),
                                        ),
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 20, vertical: 10),
                                      ),
                                      child: const Text(
                                        '✏️ Edit Profile',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    )
                                  : SizedBox(
                                      height: 38,
                                      child: ElevatedButton(
                                        onPressed: followLoading
                                            ? null
                                            : _toggleFollow,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: isFollowing
                                              ? const Color(0xFF27272A)
                                              : const Color(0xFF2563EB),
                                          disabledBackgroundColor:
                                              const Color(0xFF1E3A6E),
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(100),
                                          ),
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 20),
                                          elevation: 0,
                                        ),
                                        child: followLoading
                                            ? const SizedBox(
                                                width: 16,
                                                height: 16,
                                                child:
                                                    CircularProgressIndicator(
                                                  color: Colors.white,
                                                  strokeWidth: 2,
                                                ),
                                              )
                                            : Text(
                                                isFollowing
                                                    ? '✓ Following'
                                                    : '+ Follow',
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w700,
                                                ),
                                              ),
                                      ),
                                    ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Name + verified
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                    child: Transform.translate(
                      offset: const Offset(0, -28),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                profile?['name'] ?? '',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              if (followersCount >= 10) ...[
                                const SizedBox(width: 6),
                                const Icon(Icons.verified,
                                    color: Color(0xFF2563EB), size: 20),
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

                          // Bio
                          if (profile?['bio'] != null &&
                              profile!['bio'].toString().isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Text(
                              profile!['bio'],
                              style: const TextStyle(
                                color: Color(0xFFD4D4D8),
                                fontSize: 14,
                                height: 1.6,
                              ),
                            ),
                          ],

                          const SizedBox(height: 12),

                          // Meta info
                          Wrap(
                            spacing: 16,
                            runSpacing: 6,
                            children: [
                              if (profile?['location'] != null &&
                                  profile!['location'].toString().isNotEmpty)
                                _MetaChip(
                                  icon: Icons.location_on_outlined,
                                  label: profile!['location'],
                                ),
                              if (profile?['website'] != null &&
                                  profile!['website'].toString().isNotEmpty)
                                _MetaChip(
                                  icon: Icons.link_rounded,
                                  label: profile!['website'],
                                  color: const Color(0xFF60A5FA),
                                ),
                              _MetaChip(
                                icon: Icons.calendar_today_outlined,
                                label: _formatDate(profile?['created_at']),
                              ),
                            ],
                          ),

                          const SizedBox(height: 20),

                          // Stats row
                          Container(
                            padding: const EdgeInsets.symmetric(
                                vertical: 14, horizontal: 16),
                            decoration: BoxDecoration(
                              color: const Color(0xFF18181B),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                  color: const Color(0xFF27272A)),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: _StatBox(
                                    count: posts.length,
                                    label: 'Posts',
                                    icon: '📝',
                                  ),
                                ),
                                Container(
                                  width: 1,
                                  height: 40,
                                  color: const Color(0xFF27272A),
                                ),
                                Expanded(
                                  child: _StatBox(
                                    count: followersCount,
                                    label: 'Followers',
                                    icon: '👥',
                                  ),
                                ),
                                Container(
                                  width: 1,
                                  height: 40,
                                  color: const Color(0xFF27272A),
                                ),
                                Expanded(
                                  child: _StatBox(
                                    count:
                                        profile?['following_count'] ?? 0,
                                    label: 'Following',
                                    icon: '➕',
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Tab bar
                  Transform.translate(
                    offset: const Offset(0, -16),
                    child: Container(
                      decoration: const BoxDecoration(
                        border: Border(
                          bottom: BorderSide(color: Color(0xFF27272A)),
                        ),
                      ),
                      child: TabBar(
                        controller: _tabController,
                        indicatorColor: const Color(0xFF2563EB),
                        indicatorWeight: 2,
                        labelColor: Colors.white,
                        unselectedLabelColor: const Color(0xFF71717A),
                        labelStyle: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                        tabs: const [
                          Tab(text: 'Posts'),
                          Tab(text: 'Liked'),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],

        // ─── Posts Tab ────────────────────────────────────
        body: TabBarView(
          controller: _tabController,
          children: [
            // Posts tab
            posts.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('📭', style: TextStyle(fontSize: 48)),
                        SizedBox(height: 16),
                        Text('No posts yet',
                            style: TextStyle(
                                color: Color(0xFF71717A), fontSize: 16)),
                        SizedBox(height: 8),
                        Text('Posts will appear here',
                            style: TextStyle(
                                color: Color(0xFF52525B), fontSize: 13)),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 20),
                    itemCount: posts.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: 12),
                    itemBuilder: (context, index) => PostCard(
                      post: posts[index],
                      onDelete: (id) {
                        setState(() =>
                            posts.removeWhere((p) => p['id'] == id));
                      },
                    ),
                  ),

            // Liked tab placeholder
            const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('❤️', style: TextStyle(fontSize: 48)),
                  SizedBox(height: 16),
                  Text('Liked posts',
                      style: TextStyle(
                          color: Color(0xFF71717A), fontSize: 16)),
                  SizedBox(height: 8),
                  Text('Coming soon',
                      style: TextStyle(
                          color: Color(0xFF52525B), fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _coverPlaceholder() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF0F0F1A),
            Color(0xFF1A1A3E),
            Color(0xFF0F0F1A),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Icon(
          Icons.image_outlined,
          color: Colors.white.withOpacity(0.1),
          size: 48,
        ),
      ),
    );
  }
}

// ─── Helper Widgets ───────────────────────────────────────
class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _MetaChip({
    required this.icon,
    required this.label,
    this.color = const Color(0xFF71717A),
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: const Color(0xFF52525B), size: 14),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(color: color, fontSize: 13),
        ),
      ],
    );
  }
}

class _StatBox extends StatelessWidget {
  final int count;
  final String label;
  final String icon;

  const _StatBox({
    required this.count,
    required this.label,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          icon,
          style: const TextStyle(fontSize: 16),
        ),
        const SizedBox(height: 4),
        Text(
          '$count',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF71717A),
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}